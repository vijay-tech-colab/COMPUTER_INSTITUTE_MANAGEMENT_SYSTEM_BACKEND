import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Admission from "../models/admission.model.js";
import User from "../models/user.model.js";
import Student from "../models/student.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import CloudinaryService from "../utils/CloudinaryService.js";
import { sendResponse } from "../utils/sendResponse.js";
import { sendEmail } from "../services/email/sendEmail.js";
import { createNotification } from "../utils/notifier.js";
import mongoose from "mongoose";

/**
 * Handle new admission enquiry/application
 */
export const newEnquiry = catchAsyncErrors(async (req, res, next) => {
    const documents = [];

    // Handle multiple document uploads if provided
    if (req.files && req.files.docs) {
        const files = Array.isArray(req.files.docs) ? req.files.docs : [req.files.docs];
        
        for (const file of files) {
            const myCloud = await CloudinaryService.uploadFile(file.tempFilePath, "cims/admissions");
            documents.push({
                name: file.name,
                public_id: myCloud.public_id,
                url: myCloud.url
            });
        }
    }

    const admission = await Admission.create({
        ...req.body,
        documents
    });

    sendResponse(res, 201, "Enquiry submitted successfully", admission);
});

/**
 * Update Admission status (Approved, Rejected, Under Review)
 */
export const updateAdmissionStatus = catchAsyncErrors(async (req, res, next) => {
    const { status, remarks } = req.body;
    
    const admission = await Admission.findByIdAndUpdate(
        req.params.id,
        { status, remarks },
        { new: true, runValidators: true }
    );

    if (!admission) {
        return next(new ErrorHandler("Admission record not found", 404));
    }

    sendResponse(res, 200, `Status updated to ${status}`, admission);
});

/**
 * Official Enrollment: Convert approved admission to a permanent Student/User
 */
export const convertToStudent = catchAsyncErrors(async (req, res, next) => {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
        return next(new ErrorHandler("Admission record not found", 404));
    }

    if (admission.status !== "Approved") {
        return next(new ErrorHandler("Only approved admissions can be enrolled", 400));
    }

    const defaultPassword = req.body.password || "Student@123";

    // 1. Create User account for the student
    const user = await User.create({
        name: admission.fullName,
        email: admission.email,
        password: defaultPassword,
        role: "student",
        phone: admission.phone,
        avatar: admission.documents[0] ? { // Use first doc as temporary avatar if exists
            public_id: admission.documents[0].public_id,
            url: admission.documents[0].url
        } : { public_id: "default", url: "default-url" }
    });

    // 2. Create Student profile record
    const student = await Student.create({
        user: user._id,
        registrationNo: `STU-${Date.now()}`,
        dob: admission.dateOfBirth,
        address: { current: admission.address },
        guardian: { name: admission.guardianName },
        enrolledCourses: [admission.interestedCourse],
    });

    // 3. Initialize Fee Structure for the student
    const course = await mongoose.model("Course").findById(admission.interestedCourse);
    if (course) {
        await mongoose.model("Fee").create({
            student: user._id,
            course: course._id,
            totalAmount: course.feeStructure.totalFee,
            status: "Pending"
        });
    }

    // 4. Update Admission status to Enrolled and link student
    admission.status = "Enrolled";
    admission.enrolledStudent = user._id;
    await admission.save();

    // 5. Send Enrollment Email with Credentials
    try {
        await sendEmail({
            email: user.email,
            subject: "Welcome to CIMS - Admission Confirmed 🎉",
            template: "enrollmentSuccess",
            data: {
                name: user.name,
                email: user.email,
                password: defaultPassword,
                url: `${process.env.FRONTEND_URL}/login`
            }
        });
        
        // In-app Notification
        await createNotification(
            user._id, 
            "Admission Confirmed!", 
            "Welcome to CIMS! Your student portal is now active.",
            "General"
        );
    } catch (error) {
        console.log("Notification/Email failed:", error.message);
    }

    sendResponse(res, 201, "Student enrolled successfully", { user, student });
});

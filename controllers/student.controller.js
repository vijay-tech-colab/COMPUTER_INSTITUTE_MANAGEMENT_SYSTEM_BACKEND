import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Student from "../models/student.model.js";
import User from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { sendResponse } from "../utils/sendResponse.js";
import CloudinaryService from "../utils/CloudinaryService.js";

/**
 * Get all students with search, filter, and pagination
 */
export const getAllStudents = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = 10;
    const studentsCount = await Student.countDocuments();

    const apiFeature = new ApiFeatures(Student.find().populate("user"), req.query)
        .search(["registrationNo"]) // Search by Roll No
        .filter()
        .pagination(resultPerPage);

    const students = await apiFeature.query;

    res.status(200).json({
        success: true,
        count: students.length,
        totalStudents: studentsCount,
        resultPerPage,
        students,
    });
});

/**
 * Get detailed student profile
 */
export const getStudentById = catchAsyncErrors(async (req, res, next) => {
    const student = await Student.findById(req.params.id)
        .populate("user")
        .populate("currentBatch")
        .populate("enrolledCourses");

    if (!student) {
        return next(new ErrorHandler("Student not found", 404));
    }

    sendResponse(res, 200, "Student details fetched", student);
});

/**
 * Update Student Info (and optionally User basic info)
 */
export const updateStudentInfo = catchAsyncErrors(async (req, res, next) => {
    let student = await Student.findById(req.params.id);

    if (!student) {
        return next(new ErrorHandler("Student not found", 404));
    }

    // Update basics in User model if provided
    if (req.body.name || req.body.phone) {
        await User.findByIdAndUpdate(student.user, {
            name: req.body.name,
            phone: req.body.phone
        });
    }

    student = await Student.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    sendResponse(res, 200, "Student record updated successfully", student);
});

/**
 * Permanently delete student and their user account
 */
export const deleteStudent = catchAsyncErrors(async (req, res, next) => {
    const student = await Student.findById(req.params.id);

    if (!student) {
        return next(new ErrorHandler("Student not found", 404));
    }

    const user = await User.findById(student.user);

    // Delete avatar from Cloudinary if exists
    if (user && user.avatar && user.avatar.public_id !== "default") {
        await CloudinaryService.deleteFile(user.avatar.public_id);
    }

    // Delete records
    await student.deleteOne();
    if (user) await user.deleteOne();

    sendResponse(res, 200, "Student and associated account deleted successfully");
});

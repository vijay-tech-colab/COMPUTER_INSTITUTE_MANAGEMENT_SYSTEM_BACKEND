import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Student from "../models/student.model.js";
import User from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { sendResponse } from "../utils/sendResponse.js";
import CloudinaryService from "../utils/CloudinaryService.js";
import { getCache, setCache, deleteByPrefix, deleteCache } from "../utils/redis.js";
import { createNotification } from "../utils/notifier.js";

/**
 * Get all students with search, filter, and pagination
 */
export const getAllStudents = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = 10;
    const branch = req.query.branch || req.user.branch;

    const cacheKey = `students:${branch}:${JSON.stringify(req.query)}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
        return res.status(200).json({
            success: true,
            ...cachedData,
            fromCache: true
        });
    }

    const studentsCount = await Student.countDocuments({ branch });

    const apiFeature = new ApiFeatures(Student.find({ branch }).populate("user"), req.query)
        .search(["registrationNo"]) // Search by Roll No
        .filter()
        .pagination(resultPerPage);

    const students = await apiFeature.query;

    const responseData = {
        count: students.length,
        totalStudents: studentsCount,
        resultPerPage,
        students,
    };

    await setCache(cacheKey, responseData, 3600);

    res.status(200).json({
        success: true,
        ...responseData
    });
});

/**
 * Get detailed student profile
 */
export const getStudentById = catchAsyncErrors(async (req, res, next) => {
    const cacheKey = `student:${req.params.id}`;
    const cachedStudent = await getCache(cacheKey);

    if (cachedStudent) {
        return sendResponse(res, 200, "Student details fetched (cached)", cachedStudent);
    }

    const student = await Student.findById(req.params.id)
        .populate("user")
        .populate("currentBatch")
        .populate("enrolledCourses");

    if (!student) {
        return next(new ErrorHandler("Student not found", 404));
    }

    await setCache(cacheKey, student, 3600);

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

    // Invalidate Cache
    await deleteCache(`student:${req.params.id}`);
    await deleteByPrefix(`students:${student.branch}`);

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "Student Updated",
        message: `Profile for ${student.user.name || 'Student'} was updated.`,
        type: "Activity",
        resource: "Student",
        resourceId: student._id,
        action: "update",
        branch: student.branch
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

    const branchId = student.branch;
    // Delete records
    await student.deleteOne();
    if (user) await user.deleteOne();

    // Invalidate Cache
    await deleteCache(`student:${req.params.id}`);
    await deleteByPrefix(`students:${branchId}`);

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "Student Deleted",
        message: `Student record was removed from the system.`,
        type: "Activity",
        resource: "Student",
        action: "delete",
        branch: branchId
    });

    sendResponse(res, 200, "Student and associated account deleted successfully");
});

import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Batch from "../models/batch.model.js";
import Student from "../models/student.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendResponse } from "../utils/sendResponse.js";
import ApiFeatures from "../utils/ApiFeatures.js";

/**
 * Create a new academic batch
 */
export const createBatch = catchAsyncErrors(async (req, res, next) => {
    const batch = await Batch.create(req.body);

    sendResponse(res, 201, "Batch created successfully", batch);
});

/**
 * Get all batches with course and faculty population
 */
export const getBatches = catchAsyncErrors(async (req, res, next) => {
    const apiFeature = new ApiFeatures(
        Batch.find().populate("course").populate("faculty", "name email phone"),
        req.query
    ).filter();

    const batches = await apiFeature.query;

    res.status(200).json({
        success: true,
        count: batches.length,
        batches,
    });
});

/**
 * Add a student to a specific batch
 */
export const addStudentToBatch = catchAsyncErrors(async (req, res, next) => {
    const { studentId, batchId } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) return next(new ErrorHandler("Batch not found", 404));

    // Check seat limit
    if (batch.students.length >= batch.seatLimit) {
        return next(new ErrorHandler("Batch is full", 400));
    }

    // Update Student record
    const student = await Student.findById(studentId);
    if (!student) return next(new ErrorHandler("Student profile not found", 404));

    // Prevent duplicates
    if (batch.students.includes(student.user)) {
        return next(new ErrorHandler("Student already assigned to this batch", 400));
    }

    batch.students.push(student.user);
    await batch.save();

    student.currentBatch = batchId;
    await student.save();

    sendResponse(res, 200, "Student assigned to batch successfully");
});

/**
 * Update batch details (schedule, faculty, status)
 */
export const updateBatch = catchAsyncErrors(async (req, res, next) => {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!batch) {
        return next(new ErrorHandler("Batch not found", 404));
    }

    sendResponse(res, 200, "Batch updated successfully", batch);
});

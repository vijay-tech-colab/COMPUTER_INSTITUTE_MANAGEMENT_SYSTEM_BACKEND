import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Batch from "../models/batch.model.js";
import Student from "../models/student.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendResponse } from "../utils/sendResponse.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { getCache, setCache, deleteByPrefix } from "../utils/redis.js";
import { createNotification } from "../utils/notifier.js";

/**
 * Create a new academic batch
 */
export const createBatch = catchAsyncErrors(async (req, res, next) => {
    if (!req.body.branch) req.body.branch = req.user.branch;
    const batch = await Batch.create(req.body);

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "New Batch Created",
        message: `Batch ${batch.name} was created for branch.`,
        type: "Activity",
        resource: "Batch",
        resourceId: batch._id,
        action: "create",
        branch: batch.branch
    });

    // Invalidate Cache
    await deleteByPrefix(`batches:${req.body.branch}`);

    sendResponse(res, 201, "Batch created successfully", batch);
});

/**
 * Get all batches with course and faculty population
 */
export const getBatches = catchAsyncErrors(async (req, res, next) => {
    const branch = req.query.branch || req.user.branch;
    const cacheKey = `batches:${branch}:${JSON.stringify(req.query)}`;
    const cached = await getCache(cacheKey);

    if (cached) return res.status(200).json({ success: true, count: cached.length, batches: cached, fromCache: true });

    const apiFeature = new ApiFeatures(
        Batch.find({ branch }).populate("course").populate("faculty", "name email phone"),
        req.query
    ).filter();

    const batches = await apiFeature.query;
    await setCache(cacheKey, batches, 3600);

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

    // Invalidate Cache
    await deleteByPrefix(`batches:${batch.branch}`);

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "Student Assigned to Batch",
        message: `A student was added to batch ${batch.name}.`,
        type: "Activity",
        resource: "Batch",
        resourceId: batch._id,
        action: "update",
        branch: batch.branch
    });

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

    // Invalidate Cache
    await deleteByPrefix(`batches:${batch.branch}`);

    sendResponse(res, 200, "Batch updated successfully", batch);
});

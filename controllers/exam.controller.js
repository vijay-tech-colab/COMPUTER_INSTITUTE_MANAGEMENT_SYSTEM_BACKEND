import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Exam from "../models/exam.model.js";
import Result from "../models/result.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendResponse } from "../utils/sendResponse.js";
import { getCache, setCache, deleteByPrefix } from "../utils/redis.js";
import { createNotification } from "../utils/notifier.js";

/**
 * Schedule a new Exam
 */
export const createExam = catchAsyncErrors(async (req, res, next) => {
    if (!req.body.branch) req.body.branch = req.user.branch;
    const exam = await Exam.create(req.body);

    // Invalidate Cache
    await deleteByPrefix(`exams:${req.body.branch}`);

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "Exam Scheduled",
        message: `New exam '${exam.title}' scheduled for branch.`,
        type: "Activity",
        resource: "Exam",
        resourceId: exam._id,
        action: "create",
        branch: exam.branch
    });

    sendResponse(res, 201, "Exam scheduled successfully", exam);
});

/**
 * Upload Marks for students in an exam
 */
export const uploadMarks = catchAsyncErrors(async (req, res, next) => {
    const { examId, results } = req.body; // results: [{ studentId, marksObtained, remarks }]

    const exam = await Exam.findById(examId);
    if (!exam) return next(new ErrorHandler("Exam not found", 404));

    const uploadedResults = [];

    for (const item of results) {
        const percentage = (item.marksObtained / exam.maxMarks) * 100;
        const status = percentage >= (exam.passingMarks / exam.maxMarks) * 100 ? "Pass" : "Fail";

        // Logic for Grade
        let grade = "F";
        if (percentage >= 90) grade = "A+";
        else if (percentage >= 80) grade = "A";
        else if (percentage >= 70) grade = "B";
        else if (percentage >= 60) grade = "C";
        else if (percentage >= 50) grade = "D";

        const result = await Result.findOneAndUpdate(
            { exam: examId, student: item.studentId },
            {
                marksObtained: item.marksObtained,
                percentage: percentage.toFixed(2),
                grade,
                status,
                remarks: item.remarks,
                branch: req.body.branch || req.user.branch
            },
            { new: true, upsert: true }
        );
        uploadedResults.push(result);
        // Invalidate Cache for this student
        await deleteByPrefix(`results:stu:${item.studentId}`);
    }

    // Invalidate branch stats
    await deleteByPrefix(`stats:exams:${req.body.branch || req.user.branch}`);

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "Marks Uploaded",
        message: `Marks for exam '${exam.title}' were updated.`,
        type: "Activity",
        resource: "Exam",
        resourceId: exam._id,
        action: "update",
        branch: exam.branch
    });

    sendResponse(res, 200, "Marks uploaded successfully", uploadedResults);
});

/**
 * Get Student's performance across all exams
 */
export const getStudentPerformance = catchAsyncErrors(async (req, res, next) => {
    const { studentId } = req.params;
    const branch = req.query.branch || req.user.branch;

    const cacheKey = `results:stu:${studentId}:${branch}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json({ success: true, count: cached.length, results: cached, fromCache: true });

    const results = await Result.find({ student: studentId, branch })
        .populate("exam", "title examType date maxMarks")
        .sort({ createdAt: -1 });

    await setCache(cacheKey, results, 3600);

    res.status(200).json({
        success: true,
        count: results.length,
        results
    });
});

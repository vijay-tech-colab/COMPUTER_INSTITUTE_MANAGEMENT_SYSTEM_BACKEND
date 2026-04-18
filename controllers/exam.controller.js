import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Exam from "../models/exam.model.js";
import Result from "../models/result.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendResponse } from "../utils/sendResponse.js";

/**
 * Schedule a new Exam
 */
export const createExam = catchAsyncErrors(async (req, res, next) => {
    const exam = await Exam.create(req.body);

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
                remarks: item.remarks
            },
            { new: true, upsert: true }
        );
        uploadedResults.push(result);
    }

    sendResponse(res, 200, "Marks uploaded successfully", uploadedResults);
});

/**
 * Get Student's performance across all exams
 */
export const getStudentPerformance = catchAsyncErrors(async (req, res, next) => {
    const { studentId } = req.params;

    const results = await Result.find({ student: studentId })
        .populate("exam", "title examType date maxMarks")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: results.length,
        results
    });
});

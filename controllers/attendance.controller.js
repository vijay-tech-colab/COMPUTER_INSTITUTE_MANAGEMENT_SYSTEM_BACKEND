import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Attendance from "../models/attendance.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendResponse } from "../utils/sendResponse.js";

/**
 * Mark or Update Daily Attendance
 */
export const markAttendance = catchAsyncErrors(async (req, res, next) => {
    const { date, batch, records } = req.body;

    if (!batch || !records) {
        return next(new ErrorHandler("Batch and student records are required", 400));
    }

    // Upsert logic: Update if exists for that day/batch, else create
    let attendance = await Attendance.findOne({ 
        batch, 
        date: new Date(date).setHours(0,0,0,0) 
    });

    if (attendance) {
        attendance.records = records;
        attendance.markedBy = req.user._id;
        await attendance.save();
    } else {
        attendance = await Attendance.create({
            date: new Date(date).setHours(0,0,0,0),
            batch,
            records,
            markedBy: req.user._id
        });
    }

    sendResponse(res, 200, "Attendance marked successfully", attendance);
});

/**
 * Get Attendance logs for a batch
 */
export const getAttendanceByBatch = catchAsyncErrors(async (req, res, next) => {
    const { batchId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { batch: batchId };
    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const logs = await Attendance.find(query)
        .populate("records.student", "name email phone")
        .sort({ date: -1 });

    res.status(200).json({
        success: true,
        count: logs.length,
        logs
    });
});

/**
 * Get specific student's attendance summary
 */
export const getStudentAttendanceSummary = catchAsyncErrors(async (req, res, next) => {
    const { studentId, batchId } = req.params;

    const attendanceRecords = await Attendance.find({
        batch: batchId,
        "records.student": studentId
    });

    let presentCount = 0;
    attendanceRecords.forEach(record => {
        const studentRec = record.records.find(r => r.student.toString() === studentId);
        if (studentRec && studentRec.status === "Present") presentCount++;
    });

    const totalDays = attendanceRecords.length;
    const percentage = totalDays > 0 ? (presentCount / totalDays) * 100 : 0;

    res.status(200).json({
        success: true,
        summary: {
            totalDays,
            presentDays: presentCount,
            absentDays: totalDays - presentCount,
            percentage: percentage.toFixed(2) + "%"
        }
    });
});

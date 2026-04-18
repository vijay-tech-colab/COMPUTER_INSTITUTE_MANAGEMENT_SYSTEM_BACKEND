import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Student from "../models/student.model.js";
import Staff from "../models/staff.model.js";
import Admission from "../models/admission.model.js";
import Fee from "../models/fee.model.js";
import Batch from "../models/batch.model.js";
import Attendance from "../models/attendance.model.js";
import Course from "../models/course.model.js";
import Exam from "../models/exam.model.js";
import Result from "../models/result.model.js";
import Notification from "../models/notification.model.js";
import Book from "../models/book.model.js";

// ================= ADMIN DASHBOARD WIDGETS =================

export const getAdminStudentStats = catchAsyncErrors(async (req, res, next) => {
    const total = await Student.countDocuments();
    const active = await Student.countDocuments({ status: "active" });
    res.status(200).json({ success: true, total, active });
});

export const getAdminFinancialStats = catchAsyncErrors(async (req, res, next) => {
    const feeRecords = await Fee.find({}, "totalAmount paidAmount");
    const stats = feeRecords.reduce((acc, curr) => {
        acc.totalExpected += curr.totalAmount;
        acc.totalCollected += curr.paidAmount;
        return acc;
    }, { totalExpected: 0, totalCollected: 0 });

    res.status(200).json({
        success: true,
        totalExpected: stats.totalExpected,
        totalCollected: stats.totalCollected,
        outstanding: stats.totalExpected - stats.totalCollected
    });
});

export const getAdminAdmissionStats = catchAsyncErrors(async (req, res, next) => {
    const totalEnquiries = await Admission.countDocuments({ status: "Enquiry" });
    const recent = await Admission.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json({ success: true, totalEnquiries, recent });
});

export const getAdminCourseDistribution = catchAsyncErrors(async (req, res, next) => {
    const courses = await Course.find({}, "name");
    const distribution = await Promise.all(courses.map(async (course) => {
        const studentCount = await Student.countDocuments({ enrolledCourses: course._id });
        return { name: course.name, studentCount };
    }));
    res.status(200).json({ success: true, distribution });
});

// ================= STAFF DASHBOARD WIDGETS =================

export const getStaffBatchStats = catchAsyncErrors(async (req, res, next) => {
    const batches = await Batch.find({ faculty: req.user._id }).populate("course", "name");
    res.status(200).json({ success: true, batches });
});

export const getStaffTodaySchedule = catchAsyncErrors(async (req, res, next) => {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const batches = await Batch.find({
        faculty: req.user._id,
        "schedule.day": day
    }).populate("course", "name");

    res.status(200).json({ success: true, todaySchedule: batches });
});

// ================= STUDENT DASHBOARD WIDGETS =================

export const getStudentAttendanceStats = catchAsyncErrors(async (req, res, next) => {
    const student = await Student.findOne({ user: req.user._id });
    if (!student || !student.currentBatch) {
        return res.status(200).json({ success: true, percentage: "0%" });
    }
    const totalClasses = await Attendance.countDocuments({ batch: student.currentBatch });
    const presentClasses = await Attendance.countDocuments({
        batch: student.currentBatch,
        "records.student": req.user._id,
        "records.status": "Present"
    });
    const percentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;
    res.status(200).json({ success: true, percentage: `${percentage}%` });
});

export const getStudentFeeStats = catchAsyncErrors(async (req, res, next) => {
    const fee = await Fee.findOne({ student: req.user._id });
    res.status(200).json({ success: true, fee });
});

export const getStudentLatestResults = catchAsyncErrors(async (req, res, next) => {
    const results = await Result.find({ student: req.user._id })
        .populate("exam", "title date")
        .sort({ createdAt: -1 })
        .limit(3);
    res.status(200).json({ success: true, results });
});

export const getStudentNotifications = catchAsyncErrors(async (req, res, next) => {
    const notifications = await Notification.find({ recipient: req.user._id, status: "Unread" })
        .sort({ createdAt: -1 })
        .limit(5);
    res.status(200).json({ success: true, notifications });
});

export const getStudentLibrarySummary = catchAsyncErrors(async (req, res, next) => {
    // Books borrowed logic could be here if we had a Borrow model, 
    // for now let's just show total available books as a placeholder or empty list
    const availableBooks = await Book.countDocuments({ status: "Available" });
    res.status(200).json({ success: true, availableBooks });
});


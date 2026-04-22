import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Admission from "../models/admission.model.js";
import Attendance from "../models/attendance.model.js";
import Student from "../models/student.model.js";
import Fee from "../models/fee.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";

// Specific Report Logics
import { generateAdmissionFormPDF } from "../reports/pdf/admissionForm.js";
import { generateFeeReceiptPDF } from "../reports/pdf/feeReceipt.js";
import { generateStudentsExcel } from "../reports/excel/studentsReport.js";

/**
 * Generate PDF Fee Receipt
 */
export const generateFeeReceipt = catchAsyncErrors(async (req, res, next) => {
    const { feeId, paymentId } = req.params;

    const branch = req.query.branch || req.user.branch;
    const fee = await Fee.findOne({ _id: feeId, branch }).populate("student").populate("course");
    if (!fee) return next(new ErrorHandler("Fee record not found in this branch", 404));

    const payment = fee.payments.id(paymentId);
    if (!payment) return next(new ErrorHandler("Payment record not found", 404));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt_${payment.receiptNo}.pdf`);

    // Use the specialized PDF logic
    generateFeeReceiptPDF({ fee, payment }, res);
});

/**
 * Generate Admission Form PDF
 */
export const generateAdmissionReport = catchAsyncErrors(async (req, res, next) => {
    const branch = req.query.branch || req.user.branch;
    const admission = await Admission.findOne({ _id: req.params.id, branch });
    if (!admission) return next(new ErrorHandler("Admission record not found in this branch", 404));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=admission_${admission._id}.pdf`);

    // Use the specialized PDF logic
    generateAdmissionFormPDF(admission, res);
});

/**
 * Export all students to Excel
 */
export const exportStudentsExcel = catchAsyncErrors(async (req, res, next) => {
    const branch = req.query.branch || req.user.branch;
    const students = await Student.find({ branch }).populate("user", "name email phone");

    const data = students.map(s => ({
        RegNo: s.registrationNo,
        Name: s.user?.name,
        Email: s.user?.email,
        Phone: s.user?.phone,
        Gender: s.gender,
        AdmissionDate: s.createdAt.toLocaleDateString()
    }));

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=students_list.xlsx`);

    await generateStudentsExcel(data, res);
});

/**
 * Export Attendance Report (Placeholder)
 */
export const exportAttendanceExcel = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({ success: true, message: "Attendance Excel Export logic will be here" });
});

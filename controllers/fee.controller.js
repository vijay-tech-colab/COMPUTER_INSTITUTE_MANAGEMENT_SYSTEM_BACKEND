import { sendEmail } from "../services/email/sendEmail.js";
import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Fee from "../models/fee.model.js";
import User from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendResponse } from "../utils/sendResponse.js";
import { getCache, setCache, deleteByPrefix } from "../utils/redis.js";
import { createNotification } from "../utils/notifier.js";

/**
 * Record a new Fee Payment
 */
export const recordPayment = catchAsyncErrors(async (req, res, next) => {
    const { studentId, courseId, amount, method, transactionId, remarks, discount } = req.body;
    const branch = req.body.branch || req.user.branch;

    let feeRecord = await Fee.findOne({ student: studentId, course: courseId, branch });

    if (!feeRecord) {
        return next(new ErrorHandler("Fee structure not initialized for this branch", 404));
    }

    const receiptNo = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    feeRecord.payments.push({
        amount, method, transactionId, receiptNo, remarks, date: Date.now()
    });

    feeRecord.paidAmount += Number(amount);
    if (discount) feeRecord.discount = discount;
    feeRecord.status = feeRecord.paidAmount >= (feeRecord.totalAmount - feeRecord.discount) ? "Paid" : "Partial";

    await feeRecord.save();

    // Invalidate Cache for stats and reports
    await deleteByPrefix(`stats:finance:${branch}`);
    await deleteByPrefix(`fees:reports:${branch}`);

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "Payment Received",
        message: `₹${amount} paid for student ${user?.name || 'Student'}. Receipt: ${receiptNo}`,
        type: "Activity",
        resource: "Fee",
        resourceId: feeRecord._id,
        action: "update",
        branch
    });

    // Send Notifications
    const user = await User.findById(studentId);
    if (user) {
        try {
            await sendEmail({
                email: user.email,
                subject: "Fee Payment Received ✅",
                template: "paymentReceipt",
                data: {
                    name: user.name,
                    amount,
                    receiptNo
                }
            });

            // In-app Notification
            await createNotification(
                user._id,
                "Payment Received!",
                `Amount ₹${amount} received. Receipt No: ${receiptNo}`,
                "Fee Alert"
            );
        } catch (error) {
            console.log("Notification failed");
        }
    }

    sendResponse(res, 200, "Payment recorded successfully", { receiptNo, feeRecord });
});

/**
 * Get Specific Student's Fee Status
 */
export const getStudentFeeStatus = catchAsyncErrors(async (req, res, next) => {
    const { studentId } = req.params;
    const branch = req.query.branch || req.user.branch;
    const feeRecords = await Fee.find({ student: studentId, branch }).populate("course", "name code");
    res.status(200).json({ success: true, feeRecords });
});

/**
 * Financial Collection Reports
 */
export const getCollectionReports = catchAsyncErrors(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const branch = req.query.branch || req.user.branch;

    const cacheKey = `fees:reports:${branch}:${JSON.stringify(req.query)}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json({ success: true, ...cached, fromCache: true });

    const query = { branch };
    if (startDate && endDate) {
        query["payments.date"] = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const records = await Fee.find(query).populate("student", "name").populate("course", "name");

    let totalCollection = 0;
    records.forEach(rec => {
        rec.payments.forEach(p => { totalCollection += p.amount; });
    });

    const responseData = { totalCollection, records };
    await setCache(cacheKey, responseData, 600); // 10 mins

    res.status(200).json({ success: true, ...responseData });
});

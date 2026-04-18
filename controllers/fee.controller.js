import { sendEmail } from "../services/email/sendEmail.js";
import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import { createNotification } from "../utils/notifier.js";

/**
 * Record a new Fee Payment
 */
export const recordPayment = catchAsyncErrors(async (req, res, next) => {
    const { studentId, courseId, amount, method, transactionId, remarks, discount } = req.body;

    let feeRecord = await Fee.findOne({ student: studentId, course: courseId });

    if (!feeRecord) {
        return next(new ErrorHandler("Fee structure not initialized", 404));
    }

    const receiptNo = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    feeRecord.payments.push({
        amount, method, transactionId, receiptNo, remarks, date: Date.now()
    });

    feeRecord.paidAmount += Number(amount);
    if (discount) feeRecord.discount = discount;
    feeRecord.status = feeRecord.paidAmount >= (feeRecord.totalAmount - feeRecord.discount) ? "Paid" : "Partial";

    await feeRecord.save();

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
    const feeRecords = await Fee.find({ student: studentId }).populate("course", "name code");
    res.status(200).json({ success: true, feeRecords });
});

/**
 * Financial Collection Reports
 */
export const getCollectionReports = catchAsyncErrors(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate && endDate) {
        query["payments.date"] = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const records = await Fee.find(query).populate("student", "name").populate("course", "name");

    let totalCollection = 0;
    records.forEach(rec => {
        rec.payments.forEach(p => { totalCollection += p.amount; });
    });

    res.status(200).json({ success: true, totalCollection, records });
});

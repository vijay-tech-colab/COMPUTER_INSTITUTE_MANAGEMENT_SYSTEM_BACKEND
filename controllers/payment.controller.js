import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendResponse } from "../utils/sendResponse.js";
import Fee from "../models/fee.model.js";

/**
 * Initialize Razorpay instance
 */
const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

/**
 * Create a new Razorpay Order
 */
export const createOrder = catchAsyncErrors(async (req, res, next) => {
    const { amount, currency = "INR" } = req.body;

    const instance = getRazorpayInstance();

    const options = {
        amount: Number(amount) * 100, // Razorpay amount is in paise
        currency,
        receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
        success: true,
        order,
    });
});

/**
 * Verify Payment Signature and update Fee record
 */
export const verifyPayment = catchAsyncErrors(async (req, res, next) => {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        studentId,
        courseId,
        amount 
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Update Fee Record in DB
        let feeRecord = await Fee.findOne({ student: studentId, course: courseId });

        if (feeRecord) {
            feeRecord.payments.push({
                amount: Number(amount),
                method: "Razorpay",
                transactionId: razorpay_payment_id,
                receiptNo: `RPAY-${Date.now()}`,
                date: Date.now()
            });

            feeRecord.paidAmount += Number(amount);
            feeRecord.status = feeRecord.paidAmount >= (feeRecord.totalAmount - feeRecord.discount) ? "Paid" : "Partial";
            
            await feeRecord.save();
        }

        sendResponse(res, 200, "Payment Verified & Recorded Successfully", {
            payment_id: razorpay_payment_id
        });

    } else {
        return next(new ErrorHandler("Payment verification failed", 400));
    }
});

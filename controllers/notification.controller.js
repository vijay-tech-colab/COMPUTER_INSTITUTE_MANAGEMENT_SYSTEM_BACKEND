import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendResponse } from "../utils/sendResponse.js";
import { getCache, setCache, deleteByPrefix, deleteCache } from "../utils/redis.js";
import { sendEmail } from "../services/email/sendEmail.js";

/**
 * Get current user's notifications
 */
export const getMyNotifications = catchAsyncErrors(async (req, res, next) => {
    const branch = req.query.branch || req.user.branch;
    const cacheKey = `notif:${req.user._id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json({ success: true, notifications: cached, fromCache: true });

    const notifications = await Notification.find({ recipient: req.user._id, branch })
        .sort({ createdAt: -1 });

    await setCache(cacheKey, notifications, 300); // 5 mins

    res.status(200).json({
        success: true,
        notifications
    });
});

/**
 * Mark notification as Read
 */
export const markAsRead = catchAsyncErrors(async (req, res, next) => {
    const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { status: "Read" },
        { new: true }
    );

    // Invalidate Cache
    await deleteCache(`notif:${req.user._id}`);
    await deleteByPrefix(`dashboard:notif:${req.user._id}`);

    sendResponse(res, 200, "Notification marked as read");
});

/**
 * Send Bulk Announcement / Notification (with Email support)
 */
export const sendBulkNotification = catchAsyncErrors(async (req, res, next) => {
    const { title, message, type, roles, sendViaEmail } = req.body;

    // Fetch recipients based on roles and branch
    const branch = req.body.branch || req.user.branch;
    const recipients = await User.find({ 
        role: { $in: roles || ['student'] },
        branch
    });

    const notificationData = recipients.map(user => ({
        recipient: user._id,
        title,
        message,
        type: type || 'Announcement',
        branch
    }));

    // Save notifications to DB
    await Notification.insertMany(notificationData);

    // Invalidate Cache for all recipients
    for (const data of notificationData) {
        await deleteCache(`notif:${data.recipient}`);
        await deleteByPrefix(`dashboard:notif:${data.recipient}`);
    }

    // Send emails if requested
    if (sendViaEmail) {
        // Ideally use a background worker here, but for now:
        for (const user of recipients) {
            try {
                await sendEmail({
                    email: user.email,
                    subject: title,
                    html: `<h3>${title}</h3><p>${message}</p>`
                });
            } catch (err) {
                console.log(`Failed to send email to ${user.email}`);
            }
        }
    }

    sendResponse(res, 201, `Notification sent to ${recipients.length} users`);
});

import Notification from "../models/notification.model.js";

/**
 * Creates an in-app notification for a user
 * @param {string} userId - Recipient ID
 * @param {string} title - Notification title
 * @param {string} message - Detailed message
 * @param {string} type - 'Fee Alert', 'Attendance', 'Exam Result', 'General', 'Announcement'
 */
export const createNotification = async (userId, title, message, type = "General") => {
    try {
        await Notification.create({
            recipient: userId,
            title,
            message,
            type
        });
    } catch (error) {
        console.error("Failed to create in-app notification:", error.message);
    }
};

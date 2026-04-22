import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

/**
 * Creates an in-app notification or activity logs
 */
export const createNotification = async ({
    recipient,
    sender,
    title,
    message,
    type = "General",
    resource,
    resourceId,
    action,
    branch
}) => {
    try {
        // If recipient is NOT provided, it might be a broadcast or admin alert
        // For simplicity, if no recipient, we send to branch admins
        let finalRecipients = Array.isArray(recipient) ? recipient : [recipient];

        if (!recipient && branch) {
            const admins = await User.find({ role: 'admin', branch }).select('_id');
            finalRecipients = admins.map(a => a._id);
        }

        const notifications = finalRecipients.map(recId => ({
            recipient: recId,
            sender,
            title,
            message,
            type,
            resource,
            resourceId,
            action,
            branch
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error("Failed to create notifications:", error.message);
    }
};

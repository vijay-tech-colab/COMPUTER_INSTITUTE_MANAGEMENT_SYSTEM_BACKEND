import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['Fee Alert', 'Attendance', 'Exam Result', 'General', 'Announcement', 'Activity'],
        default: 'General'
    },
    resource: { type: String }, // e.g., 'Student', 'Course'
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    action: {
        type: String,
        enum: ['create', 'update', 'delete', 'other'],
        default: 'other'
    },
    status: {
        type: String,
        enum: ['Unread', 'Read'],
        default: 'Unread'
    },
    sendVia: {
        type: [String],
        default: ['In-app']
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

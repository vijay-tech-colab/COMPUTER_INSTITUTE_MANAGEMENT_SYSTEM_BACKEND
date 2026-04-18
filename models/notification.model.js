import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['Fee Alert', 'Attendance', 'Exam Result', 'General', 'Announcement'],
        default: 'General'
    },
    status: {
        type: String,
        enum: ['Unread', 'Read'],
        default: 'Unread'
    },
    sendVia: {
        type: [String],
        default: ['In-app']
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

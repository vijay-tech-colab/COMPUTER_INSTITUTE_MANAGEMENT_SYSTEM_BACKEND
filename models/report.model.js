import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    reportType: {
        type: String,
        enum: ['Attendance', 'Fee Collection', 'Student Performance', 'Batch Summary', 'Staff Activity'],
        required: true
    },
    parameters: {
        startDate: Date,
        endDate: Date,
        batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        format: { type: String, enum: ['PDF', 'Excel'], default: 'PDF' }
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Failed'],
        default: 'Pending'
    },
    generatedFile: {
        public_id: String,
        url: String
    },
    errorMessage: String,
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    processedAt: Date
}, {
    timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
export default Report;

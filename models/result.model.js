import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    marksObtained: { type: Number, required: true },
    percentage: Number,
    grade: String,
    status: { type: String, enum: ['Pass', 'Fail'], default: 'Pass' },
    remarks: String,
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    }
}, {
    timestamps: true
});

const Result = mongoose.model('Result', resultSchema);
export default Result;

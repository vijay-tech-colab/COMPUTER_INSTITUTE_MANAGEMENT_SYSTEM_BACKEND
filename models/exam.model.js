import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    date: Date,
    maxMarks: { type: Number, required: true },
    passingMarks: { type: Number, required: true },
    examType: { type: String, enum: ['Internal', 'Final', 'Quiz'], default: 'Internal' },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    }
}, {
    timestamps: true
});

const Exam = mongoose.model('Exam', examSchema);
export default Exam;

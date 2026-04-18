import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    duration: {
        value: Number,
        unit: { type: String, enum: ['Months', 'Weeks', 'Days'], default: 'Months' }
    },
    feeStructure: {
        totalFee: { type: Number, required: true },
        registrationAmount: Number,
        installmentsAllowed: { type: Boolean, default: true }
    },
    syllabus: [{
        topic: String,
        description: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Course = mongoose.model('Course', courseSchema);
export default Course;

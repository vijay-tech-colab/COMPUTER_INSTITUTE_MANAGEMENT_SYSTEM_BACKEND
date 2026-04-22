import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        unique: true,
        required: true
    },
    designation: String,
    department: String,
    salary: {
        base: Number,
        allowances: Number
    },
    onboardingDate: {
        type: Date,
        default: Date.now
    },
    documents: [{
        name: String,
        url: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    }
}, {
    timestamps: true
});

const Staff = mongoose.model('Staff', staffSchema);
export default Staff;

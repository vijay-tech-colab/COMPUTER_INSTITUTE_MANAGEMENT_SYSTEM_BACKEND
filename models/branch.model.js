import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Branch name is required'],
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Branch code is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    address: {
        type: String,
        required: [true, 'Branch address is required']
    },
    phone: {
        type: String,
        required: [true, 'Branch phone number is required']
    },
    email: {
        type: String,
        required: [true, 'Branch email is required'],
        lowercase: true,
        trim: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

const Branch = mongoose.model('Branch', branchSchema);
export default Branch;

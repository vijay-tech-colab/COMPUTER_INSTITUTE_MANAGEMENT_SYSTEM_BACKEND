import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    interestedCourse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    status: {
        type: String,
        enum: ['Enquiry', 'Applied', 'Under Review', 'Approved', 'Rejected', 'Enrolled'],
        default: 'Enquiry'
    },
    address: String,
    guardianName: String,
    dateOfBirth: Date,
    previousQualification: String,
    referralSource: String,
    remarks: String,
    admissionFeePaid: {
        type: Boolean,
        default: false
    },
    documents: [{
        name: String,
        public_id: { type: String, required: true },
        url: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Verified'], default: 'Pending' }
    }],
    enrolledStudent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    }
}, {
    timestamps: true
});

const Admission = mongoose.model('Admission', admissionSchema);
export default Admission;

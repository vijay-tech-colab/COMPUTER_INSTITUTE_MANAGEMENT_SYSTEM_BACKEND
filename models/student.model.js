import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    registrationNo: {
        type: String,
        unique: true,
        required: true
    },
    dob: Date,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    address: {
        current: String,
        permanent: String
    },
    guardian: {
        name: String,
        relation: String,
        phone: String
    },
    academicDetails: {
        highestQualification: String,
        institute: String,
        passingYear: Number
    },
    documents: [{
        name: String,
        url: String,
        uploadDate: { type: Date, default: Date.now }
    }],
    currentBatch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    joiningDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Student = mongoose.model('Student', studentSchema);
export default Student;

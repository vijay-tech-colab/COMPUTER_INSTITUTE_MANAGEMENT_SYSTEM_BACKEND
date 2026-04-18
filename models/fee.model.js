import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Card'], default: 'UPI' },
    transactionId: String,
    receiptNo: { type: String, unique: true },
    remarks: String
});

const feeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    installments: [{
        dueDate: Date,
        amount: Number,
        status: { type: String, enum: ['Pending', 'Paid', 'Partial'], default: 'Pending' }
    }],
    payments: [paymentSchema],
    status: {
        type: String,
        enum: ['Pending', 'Partial', 'Paid', 'Overdue'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;

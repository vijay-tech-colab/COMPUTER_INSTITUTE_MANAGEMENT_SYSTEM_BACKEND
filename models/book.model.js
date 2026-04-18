import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Book title is required'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Author name is required']
    },
    publisher: {
        type: String,
        trim: true
    },
    isbn: {
        type: String,
        unique: true,
        sparse: true
    },
    edition: String,
    language: {
        type: String,
        default: 'English'
    },
    pages: Number,
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    discountPrice: {
        type: Number,
        min: 0
    },
    copies: {
        total: { type: Number, default: 1 },
        available: { type: Number, default: 1 }
    },
    shelfLocation: {
        type: String,
        trim: true
    },
    coverImage: {
        public_id: { type: String, required: true },
        url: { type: String, required: true }
    },
    purchaseDate: Date,
    status: {
        type: String,
        enum: ['Available', 'Out of Stock', 'Discontinued', 'Lost'],
        default: 'Available'
    },
    isDigital: {
        type: Boolean,
        default: false
    },
    ebookUrl: {
        public_id: String,
        url: String
    }
}, {
    timestamps: true
});

const Book = mongoose.model('Book', bookSchema);
export default Book;

import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Book from "../models/book.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { sendResponse } from "../utils/sendResponse.js";
import CloudinaryService from "../utils/CloudinaryService.js";

export const createBook = catchAsyncErrors(async (req, res, next) => {
    if (req.files && req.files.cover) {
        const myCloud = await CloudinaryService.uploadFile(req.files.cover.tempFilePath, "cims/books");
        req.body.coverImage = {
            public_id: myCloud.public_id,
            url: myCloud.url
        };
    }

    const book = await Book.create(req.body);
    sendResponse(res, 201, "Book added to library", book);
});

export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
    const apiFeature = new ApiFeatures(Book.find(), req.query)
        .search(["title", "author"])
        .filter()
        .pagination(20);

    const books = await apiFeature.query;
    res.status(200).json({ success: true, books });
});

export const updateBook = catchAsyncErrors(async (req, res, next) => {
    let book = await Book.findById(req.params.id);
    if (!book) return next(new ErrorHandler("Book not found", 404));

    if (req.files && req.files.cover) {
        const myCloud = await CloudinaryService.uploadFile(
            req.files.cover.tempFilePath, 
            "cims/books", 
            book.coverImage?.public_id
        );
        req.body.coverImage = {
            public_id: myCloud.public_id,
            url: myCloud.url
        };
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    sendResponse(res, 200, "Book updated", book);
});

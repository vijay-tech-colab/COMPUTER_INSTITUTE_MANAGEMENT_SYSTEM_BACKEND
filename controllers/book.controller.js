import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Book from "../models/book.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { sendResponse } from "../utils/sendResponse.js";
import CloudinaryService from "../utils/CloudinaryService.js";
import { getCache, setCache, deleteByPrefix } from "../utils/redis.js";
import { createNotification } from "../utils/notifier.js";

export const createBook = catchAsyncErrors(async (req, res, next) => {
    if (req.files && req.files.cover) {
        const myCloud = await CloudinaryService.uploadFile(req.files.cover.tempFilePath, "cims/books");
        req.body.coverImage = {
            public_id: myCloud.public_id,
            url: myCloud.url
        };
    }

    if (!req.body.branch) req.body.branch = req.user.branch;
    const book = await Book.create(req.body);

    // Invalidate Cache
    await deleteByPrefix(`books:${req.body.branch}`);

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "New Book Added",
        message: `'${book.title}' by ${book.author} added to library.`,
        type: "Activity",
        resource: "Book",
        resourceId: book._id,
        action: "create",
        branch: book.branch
    });

    sendResponse(res, 201, "Book added to library", book);
});

export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
    const branch = req.query.branch || req.user.branch;

    const cacheKey = `books:${branch}:${JSON.stringify(req.query)}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json({ success: true, books: cached, fromCache: true });

    const apiFeature = new ApiFeatures(Book.find({ branch }), req.query)
        .search(["title", "author"])
        .filter()
        .pagination(20);

    const books = await apiFeature.query;
    await setCache(cacheKey, books, 3600);

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

    // Invalidate Cache
    await deleteByPrefix(`books:${book.branch}`);

    sendResponse(res, 200, "Book updated", book);
});

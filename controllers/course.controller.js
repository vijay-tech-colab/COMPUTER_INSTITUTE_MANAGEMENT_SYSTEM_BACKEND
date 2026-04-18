import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Course from "../models/course.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { sendResponse } from "../utils/sendResponse.js";

/**
 * Create a new course
 */
export const createCourse = catchAsyncErrors(async (req, res, next) => {
    const course = await Course.create(req.body);

    sendResponse(res, 201, "Course created successfully", course);
});

/**
 * Get all courses with search and filters
 */
export const getCourses = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = 20;
    const apiFeature = new ApiFeatures(Course.find(), req.query)
        .search(["name", "code"])
        .filter()
        .pagination(resultPerPage);

    const courses = await apiFeature.query;

    res.status(200).json({
        success: true,
        count: courses.length,
        courses,
    });
});

/**
 * Update course details
 */
export const updateCourse = catchAsyncErrors(async (req, res, next) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }

    sendResponse(res, 200, "Course updated successfully", course);
});

/**
 * Delete a course
 */
export const deleteCourse = catchAsyncErrors(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }

    await course.deleteOne();

    sendResponse(res, 200, "Course deleted successfully");
});

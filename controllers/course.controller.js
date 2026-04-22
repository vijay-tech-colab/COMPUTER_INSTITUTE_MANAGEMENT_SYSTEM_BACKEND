import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Course from "../models/course.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { sendResponse } from "../utils/sendResponse.js";
import { getCache, setCache, deleteByPrefix } from "../utils/redis.js";
import { createNotification } from "../utils/notifier.js";

/**
 * Create a new course
 */
export const createCourse = catchAsyncErrors(async (req, res, next) => {
    if (!req.body.branch) req.body.branch = req.user.branch;
    const course = await Course.create(req.body);

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "New Course Created",
        message: `${course.name} (${course.code}) has been added to the catalog.`,
        type: "Activity",
        resource: "Course",
        resourceId: course._id,
        action: "create",
        branch: course.branch
    });

    // Invalidate Cache
    await deleteByPrefix(`courses:${course.branch}`);

    sendResponse(res, 201, "Course created successfully", course);
});

/**
 * Get all courses with search and filters
 */
export const getCourses = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = 20;
    const branch = req.query.branch || (req.user ? req.user.branch : null);
    
    // Redis Cache Key
    const cacheKey = `courses:${branch}:${JSON.stringify(req.query)}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
        return res.status(200).json({
            success: true,
            count: cachedData.length,
            courses: cachedData,
            fromCache: true
        });
    }

    const query = branch ? Course.find({ branch }) : Course.find();
    
    const apiFeature = new ApiFeatures(query, req.query)
        .search(["name", "code"])
        .filter()
        .pagination(resultPerPage);

    const courses = await apiFeature.query;

    // Set Cache for 1 hour
    await setCache(cacheKey, courses, 3600);

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

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "Course Updated",
        message: `Course ${course.name} has been modified.`,
        type: "Activity",
        resource: "Course",
        resourceId: course._id,
        action: "update",
        branch: course.branch
    });

    // Invalidate Cache
    await deleteByPrefix(`courses:${course.branch}`);

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

    const branchId = course.branch;
    const courseName = course.name;
    await course.deleteOne();

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "Course Deleted",
        message: `Course ${courseName} was removed from the catalog.`,
        type: "Activity",
        resource: "Course",
        action: "delete",
        branch: branchId
    });

    // Invalidate Cache
    await deleteByPrefix(`courses:${branchId}`);

    sendResponse(res, 200, "Course deleted successfully");
});

import Branch from '../models/branch.model.js';
import { catchAsyncErrors } from '../utils/catchAsyncErrors.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { getCache, setCache, deleteCache, deleteByPrefix } from '../utils/redis.js';
import { createNotification } from '../utils/notifier.js';

// Create a new branch
export const createBranch = catchAsyncErrors(async (req, res, next) => {
    const branch = await Branch.create(req.body);

    await deleteCache('branches:all');

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "New Branch Created",
        message: `Branch '${branch.name}' (${branch.city}) was added to the system.`,
        type: "Activity",
        resource: "Branch",
        resourceId: branch._id,
        action: "create",
        branch: branch._id
    });

    res.status(201).json({
        success: true,
        branch
    });
});

// Get all branches
export const getAllBranches = catchAsyncErrors(async (req, res, next) => {
    const cacheKey = 'branches:all';
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json({ success: true, branches: cached, fromCache: true });

    const branches = await Branch.find();
    await setCache(cacheKey, branches, 86400); // 24 hours

    res.status(200).json({
        success: true,
        branches
    });
});

// Get single branch details
export const getBranchDetails = catchAsyncErrors(async (req, res, next) => {
    const cacheKey = `branch:${req.params.id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json({ success: true, branch: cached, fromCache: true });

    const branch = await Branch.findById(req.params.id);

    if (!branch) {
        return next(new ErrorHandler('Branch not found', 404));
    }

    await setCache(cacheKey, branch, 86400);

    res.status(200).json({
        success: true,
        branch
    });
});

// Update branch
export const updateBranch = catchAsyncErrors(async (req, res, next) => {
    let branch = await Branch.findById(req.params.id);

    if (!branch) {
        return next(new ErrorHandler('Branch not found', 404));
    }

    branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    await deleteCache(`branch:${req.params.id}`);
    await deleteCache('branches:all');

    res.status(200).json({
        success: true,
        branch
    });
});

// Delete branch
export const deleteBranch = catchAsyncErrors(async (req, res, next) => {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
        return next(new ErrorHandler('Branch not found', 404));
    }

    await branch.deleteOne();

    await deleteCache(`branch:${req.params.id}`);
    await deleteCache('branches:all');

    res.status(200).json({
        success: true,
        message: 'Branch deleted successfully'
    });
});

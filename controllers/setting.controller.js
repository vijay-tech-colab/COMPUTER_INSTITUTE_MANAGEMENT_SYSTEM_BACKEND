import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Setting from "../models/setting.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { getCache, setCache, deleteByPrefix } from "../utils/redis.js";
import { createNotification } from "../utils/notifier.js";

export const updateSystemSetting = catchAsyncErrors(async (req, res, next) => {
    const { key, value, module } = req.body;
    const branch = req.body.branch || req.user.branch;

    const setting = await Setting.findOneAndUpdate(
        { key, branch },
        { value, module, updatedBy: req.user._id, branch },
        { new: true, upsert: true }
    );

    // Invalidate Cache
    await deleteByPrefix(`settings:${branch}`);

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "System Setting Updated",
        message: `Setting '${key}' in ${module} module was updated to '${value}'.`,
        type: "Activity",
        resource: "Setting",
        action: "update",
        branch
    });

    res.status(200).json({ success: true, setting });
});

export const getAllSettings = catchAsyncErrors(async (req, res, next) => {
    const branch = req.query.branch || req.user.branch;
    const cacheKey = `settings:${branch}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json({ success: true, settings: cached, fromCache: true });

    const settings = await Setting.find({ branch });
    await setCache(cacheKey, settings, 86400); // 24 hours

    res.status(200).json({ success: true, settings });
});

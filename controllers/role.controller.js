import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Role from "../models/role.model.js";
import Permission from "../models/permission.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendResponse } from "../utils/sendResponse.js";
import { deleteByPrefix } from "../utils/redis.js";
import { createNotification } from "../utils/notifier.js";

/**
 * Create a new custom role
 */
export const createRole = catchAsyncErrors(async (req, res, next) => {
    const branch = req.body.branch || req.user.branch;
    const role = await Role.create({ ...req.body, branch });

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "New Role Created",
        message: `Custom role '${role.name}' was created.`,
        type: "Activity",
        resource: "Role",
        resourceId: role._id,
        action: "create",
        branch
    });

    sendResponse(res, 201, "Custom role created successfully", role);
});

/**
 * Get all roles for a branch
 */
export const getRoles = catchAsyncErrors(async (req, res, next) => {
    const branch = req.query.branch || req.user.branch;
    const roles = await Role.find({ branch });

    res.status(200).json({ success: true, count: roles.length, roles });
});

/**
 * Update Role permissions or details
 */
export const updateRole = catchAsyncErrors(async (req, res, next) => {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!role) return next(new ErrorHandler("Role not found", 404));

    // Clear caches for users having this role
    await deleteByPrefix('user:'); 

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "Role Updated",
        message: `Permissions for custom role '${role.name}' were modified.`,
        type: "Activity",
        resource: "Role",
        resourceId: role._id,
        action: "update",
        branch: role.branch
    });

    sendResponse(res, 200, "Role updated successfully", role);
});

/**
 * Delete a custom role
 */
export const deleteRole = catchAsyncErrors(async (req, res, next) => {
    const role = await Role.findById(req.params.id);
    if (!role) return next(new ErrorHandler("Role not found", 404));

    await role.deleteOne();
    await deleteByPrefix('user:');

    sendResponse(res, 200, "Role deleted successfully");
});

/**
 * Get all available resources and actions for RBAC UI (Dynamic from DB)
 */
export const getPermissionManifest = catchAsyncErrors(async (req, res, next) => {
    const permissions = await Permission.find().sort({ module: 1 });

    res.status(200).json({
        success: true,
        manifest: permissions
    });
});

/**
 * Seed Default Permissions into DB (Admin Utility)
 */
export const seedPermissions = catchAsyncErrors(async (req, res, next) => {
    const defaultPermissions = [
        { resource: "student", displayName: "Student Management", module: "Academic" },
        { resource: "staff", displayName: "Staff Management", module: "Administrative" },
        { resource: "course", displayName: "Course Catalog", module: "Academic" },
        { resource: "batch", displayName: "Batch Management", module: "Academic" },
        { resource: "attendance", displayName: "Attendance Tracking", module: "Academic" },
        { resource: "fee", displayName: "Fee & Finance", module: "Finance" },
        { resource: "exam", displayName: "Examination & Results", module: "Academic" },
        { resource: "admission", displayName: "Admission & Enquiries", module: "Administrative" },
        { resource: "book", displayName: "Library Books", module: "Library" },
        { resource: "notification", displayName: "System Notifications", module: "Core" },
        { resource: "setting", displayName: "Branch Settings", module: "Core" },
        { resource: "report", displayName: "Analytical Reports", module: "Core" },
        { resource: "dashboard", displayName: "Analytics Dashboard", module: "Core" },
    ];

    for (const p of defaultPermissions) {
        await Permission.findOneAndUpdate(
            { resource: p.resource },
            p,
            { upsert: true, new: true }
        );
    }

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "System Permissions Seeded",
        message: "Master permission catalog was initialized/updated.",
        type: "Activity",
        resource: "Permission",
        action: "other",
        branch: req.user.branch
    });

    res.status(201).json({ success: true, message: "Master permissions catalog seeded" });
});

import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import User from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import CloudinaryService from "../utils/CloudinaryService.js";
import { sendEmail } from "../services/email/sendEmail.js";
import { sendToken } from "../utils/sendResponse.js";
import { getCache, setCache, deleteCache } from "../utils/redis.js";
import { createNotification } from "../utils/notifier.js";

/**
 * Register a new user
 */
export const registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, role, assignedRole, phone, branch } = req.body;

    // Multi-tenant check: Non-superadmins can only register users for their own branch
    const finalBranch = branch || (req.user ? req.user.branch : null);
    if (req.user && req.user.role !== 'admin' && String(req.user.branch) !== String(finalBranch)) {
        return next(new ErrorHandler("You can only register users for your own branch", 403));
    }

    let avatar = {
        public_id: "default_avatar",
        url: "https://res.cloudinary.com/dmpp9it7f/image/upload/v1713426742/cims/avatars/default_profile_k7qpxq.png"
    };

    // 1. Upload Avatar to Cloudinary only if provided
    if (req.files && req.files.avatar) {
        const myCloud = await CloudinaryService.uploadFile(
            req.files.avatar.tempFilePath,
            "cims/avatars"
        );
        avatar = {
            public_id: myCloud.public_id,
            url: myCloud.url,
        };
    }

    // 2. Create User
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'student',
        assignedRole, // New dynamic role support
        phone,
        branch: finalBranch,
        avatar
    });

    // Activity Log
    await createNotification({
        sender: req.user?._id,
        title: "New User Registered",
        message: `${user.name} was registered as ${role || 'student'}.`,
        type: "Activity",
        resource: "User",
        resourceId: user._id,
        action: "create",
        branch: finalBranch
    });

    // 3. Send Welcome Email (Optional but recommended)
    try {
        await sendEmail({
            email: user.email,
            subject: "Welcome to CIMS Institute 🎓",
            template: "welcome",
            data: {
                name: user.name,
                url: `${process.env.FRONTEND_URL}/login`
            }
        });
    } catch (error) {
        console.log("Email sending failed:", error.message);
    }

    sendToken(user, 201, res, "Registration Successful");
});

/**
 * Login User
 */
export const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please enter email & password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    // Update last login date
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res, `Welcome back, ${user.name}`);
});

/**
 * Logout User
 */
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
    // For Bearer tokens, the server usually just responds with success. 
    // The client handles token removal from store.
    res.status(200).json({
        success: true,
        message: "Logged Out Successfully",
    });
});

/**
 * Get Current User Profile
 */
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const cacheKey = `user:${req.user.id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json({ success: true, user: cached, fromCache: true });

    const user = await User.findById(req.user.id);

    await setCache(cacheKey, user, 3600); // 1 hour

    res.status(200).json({
        success: true,
        user,
    });
});

/**
 * Update Profile Details & Avatar
 */
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newData = {};
    if (req.body.name) newData.name = req.body.name;
    if (req.body.email) newData.email = req.body.email;
    if (req.body.phone) newData.phone = req.body.phone;
    if (req.body.branch) newData.branch = req.body.branch;

    // Update Avatar if file is provided
    if (req.files && req.files.avatar) {
        const user = await User.findById(req.user.id);

        const myCloud = await CloudinaryService.uploadFile(
            req.files.avatar.tempFilePath,
            "cims/avatars",
            user.avatar?.public_id !== "default_avatar" ? user.avatar?.public_id : undefined
        );

        newData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.url,
        };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    // Invalidate Cache
    await deleteCache(`user:${req.user.id}`);

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "Profile Updated",
        message: `${user.name} updated their profile information.`,
        type: "Activity",
        resource: "User",
        resourceId: user._id,
        action: "update",
        branch: user.branch
    });

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
    });
});

/**
 * Manage User Permissions (Admin Only)
 */
export const manageUserPermissions = catchAsyncErrors(async (req, res, next) => {
    const { userId, permissions } = req.body;

    const user = await User.findByIdAndUpdate(
        userId,
        { permissions },
        { new: true, runValidators: true }
    );

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Invalidate Cache for this user
    await deleteCache(`user:${userId}`);

    // Activity Log
    await createNotification({
        sender: req.user._id,
        title: "Permissions Modified",
        message: `Administrative permissions were updated for ${user.name}.`,
        type: "Activity",
        resource: "User",
        resourceId: user._id,
        action: "update",
        branch: user.branch
    });

    res.status(200).json({
        success: true,
        message: "Permissions updated successfully",
        user
    });
});

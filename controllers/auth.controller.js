import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import User from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import CloudinaryService from "../utils/CloudinaryService.js";
import { sendEmail } from "../services/email/sendEmail.js";
import { sendToken } from "../utils/sendResponse.js";

/**
 * Register a new user
 */
export const registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, role, phone, branch } = req.body;

    if (!req.files || !req.files.avatar) {
        return next(new ErrorHandler("Please upload an avatar", 400));
    }

    // 1. Upload Avatar to Cloudinary
    const myCloud = await CloudinaryService.uploadFile(
        req.files.avatar.tempFilePath,
        "cims/avatars"
    );

    // 2. Create User
    const user = await User.create({
        name,
        email,
        password,
        role,
        phone,
        branch,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.url,
        },
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
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

/**
 * Update Profile Details & Avatar
 */
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        branch: req.body.branch,
    };

    // Update Avatar if file is provided
    if (req.files && req.files.avatar) {
        const user = await User.findById(req.user.id);

        const myCloud = await CloudinaryService.uploadFile(
            req.files.avatar.tempFilePath,
            "cims/avatars",
            user.avatar.public_id // Deletes old photo
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

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
    });
});

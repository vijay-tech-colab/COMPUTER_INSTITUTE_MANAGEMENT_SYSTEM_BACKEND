import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Staff from "../models/staff.model.js";
import User from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import CloudinaryService from "../utils/CloudinaryService.js";
import { sendResponse } from "../utils/sendResponse.js";

/**
 * Onboard a new Staff member (Faculty/Admin/Accountant)
 */
export const onboardStaff = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, role, phone, designation, department, salary } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return next(new ErrorHandler("User already exists with this email", 400));

    // Handle profile photo
    let avatar = { public_id: "default", url: "default-url" };
    if (req.files && req.files.avatar) {
        const myCloud = await CloudinaryService.uploadFile(req.files.avatar.tempFilePath, "cims/staff");
        avatar = {
            public_id: myCloud.public_id,
            url: myCloud.url
        };
    }

    // 1. Create User Login
    user = await User.create({
        name,
        email,
        password,
        role: role || 'staff',
        phone,
        avatar
    });

    // 2. Create Staff Profile
    const staff = await Staff.create({
        user: user._id,
        employeeId: `EMP-${Date.now()}`,
        designation,
        department,
        salary: salary ? JSON.parse(salary) : { base: 0, allowances: 0 }
    });

    sendResponse(res, 201, "Staff onboarded successfully", { user, staff });
});

/**
 * Get list of all staff members
 */
export const getStaffList = catchAsyncErrors(async (req, res, next) => {
    const staffList = await Staff.find().populate("user", "name email phone role status");

    res.status(200).json({
        success: true,
        count: staffList.length,
        staff: staffList
    });
});

/**
 * Update Salary or Designation
 */
export const updateStaffSalary = catchAsyncErrors(async (req, res, next) => {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!staff) return next(new ErrorHandler("Staff record not found", 404));

    sendResponse(res, 200, "Staff details updated", staff);
});

/**
 * Remove Staff
 */
export const deleteStaff = catchAsyncErrors(async (req, res, next) => {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return next(new ErrorHandler("Staff not found", 404));

    const user = await User.findById(staff.user);
    
    // Cleanup Cloudinary
    if (user && user.avatar && user.avatar.public_id !== "default") {
        await CloudinaryService.deleteFile(user.avatar.public_id);
    }

    await staff.deleteOne();
    if (user) await user.deleteOne();

    sendResponse(res, 200, "Staff record deleted successfully");
});

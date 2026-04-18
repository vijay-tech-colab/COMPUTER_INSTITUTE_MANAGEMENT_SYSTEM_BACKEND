import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import Setting from "../models/setting.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const updateSystemSetting = catchAsyncErrors(async (req, res, next) => {
    // Logic for updating system configs
});

export const getAllSettings = catchAsyncErrors(async (req, res, next) => {
    // Logic for fetching settings
});

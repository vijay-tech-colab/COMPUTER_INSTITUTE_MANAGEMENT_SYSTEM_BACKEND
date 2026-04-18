/**
 * Reusable function to send consistent API responses
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Data to send in the response
 */
export const sendResponse = (res, statusCode, message, data = null) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Specifically for sending Auth tokens in cookies and response
 */
export const sendToken = (user, statusCode, res, message) => {
    const token = user.getJWTToken();

    res.status(statusCode).json({
        success: true,
        message,
        user,
        token,
    });
};

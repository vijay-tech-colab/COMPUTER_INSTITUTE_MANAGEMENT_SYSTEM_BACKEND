/**
 * Premium HTML Email Templates for CIMS
 */

const baseStyles = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    border: 1px solid #eee;
    border-radius: 10px;
    overflow: hidden;
`;

const headerStyles = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 30px;
    text-align: center;
    color: white;
`;

const contentStyles = `
    padding: 40px;
    background: #fff;
`;

const buttonStyles = `
    display: inline-block;
    padding: 12px 30px;
    background: #764ba2;
    color: #fff;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
    margin-top: 20px;
`;

export const getWelcomeTemplate = (name) => `
    <div style="${baseStyles}">
        <div style="${headerStyles}">
            <h1>Welcome to CIMS! 🎓</h1>
        </div>
        <div style="${contentStyles}">
            <h2>Hi ${name},</h2>
            <p>We are thrilled to have you join our institute. Your journey towards excellence starts here!</p>
            <p>You can now access your student dashboard to track your performance, attendance, and learning materials.</p>
            <a href="${process.env.FRONTEND_URL}/login" style="${buttonStyles}">Login to Dashboard</a>
            <p style="margin-top: 30px; font-size: 0.9em; color: #777;">Regards,<br>Team CIMS</p>
        </div>
    </div>
`;

export const getFeeReminderTemplate = (name, amount, dueDate) => `
    <div style="${baseStyles}">
        <div style="${headerStyles}">
            <h1>Fee Reminder 💰</h1>
        </div>
        <div style="${contentStyles}">
            <h2>Dear ${name},</h2>
            <p>This is a friendly reminder regarding your outstanding fees for this month.</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Amount Due:</strong> ₹${amount}</p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
            </div>
            <p>To avoid any late fees, please settle the amount through your student portal.</p>
            <a href="${process.env.FRONTEND_URL}/fees" style="${buttonStyles}">Pay Online</a>
            <p style="margin-top: 30px; font-size: 0.9em; color: #777;">Regards,<br>Accounts Department, CIMS</p>
        </div>
    </div>
`;

export const getResetPasswordTemplate = (otp) => `
    <div style="${baseStyles}">
        <div style="${headerStyles}">
            <h1>Password Reset 🔐</h1>
        </div>
        <div style="${contentStyles}">
            <p>We received a request to reset your password. Use the following OTP to complete the process:</p>
            <div style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #764ba2; margin: 30px 0;">
                ${otp}
            </div>
            <p>This OTP is valid for 15 minutes. If you didn't request this, please ignore this email.</p>
        </div>
    </div>
`;

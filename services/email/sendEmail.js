import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sends an email using EJS templates
 * @param {Object} options - {email, subject, template, data}
 */
export const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    // Path to the template
    const templatePath = path.join(__dirname, "templates", `${options.template}.ejs`);

    // Render EJS file to HTML
    const html = await ejs.renderFile(templatePath, options.data || {});

    const mailOptions = {
        from: `CIMS Institute <${process.env.SMTP_MAIL}>`,
        to: options.email,
        subject: options.subject,
        html: html,
    };

    await transporter.sendMail(mailOptions);
};

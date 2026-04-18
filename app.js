import express from "express";
import helmet from "helmet";
import cors from "cors";
import expressFileUploader from "express-fileupload";
import morgan from "morgan";
import dotenv from "dotenv";

// Import Routes
import authRoutes from "./routers/auth.routes.js";
import studentRoutes from "./routers/student.routes.js";
import staffRoutes from "./routers/staff.routes.js";
import courseRoutes from "./routers/course.routes.js";
import batchRoutes from "./routers/batch.routes.js";
import attendanceRoutes from "./routers/attendance.routes.js";
import feeRoutes from "./routers/fee.routes.js";
import examRoutes from "./routers/exam.routes.js";
import admissionRoutes from "./routers/admission.routes.js";
import settingRoutes from "./routers/setting.routes.js";
import notificationRoutes from "./routers/notification.routes.js";
import bookRoutes from "./routers/book.routes.js";
import paymentRoutes from "./routers/payment.routes.js";
import dashboardRoutes from "./routers/dashboard.routes.js";
import reportRoutes from "./routers/report.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";






// dotenv.config();
const app = express();

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(expressFileUploader({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: {
        fileSize: 1024 * 1024 * 50 // 50MB limit is usually enough
    }
}));

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/staff", staffRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/batches", batchRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/fees", feeRoutes);
app.use("/api/v1/exams", examRoutes);
app.use("/api/v1/admissions", admissionRoutes);
app.use("/api/v1/settings", settingRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/reports", reportRoutes);





// Root Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CIMS API is running smooth 🚀"
    });
});

// Error Middleware
app.use(errorMiddleware);

export default app;
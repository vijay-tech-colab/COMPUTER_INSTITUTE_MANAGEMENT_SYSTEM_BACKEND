import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";
import { v2 as cloudinary } from "cloudinary";

// Configure Dotenv
dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
});

// Connect to Database and start server
connectDB()
    .then(() => {
        const server = app.listen(process.env.PORT || 9000, () => {
            console.log(`🚀 Server is running at port : ${process.env.PORT || 9000}`);
        });

        // Handling Unhandled Promise Rejection
        process.on("unhandledRejection", (err) => {
            console.log(`Error: ${err.message}`);
            console.log(`Shutting down the server due to Unhandled Promise Rejection`);
            server.close(() => {
                process.exit(1);
            });
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed !!! ", err);
    });

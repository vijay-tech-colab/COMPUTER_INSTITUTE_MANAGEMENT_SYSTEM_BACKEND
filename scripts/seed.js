import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import Branch from "../models/branch.model.js";

dotenv.config();

const seedData = async () => {
    try {
        console.log("🚀 Starting Database Seeding...");

        await mongoose.connect(process.env.MONGO_URI);
        console.log("☘️  Connected to MongoDB");

        // 1. Create Default Branch if none exists
        let branch = await Branch.findOne({ code: "MAIN01" });
        if (!branch) {
            branch = await Branch.create({
                name: "Main Branch",
                code: "MAIN01",
                address: "CIMS Campus, Sector 62, Noida",
                phone: "0120-1234567",
                email: "main-branch@cims.edu",
                status: "Active"
            });
            console.log("✅ Default Branch Created: Main Branch (MAIN01)");
        } else {
            console.log("ℹ️  Branch already exists.");
        }

        // 2. Create Super Admin if none exists
        const adminEmail = "admin@cims.edu";
        let admin = await User.findOne({ email: adminEmail });

        if (!admin) {
            admin = await User.create({
                name: "System Administrator",
                email: adminEmail,
                password: "adminPassword123", // User should change this after first login
                role: "admin",
                phone: "9999999999",
                branch: branch._id,
                status: "active",
                avatar: {
                    public_id: "default_avatar",
                    url: "https://res.cloudinary.com/dmpp9it7f/image/upload/v1713426742/cims/avatars/default_profile_k7qpxq.png"
                }
            });
            console.log(`✅ Super Admin Created: ${adminEmail} / adminPassword123`);
        } else {
            console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
        }

        console.log("✨ Seeding Completed Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding FAILED:", error);
        process.exit(1);
    }
};

seedData();

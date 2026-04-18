import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

class CloudinaryService {
    /**
     * Uploads a file to Cloudinary and deletes the old one if provided.
     * @param {string} filePath - Local path of the file to upload.
     * @param {string} folder - Folder name in Cloudinary.
     * @param {string} oldPublicId - (Optional) Public ID of the file to delete before uploading.
     */
    static async uploadFile(filePath, folder = "cims", oldPublicId = null) {
        try {
            // 1. Delete old file if public_id exists
            if (oldPublicId) {
                await cloudinary.uploader.destroy(oldPublicId);
            }

            // 2. Upload new file with optimization
            const result = await cloudinary.uploader.upload(filePath, {
                folder: folder,
                resource_type: "auto",
                quality: "auto", // Automatically compresses image
                fetch_format: "auto", // Delivers best format (webp/avif)
            });

            // 3. Remove locally saved temporary file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            return {
                public_id: result.public_id,
                url: result.secure_url,
            };
        } catch (error) {
            // Clean up local file even if upload fails
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            throw new Error(`Cloudinary Upload Error: ${error.message}`);
        }
    }

    /**
     * Deletes a file from Cloudinary.
     * @param {string} publicId - Public ID of the file to delete.
     */
    static async deleteFile(publicId) {
        try {
            if (!publicId) return null;
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error) {
            throw new Error(`Cloudinary Delete Error: ${error.message}`);
        }
    }
}

export default CloudinaryService;

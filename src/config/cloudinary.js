import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

dotenv.config()

const cloudinaryConfig = async () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        await cloudinary.api.resources({ max_results: 1 });
        console.log("Connected with Cloudinary");
    } catch (error) {
        console.error("Error in connection with Cloudinary:", error);
    }
};

export default cloudinaryConfig

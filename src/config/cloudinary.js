import { v2 as cloudinary } from 'cloudinary';

const cloudinaryConfig = async () => {
    try {
        cloudinary.config({
            cloud_name: 'dtm2maxaf',
            api_key: '331657973378695',
            api_secret: 'hSR8XQ1SCf2GsVg9-LIgd04qLYI'
        });

        await cloudinary.api.resources({ max_results: 1 });
        console.log("Connected with Cloudinary");
    } catch (error) {
        console.error("Error in connection with Cloudinary:", error);
    }
};

export default cloudinaryConfig

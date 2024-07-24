import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import userRoutes from "./src/routes/User.routes.js";
import cloudinaryConfig from "./src/config/cloudinary.js";
import listingRoutes from "./src/routes/Listing.routes.js";

// Initialize the Express app
const app = express();

// Use CORS middleware
app.use(cors());

// Use JSON middleware for parsing application/json
app.use(express.json());

// Use URL-encoded middleware for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Use file upload middleware
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Configure Cloudinary
cloudinaryConfig();

// Use user routes
app.use("/api/v1/user", userRoutes);

// Use user routes
app.use("/api/v1/listing", listingRoutes);

// Error Handling Middleware (Optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error'
    });
});

// Export the app
export default app;

import { Listing } from "../models/Listing.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { v2 as cloudinary } from 'cloudinary';

async function uploadImages(files, folder) {
    const uploadPromises = files.map(file => cloudinary.uploader.upload(file.tempFilePath, { folder }));
    return await Promise.all(uploadPromises);
}

const createListing = asyncHandler(async (req, res) => {

    console.log("Listing called")
    const {
        ownerName, ownerEmail, name, description, address,
        regularPrice, discountPrice, bathrooms, bedrooms,
        furnished, parking
    } = req.body;
    
    const imageFiles = req.files?.images; // Assuming images are sent as a file array

    // Validate required fields
    if (!ownerName || !ownerEmail || !name || !description || !address || 
        !regularPrice || !discountPrice || !bathrooms || !bedrooms || 
        !furnished || !parking || !imageFiles) {
        throw new ApiError(401, "All the fields are required");
    }

    // Ensure imageFiles is an array (it could be a single file)
    const imageArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];

    let uploadedImages;
    try {
        uploadedImages = await uploadImages(imageArray, 'Listings');
        console.log("Images uploaded successfully:", uploadedImages);
    } catch (error) {
        console.error("Error uploading images:", error);
        throw new ApiError(500, 'Failed to upload images');
    }

    const imageUrls = uploadedImages.map(upload => upload.secure_url);

    let listing;
    try {
        console.log("Creating listing ......");
        listing = await Listing.create({
            ownerName, ownerEmail, name, description, address,
            regularPrice, discountPrice, bathrooms, bedrooms,
            furnished, parking, imageUrls
        });
        console.log("Listing created......");
    } catch (error) {
        console.error("An error occurred while creating the listing:", error);
        throw new ApiError(500, 'Internal server error');
    }

    return res.status(200).json({ listing });
});

const getListings = asyncHandler(async (req, res) => {
    try {
        // Fetch all listings from the database
        const listings = await Listing.find();
        console.log("Listings retrieved successfully");

        // Return the listings in the response
        return res.status(200).json({ listings });
    } catch (error) {
        console.error("An error occurred while retrieving listings:", error);
        throw new ApiError(500, 'Internal server error');
    }
});

const getUserListings = asyncHandler(async (req, res) => {
    const { email } = req.body; // Get email from request parameters

    if (!email) {
        throw new ApiError(400, "Email parameter is required");
    }

    try {
        // Find listings where ownerEmail matches the provided email
        const listings = await Listing.find({ ownerEmail: email });
        if (listings.length === 0) {
            return res.status(404).json({ message: "No listings found for this email" });
        }

        console.log("User listings retrieved successfully");
        return res.status(200).json({ listings });
    } catch (error) {
        console.error("An error occurred while retrieving user listings:", error);
        throw new ApiError(500, 'Internal server error');
    }
});

export { createListing,getListings,getUserListings };

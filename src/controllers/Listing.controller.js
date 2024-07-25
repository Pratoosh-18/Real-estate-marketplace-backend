import { Listing } from "../models/Listing.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { v2 as cloudinary } from 'cloudinary';

async function uploadImages(files, folder) {
    const uploadPromises = files.map(file => cloudinary.uploader.upload(file.tempFilePath, { folder }));
    return await Promise.all(uploadPromises);
}

const createListing = asyncHandler(async (req, res) => {
    console.log("Listing called");
    const {
        ownerEmail, name, description, address,
        regularPrice, discountPrice, bathrooms, bedrooms,
        furnished, parking
    } = req.body;
    
    const imageFiles = req.files?.images; // Assuming images are sent as a file array

    // Validate required fields
    if (!ownerEmail || !name || !description || !address || 
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

    // Find the user by ownerEmail
    const owner = await User.findOne({ email: ownerEmail });
    if (!owner) {
        throw new ApiError(404, 'Owner not found');
    }

    let listing;
    try {
        console.log("Creating listing ......");
        listing = await Listing.create({
            owner: owner._id, // Set the owner field with the user's _id
            name, description, address,
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
        // Fetch all listings from the database and populate the owner field
        const listings = await Listing.find().populate('owner', 'username email avatar');
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
        const listings = await Listing.find({ ownerEmail: email }).populate('owner', 'username email avatar');
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

const buyListing = asyncHandler(async (req, res) => {
    const { listingId } = req.body;
    const { buyerEmail } = req.body;

    if (!buyerEmail) {
        throw new ApiError(400, 'Buyer email is required');
    }

    try {
        const listing = await Listing.findById(listingId);

        if (!listing) {
            throw new ApiError(404, 'Listing not found');
        }

        if (listing.isSold) {
            return res.status(200).json({ message: 'Listing is already sold' });
        }
        console.log("Listing is found")
        listing.isSold = true;
        listing.buyerEmail = buyerEmail;
        await listing.save();

        return res.status(200).json({ message: 'Listing purchased successfully' });
    } catch (error) {
        console.error("An error occurred while buying the listing:", error);
        throw new ApiError(500, 'Internal server error');
    }
});

export { createListing, getListings, getUserListings, buyListing };

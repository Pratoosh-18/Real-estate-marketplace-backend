import { User } from "../models/User.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { v2 as cloudinary } from 'cloudinary';
import fileUpload from 'express-fileupload'; // Ensure this middleware is used in your Express app

async function uploading(file, folder) {
    const options = {
        folder,
    };

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}

const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
    console.log("Register called");
    const { username, email, password } = req.body;
    const coverImg = req.files?.coverImg; // Assuming coverImg is sent as a file

    if (!username || !email || !password || !coverImg) {
        throw new ApiError(401, "All the fields are required");
    }

    let coverImgUploaded;
    try {
        coverImgUploaded = await uploading(coverImg, 'Users');
        console.log("Image uploaded successfully:", coverImgUploaded);
    } catch (error) {
        console.error("Error uploading image:", error);
        throw new ApiError(500, 'Failed to upload image');
    }

    let user;
    try {
        console.log("Creating user ......");
        user = await User.create({
            username,
            email,
            password,
            avatar: coverImgUploaded.secure_url // Ensure the correct URL is used
        });
        console.log("User created......");
    } catch (error) {
        console.error("An error occurred while creating the user:", error);
        if (error.code === 11000) { // Duplicate key error
            throw new ApiError(410, 'User already registered');
        } else {
            throw new ApiError(500, 'Internal server error');
        }
    }

    const createdUser = await User.findById(user._id);
    return res.status(200).json({ createdUser });
}); 


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid email");
    }

    const isPassTrue = await user.isPasswordCorrect(password);
    if (!isPassTrue) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const updatedUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        maxAge: 24 * 60 * 60 * 1000
    };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({ updatedUser, at: accessToken });
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    res.status(200).json({ user });
});

export { registerUser, loginUser, getCurrentUser };

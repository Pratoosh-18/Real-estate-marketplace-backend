import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) {
            throw new ApiError(401, "Token not found");
        }

        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new Error('ACCESS_TOKEN_SECRET is not defined');
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            console.log("Decoded Token:", decodedToken);
        } catch (error) {
            console.error('Token verification failed:', error.message);
            throw new ApiError(401, "Invalid token");
        }

        let user;
        try {
            user = await User.findById(decodedToken._id).select("-password");
            if (!user) {
                throw new ApiError(404, "User not found");
            }
            console.log("User found:", user);
        } catch (error) {
            console.error('User retrieval failed:', error.message);
            throw new ApiError(500, "Internal server error");
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
});

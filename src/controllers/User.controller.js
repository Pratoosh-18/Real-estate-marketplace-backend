import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
}

const registerUser = asyncHandler( async (req, res) => {

    const { username, email, password } = req.body

    if (!username || !email || !password) {
        throw new ApiError(401, "All the fields are required")
    }
    let user = {};
    
    try {
        user = await User.create({
            username, email, password
        })
    } catch (error) {
        console.log("An error occured !! ")
        throw new ApiError(410, 'User already registered');
    }

    const createdUser = await User.findById(user._id)

    return res.status(200).json({ createdUser })
})

const loginUser = asyncHandler( async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(401, "Invalid email")
    }

    const isPassTrue = await user.isPasswordCorrect(password)
    if (!isPassTrue) {
        throw new ApiError(401, "Invalid password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    const updatedUser = await User.findById(user._id).select("-password")

    const options = {
        httpOnly: true,      
        secure: false,       
        sameSite: 'Lax',    
        maxAge: 24 * 60 * 60 * 1000
    };[]

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({ updatedUser, at: accessToken });
})

const logoutUser = asyncHandler( async (req, res) => {
    const filter = { _id: req.user?._id }

    await User.updateOne(
        filter,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const updatedUser = await User.findById(req.user?._id)
    return res.status(200)
        .json({ updatedUser })
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)

    res.status(200)
        .json({ user })
})


export { registerUser, loginUser, logoutUser, getCurrentUser }
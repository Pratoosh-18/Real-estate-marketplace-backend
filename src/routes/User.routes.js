import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { loginUser,registerUser,logoutUser,getCurrentUser } from "../controllers/User.controller.js";

const userRoutes = Router()

userRoutes.route("/register").post(
    registerUser
)
userRoutes.route("/login").post(
    loginUser
)
userRoutes.route("/logout").post(
    verifyJWT, logoutUser
)
userRoutes.route("/currentUser").get(
    verifyJWT, getCurrentUser
)

export default userRoutes
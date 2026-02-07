import { Router } from "express";
import { login, register, getMe, logout } from "./UserController.js";
import { listMyAttempts } from "./QuizAttemptController.js";
import { verifyToken } from "../middleware/auth.js";

const userRoute = Router();

// Public routes
userRoute.post("/login", login);
userRoute.post("/register", register);
userRoute.post("/logout", logout);

// Protected routes
userRoute.get("/me", verifyToken, getMe);
userRoute.get("/me/attempts", verifyToken, listMyAttempts);

export default userRoute;
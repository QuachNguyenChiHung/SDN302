import { Router } from "express";
import { login, register, getMe, logout } from "./UserController.ts";
import { listMyAttempts } from "./QuizAttemptController.ts";
import { verifyToken } from "../middleware/auth.ts";

const userRoute = Router();

// Public routes
userRoute.post("/login", login);
userRoute.post("/register", register);
userRoute.post("/logout", logout);

// Protected routes
userRoute.get("/me", verifyToken, getMe);
userRoute.get("/me/attempts", verifyToken, listMyAttempts);

export default userRoute;
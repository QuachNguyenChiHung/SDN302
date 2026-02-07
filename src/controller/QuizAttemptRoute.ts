import { Router } from "express";
import QuizAttemptService from "../services/QuizAttemptService.ts";
import { verifyToken } from "../middleware/auth.ts";
import { requireRole } from "../middleware/roleCheck.ts";

const quizAttemptRoute = Router();

// GET all quiz attempts (admin only - for reporting)
quizAttemptRoute.get("/", verifyToken, requireRole('admin'), async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const result = await QuizAttemptService.getAllQuizAttempts(page);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

// GET attempt by ID (admin only from this route)
quizAttemptRoute.get("/:id", verifyToken, requireRole('admin'), async (req, res, next) => {
    try {
        const id = req.params.id as string;
        const result = await QuizAttemptService.getQuizAttemptById(id);
        if (!result) {
            return res.status(404).json({ msg: 'Attempt not found' });
        }
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

export default quizAttemptRoute;
import { Router } from "express";
import QuestionService from "../services/QuestionService.ts";
import { verifyToken, optionalAuth } from "../middleware/auth.ts";
import { requireRole } from "../middleware/roleCheck.ts";

const questionRoute = Router();

// GET all questions (admin only - for management purposes)
questionRoute.get("/", verifyToken, requireRole('admin'), async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const result = await QuestionService.getAllQuestions(page);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

// Search questions by title/text
questionRoute.get("/search", optionalAuth, async (req, res, next) => {
    try {
        const { title } = req.query;
        if (!title) {
            return res.status(400).json({ msg: 'Search title is required' });
        }
        const questions = await QuestionService.getQuestionsByTitle(title as string);

        // Strip correctAnswerIndex for non-admin
        const isAdmin = req.user?.isAdmin;
        const result = questions.map((q: any) => {
            const obj = q.toObject ? q.toObject() : q;
            if (!isAdmin) {
                const { correctAnswerIndex, ...rest } = obj;
                return rest;
            }
            return obj;
        });

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

export default questionRoute;
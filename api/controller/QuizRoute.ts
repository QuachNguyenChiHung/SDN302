import { Router } from "express";
import { listQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz, searchQuizzes } from "./QuizController.js";
import { listQuestions, createQuestion, updateQuestion, deleteQuestion, getQuestion } from "./QuestionController.js";
import { createAttempt, getAttempt, listAttempts } from "./QuizAttemptController.js";
import { verifyToken, optionalAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";

const quizRoute = Router();

// Quiz routes
// Public: list and get quizzes (optionalAuth to check if admin for full question data)
quizRoute.get("/", listQuizzes);
quizRoute.get("/search", searchQuizzes);
quizRoute.get("/:id", optionalAuth, getQuiz);

// Admin only: create, update, delete quizzes
quizRoute.post("/", verifyToken, requireRole('admin'), createQuiz);
quizRoute.put("/:id", verifyToken, requireRole('admin'), updateQuiz);
quizRoute.delete("/:id", verifyToken, requireRole('admin'), deleteQuiz);

// Question routes (nested under quiz)
// Public: list questions (optionalAuth to strip correctAnswerIndex for non-admins)
quizRoute.get("/:quizId/questions", optionalAuth, listQuestions);
quizRoute.get("/:quizId/questions/:questionId", optionalAuth, getQuestion);

// Admin only: CRUD questions
quizRoute.post("/:quizId/questions", verifyToken, requireRole('admin'), createQuestion);
quizRoute.put("/:quizId/questions/:questionId", verifyToken, requireRole('admin'), updateQuestion);
quizRoute.delete("/:quizId/questions/:questionId", verifyToken, requireRole('admin'), deleteQuestion);

// Quiz attempt routes (nested under quiz)
// User must be authenticated to submit attempts
quizRoute.post("/:quizId/attempts", verifyToken, createAttempt);
quizRoute.get("/:quizId/attempts", verifyToken, listAttempts);
quizRoute.get("/:quizId/attempts/:attemptId", verifyToken, getAttempt);

export default quizRoute;
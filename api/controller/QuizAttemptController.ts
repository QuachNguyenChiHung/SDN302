import type { Request, Response } from 'express';
import QuizAttemptService from '../services/QuizAttemptService.js';
import QuestionService from '../services/QuestionService.js';
import QuizService from '../services/QuizService.js';

interface AnswerInput {
    questionId: string;
    answerIndex: number;
}

interface QuestionResult {
    question_id: string;
    answer_index: number;
    is_correct: boolean;
}

/**
 * POST /api/quizzes/:quizId/attempts
 * Body: { answers: [{ questionId, answerIndex }] }
 * Returns: { attemptId, score, list_question_result }
 */
export async function createAttempt(req: Request, res: Response) {
    try {
        const quizId = req.params.quizId as string;
        const { answers } = req.body as { answers: AnswerInput[] };

        if (!req.user) {
            return res.status(401).json({ msg: 'Authentication required' });
        }

        // Validate answers array
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ msg: 'Answers array is required' });
        }

        // Verify quiz exists
        const quiz = await QuizService.getQuizById(quizId);
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        // Get all questions for this quiz
        const questions = await QuestionService.getQuestionsByQuizId(quizId);

        if (questions.length === 0) {
            return res.status(400).json({ msg: 'Quiz has no questions' });
        }

        // Create a map of question ID to question for fast lookup
        const questionMap = new Map<string, any>();
        questions.forEach((q: any) => {
            questionMap.set(q._id.toString(), q);
        });

        // Build list_question_result and calculate score
        const list_question_result: QuestionResult[] = [];
        let correctCount = 0;

        for (const answer of answers) {
            const question = questionMap.get(answer.questionId);

            if (!question) {
                // Question not found in this quiz, skip or return error
                continue;
            }

            const is_correct = question.correctAnswerIndex === answer.answerIndex;

            if (is_correct) {
                correctCount++;
            }

            list_question_result.push({
                question_id: answer.questionId,
                answer_index: answer.answerIndex,
                is_correct
            });
        }

        // Calculate score as percentage
        const score = Math.round((correctCount / questions.length) * 100);

        // Save the attempt
        const attemptData = {
            user: req.user.id,
            quiz: quizId,
            list_question_result,
            score
        };

        const attempt = await QuizAttemptService.createQuizAttempt(attemptData);

        return res.status(201).json({
            attemptId: attempt._id,
            score,
            list_question_result,
            correctCount,
            totalQuestions: questions.length
        });
    } catch (error: any) {
        if (error.message?.includes('not found')) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        console.error('CreateAttempt error:', error);
        return res.status(500).json({ msg: 'Failed to create attempt' });
    }
}

/**
 * GET /api/quizzes/:quizId/attempts/:attemptId
 * Owner or admin can view
 */
export async function getAttempt(req: Request, res: Response) {
    try {
        const attemptId = req.params.attemptId as string;

        const attempt = await QuizAttemptService.getQuizAttemptById(attemptId);

        if (!attempt) {
            return res.status(404).json({ msg: 'Attempt not found' });
        }

        // Check ownership or admin
        const attemptUserId = (attempt as any).user?._id?.toString() || (attempt as any).user?.toString();
        if (!req.user?.isAdmin && req.user?.id !== attemptUserId) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        return res.status(200).json(attempt);
    } catch (error: any) {
        if (error.message?.includes('not found')) {
            return res.status(404).json({ msg: 'Attempt not found' });
        }
        console.error('GetAttempt error:', error);
        return res.status(500).json({ msg: 'Failed to fetch attempt' });
    }
}

/**
 * GET /api/quizzes/:quizId/attempts
 * List attempts for a quiz (user sees own attempts, admin sees all)
 */
export async function listAttempts(req: Request, res: Response) {
    try {
        const quizId = req.params.quizId as string;

        if (!req.user) {
            return res.status(401).json({ msg: 'Authentication required' });
        }

        // Verify quiz exists
        const quiz = await QuizService.getQuizById(quizId);
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        let attempts;

        if (req.user.isAdmin) {
            // Admin sees all attempts for this quiz
            attempts = await QuizAttemptService.getQuizAttemptsByQuizId(quizId);
        } else {
            // User sees only their own attempts
            const allAttempts = await QuizAttemptService.getQuizAttemptsByQuizId(quizId);
            attempts = allAttempts.filter((a: any) => {
                const attemptUserId = a.user?._id?.toString() || a.user?.toString();
                return attemptUserId === req.user!.id;
            });
        }

        return res.status(200).json(attempts);
    } catch (error: any) {
        if (error.message?.includes('not found')) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        console.error('ListAttempts error:', error);
        return res.status(500).json({ msg: 'Failed to fetch attempts' });
    }
}

/**
 * GET /api/users/me/attempts
 * List all attempts by current user across all quizzes
 */
export async function listMyAttempts(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ msg: 'Authentication required' });
        }

        const attempts = await QuizAttemptService.getQuizAttemptsByUserId(req.user.id);
        return res.status(200).json(attempts);
    } catch (error) {
        console.error('ListMyAttempts error:', error);
        return res.status(500).json({ msg: 'Failed to fetch attempts' });
    }
}

export default { createAttempt, getAttempt, listAttempts, listMyAttempts };

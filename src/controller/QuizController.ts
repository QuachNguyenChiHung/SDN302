import type { Request, Response } from 'express';
import QuizService from '../services/QuizService.ts';
import QuestionService from '../services/QuestionService.ts';

/**
 * GET /api/quizzes
 * Query: ?page=1
 * Returns list of quizzes (without question details)
 */
export async function listQuizzes(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const quizzes = await QuizService.getAllQuizzes(page);
        return res.status(200).json(quizzes);
    } catch (error) {
        console.error('ListQuizzes error:', error);
        return res.status(500).json({ msg: 'Failed to fetch quizzes' });
    }
}

/**
 * GET /api/quizzes/:id
 * For users: excludes correctAnswerIndex in questions
 * For admin: includes full question data
 */
export async function getQuiz(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        // Get quiz with populated questions (single query)
        const quiz = await QuizService.getQuizById(id);
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        const quizObj = quiz.toObject ? quiz.toObject() : quiz;

        // Strip correctAnswerIndex for non-admin users
        const isAdmin = req.user?.isAdmin;
        if (!isAdmin && quizObj.questions) {
            quizObj.questions = quizObj.questions.map((q: any) => {
                const { correctAnswerIndex, ...rest } = q;
                return rest;
            });
        }

        return res.status(200).json(quizObj);
    } catch (error: any) {
        if (error.message?.includes('not found')) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        console.error('GetQuiz error:', error);
        return res.status(500).json({ msg: 'Failed to fetch quiz' });
    }
}

/**
 * POST /api/quizzes
 * Body: { title, description }
 * Admin only
 */
export async function createQuiz(req: Request, res: Response) {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ msg: 'Title is required' });
        }

        const quizData = {
            title,
            description: description || '',
            author: req.user!.id,
            questions: []
        };

        const quiz = await QuizService.createQuiz(quizData);
        return res.status(201).json(quiz);
    } catch (error) {
        console.error('CreateQuiz error:', error);
        return res.status(500).json({ msg: 'Failed to create quiz' });
    }
}

/**
 * PUT /api/quizzes/:id
 * Body: { title?, description? }
 * Admin only
 */
export async function updateQuiz(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { title, description } = req.body;

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;

        const quiz = await QuizService.updateQuiz(id, updateData);

        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        return res.status(200).json(quiz);
    } catch (error: any) {
        if (error.message?.includes('not found')) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        console.error('UpdateQuiz error:', error);
        return res.status(500).json({ msg: 'Failed to update quiz' });
    }
}

/**
 * DELETE /api/quizzes/:id
 * Admin only - also deletes associated questions
 */
export async function deleteQuiz(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        // Delete associated questions first
        await QuestionService.deleteQuestionsByQuizId(id);

        const quiz = await QuizService.deleteQuiz(id);

        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        return res.status(204).send();
    } catch (error: any) {
        if (error.message?.includes('not found')) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        console.error('DeleteQuiz error:', error);
        return res.status(500).json({ msg: 'Failed to delete quiz' });
    }
}

/**
 * GET /api/quizzes/search?title=keyword
 * Search quizzes by title
 */
export async function searchQuizzes(req: Request, res: Response) {
    try {
        const { title } = req.query;
        if (!title) {
            return res.status(400).json({ msg: 'Search title is required' });
        }
        const quizzes = await QuizService.getQuizzesByQuizTitle(title as string);
        return res.status(200).json(quizzes);
    } catch (error) {
        console.error('SearchQuizzes error:', error);
        return res.status(500).json({ msg: 'Failed to search quizzes' });
    }
}

export default { listQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz, searchQuizzes };

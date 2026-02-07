import type { Request, Response } from 'express';
import QuestionService from '../services/QuestionService.js';
import QuizService from '../services/QuizService.js';
import Quiz from '../model/Quiz.js';

/**
 * GET /api/quizzes/:quizId/questions
 * For users: excludes correctAnswerIndex
 * For admin: includes full data
 */
export async function listQuestions(req: Request, res: Response) {
    try {
        const quizId = req.params.quizId as string;

        // Get quiz with populated questions (single query)
        const quiz = await QuizService.getQuizById(quizId);
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
        console.error('ListQuestions error:', error);
        return res.status(500).json({ msg: 'Failed to fetch questions' });
    }
}

/**
 * POST /api/quizzes/:quizId/questions
 * Body: { text, options, keywords?, correctAnswerIndex }
 * Admin only
 */
export async function createQuestion(req: Request, res: Response) {
    try {
        const quizId = req.params.quizId as string;
        const { text, options, keywords, correctAnswerIndex } = req.body;

        // Validate required fields
        if (!text) {
            return res.status(400).json({ msg: 'Question text is required' });
        }
        if (!options || !Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ msg: 'At least 2 options are required' });
        }
        if (correctAnswerIndex === undefined || correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
            return res.status(400).json({ msg: 'Valid correctAnswerIndex is required' });
        }

        // Verify quiz exists
        const quiz = await QuizService.getQuizById(quizId);
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        const questionData = {
            text,
            options,
            keywords: keywords || [],
            correctAnswerIndex,
            quizID: quizId
        };

        const question = await QuestionService.createQuestion(questionData);

        // Add question to quiz's questions array
        await Quiz.findByIdAndUpdate(quizId, {
            $push: { questions: question._id }
        });

        return res.status(201).json(question);
    } catch (error: any) {
        if (error.message?.includes('not found')) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        console.error('CreateQuestion error:', error);
        return res.status(500).json({ msg: 'Failed to create question' });
    }
}

/**
 * PUT /api/quizzes/:quizId/questions/:questionId
 * Body: { text?, options?, keywords?, correctAnswerIndex? }
 * Admin only
 */
export async function updateQuestion(req: Request, res: Response) {
    try {
        const quizId = req.params.quizId as string;
        const questionId = req.params.questionId as string;
        const { text, options, keywords, correctAnswerIndex } = req.body;

        // Verify quiz exists
        const quiz = await QuizService.getQuizById(quizId);
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        // Validate options if provided
        if (options !== undefined) {
            if (!Array.isArray(options) || options.length < 2) {
                return res.status(400).json({ msg: 'At least 2 options are required' });
            }
        }

        // Validate correctAnswerIndex if provided
        if (correctAnswerIndex !== undefined) {
            const optionsLength = options?.length ?? (await QuestionService.getQuestionById(questionId)).options.length;
            if (correctAnswerIndex < 0 || correctAnswerIndex >= optionsLength) {
                return res.status(400).json({ msg: 'correctAnswerIndex out of range' });
            }
        }

        const updateData: any = {};
        if (text !== undefined) updateData.text = text;
        if (options !== undefined) updateData.options = options;
        if (keywords !== undefined) updateData.keywords = keywords;
        if (correctAnswerIndex !== undefined) updateData.correctAnswerIndex = correctAnswerIndex;

        const question = await QuestionService.updateQuestion(questionId, updateData);

        if (!question) {
            return res.status(404).json({ msg: 'Question not found' });
        }

        return res.status(200).json(question);
    } catch (error: any) {
        if (error.message?.includes('not found')) {
            return res.status(404).json({ msg: 'Resource not found' });
        }
        console.error('UpdateQuestion error:', error);
        return res.status(500).json({ msg: 'Failed to update question' });
    }
}

/**
 * DELETE /api/quizzes/:quizId/questions/:questionId
 * Admin only
 */
export async function deleteQuestion(req: Request, res: Response) {
    try {
        const quizId = req.params.quizId as string;
        const questionId = req.params.questionId as string;

        // Verify quiz exists
        const quiz = await QuizService.getQuizById(quizId);
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }

        const question = await QuestionService.deleteQuestion(questionId);

        if (!question) {
            return res.status(404).json({ msg: 'Question not found' });
        }

        // Remove question from quiz's questions array
        await Quiz.findByIdAndUpdate(quizId, {
            $pull: { questions: questionId }
        });

        return res.status(204).send();
    } catch (error: any) {
        if (error.message?.includes('not found')) {
            return res.status(404).json({ msg: 'Resource not found' });
        }
        console.error('DeleteQuestion error:', error);
        return res.status(500).json({ msg: 'Failed to delete question' });
    }
}

/**
 * GET /api/quizzes/:quizId/questions/:questionId
 * Get single question
 */
export async function getQuestion(req: Request, res: Response) {
    try {
        const questionId = req.params.questionId as string;
        const question = await QuestionService.getQuestionById(questionId);

        if (!question) {
            return res.status(404).json({ msg: 'Question not found' });
        }

        // Strip correctAnswerIndex for non-admin users
        const isAdmin = req.user?.isAdmin;
        const questionObj = question.toObject ? question.toObject() : question;

        if (!isAdmin) {
            const { correctAnswerIndex, ...rest } = questionObj;
            return res.status(200).json(rest);
        }

        return res.status(200).json(questionObj);
    } catch (error: any) {
        if (error.message?.includes('not found')) {
            return res.status(404).json({ msg: 'Question not found' });
        }
        console.error('GetQuestion error:', error);
        return res.status(500).json({ msg: 'Failed to fetch question' });
    }
}

export default { listQuestions, createQuestion, updateQuestion, deleteQuestion, getQuestion };

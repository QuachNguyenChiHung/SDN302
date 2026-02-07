import QuestionRepo from "../repository/QuestionRepo.js";

class QuestionService {
    // Create a new question
    async createQuestion(questionData: any) {
        try {
            return await QuestionRepo.create(questionData);
        } catch (error: any) {
            throw new Error(`Error creating question: ${error.message}`);
        }
    }

    // Get all questions
    async getAllQuestions(page: number) {
        try {
            return await QuestionRepo.findAll(page);
        } catch (error: any) {
            throw new Error(`Error fetching questions: ${error.message}`);
        }
    }

    // Get question by ID
    async getQuestionById(id: string) {
        try {
            const question = await QuestionRepo.findById(id);
            if (!question) {
                throw new Error('Question not found');
            }
            return question;
        } catch (error: any) {
            throw new Error(`Error fetching question: ${error.message}`);
        }
    }

    // Get questions by quiz ID
    async getQuestionsByQuizId(quizId: string) {
        try {
            return await QuestionRepo.findByQuizId(quizId);
        } catch (error: any) {
            throw new Error(`Error fetching questions by quiz: ${error.message}`);
        }
    }

    // Get questions by keywords
    async getQuestionsByKeywords(keywords: string[]) {
        try {
            return await QuestionRepo.findByKeywords(keywords);
        } catch (error: any) {
            throw new Error(`Error fetching questions by keywords: ${error.message}`);
        }
    }
    // Get questions by keywords
    async getQuestionsByTitle(keywords: string) {
        try {
            return await QuestionRepo.findByTitle(keywords);
        } catch (error: any) {
            throw new Error(`Error fetching questions by title: ${error.message}`);
        }
    }
    // Update question
    async updateQuestion(id: string, questionData: any) {
        try {
            const question = await QuestionRepo.update(id, questionData);
            if (!question) {
                throw new Error('Question not found');
            }
            return question;
        } catch (error: any) {
            throw new Error(`Error updating question: ${error.message}`);
        }
    }

    // Delete question
    async deleteQuestion(id: string) {
        try {
            const question = await QuestionRepo.delete(id);
            if (!question) {
                throw new Error('Question not found');
            }
            return question;
        } catch (error: any) {
            throw new Error(`Error deleting question: ${error.message}`);
        }
    }

    // Delete all questions by quiz ID
    async deleteQuestionsByQuizId(quizId: string) {
        try {
            return await QuestionRepo.deleteByQuizId(quizId);
        } catch (error: any) {
            throw new Error(`Error deleting questions by quiz: ${error.message}`);
        }
    }
}

export default new QuestionService();

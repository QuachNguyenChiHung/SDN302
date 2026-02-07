import QuizRepo from "../repository/QuizRepo.js";

class QuizService {
    // Create a new quiz
    async createQuiz(quizData: any) {
        try {
            return await QuizRepo.create(quizData);
        } catch (error: any) {
            throw new Error(`Error creating quiz: ${error.message}`);
        }
    }

    // Get all quizzes
    async getAllQuizzes(page: number) {
        try {
            return await QuizRepo.findAll(page);
        } catch (error: any) {
            throw new Error(`Error fetching quizzes: ${error.message}`);
        }
    }

    // Get quiz by ID
    async getQuizById(id: string) {
        try {
            const quiz = await QuizRepo.findById(id);
            if (!quiz) {
                throw new Error('Quiz not found');
            }
            return quiz;
        } catch (error: any) {
            throw new Error(`Error fetching quiz: ${error.message}`);
        }
    }

    // Get quizzes by author
    async getQuizzesByAuthor(authorId: string) {
        try {
            return await QuizRepo.findByAuthor(authorId);
        } catch (error: any) {
            throw new Error(`Error fetching quizzes by author: ${error.message}`);
        }
    }

    // Get quizzes by title
    async getQuizzesByQuizTitle(keywords: string) {
        try {
            return await QuizRepo.findByName(keywords);
        } catch (error: any) {
            throw new Error(`Error fetching quizzes by keywords: ${error.message}`);
        }
    }

    // Update quiz
    async updateQuiz(id: string, quizData: any) {
        try {
            const quiz = await QuizRepo.update(id, quizData);
            if (!quiz) {
                throw new Error('Quiz not found');
            }
            return quiz;
        } catch (error: any) {
            throw new Error(`Error updating quiz: ${error.message}`);
        }
    }

    // Delete quiz
    async deleteQuiz(id: string) {
        try {
            const quiz = await QuizRepo.delete(id);
            if (!quiz) {
                throw new Error('Quiz not found');
            }
            return quiz;
        } catch (error: any) {
            throw new Error(`Error deleting quiz: ${error.message}`);
        }
    }
}

export default new QuizService();

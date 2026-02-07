import QuizAttemptRepo from "../repository/QuizAttemptRepo.ts";

class QuizAttemptService {
    // Create a new quiz attempt
    async createQuizAttempt(attemptData: any) {
        try {
            return await QuizAttemptRepo.create(attemptData);
        } catch (error: any) {
            throw new Error(`Error creating quiz attempt: ${error.message}`);
        }
    }

    // Get all quiz attempts
    async getAllQuizAttempts(page: number) {
        try {
            return await QuizAttemptRepo.findAll(page);
        } catch (error: any) {
            throw new Error(`Error fetching quiz attempts: ${error.message}`);
        }
    }

    // Get quiz attempt by ID
    async getQuizAttemptById(id: string) {
        try {
            const attempt = await QuizAttemptRepo.findById(id);
            if (!attempt) {
                throw new Error('Quiz attempt not found');
            }
            return attempt;
        } catch (error: any) {
            throw new Error(`Error fetching quiz attempt: ${error.message}`);
        }
    }

    // Get quiz attempts by user ID
    async getQuizAttemptsByUserId(userId: string) {
        try {
            return await QuizAttemptRepo.findByUserId(userId);
        } catch (error: any) {
            throw new Error(`Error fetching quiz attempts by user: ${error.message}`);
        }
    }

    // Get quiz attempts by quiz ID
    async getQuizAttemptsByQuizId(quizId: string) {
        try {
            return await QuizAttemptRepo.findByQuizId(quizId);
        } catch (error: any) {
            throw new Error(`Error fetching quiz attempts by quiz: ${error.message}`);
        }
    }

    // Update quiz attempt
    async updateQuizAttempt(id: string, attemptData: any) {
        try {
            const attempt = await QuizAttemptRepo.update(id, attemptData);
            if (!attempt) {
                throw new Error('Quiz attempt not found');
            }
            return attempt;
        } catch (error: any) {
            throw new Error(`Error updating quiz attempt: ${error.message}`);
        }
    }

    // Delete quiz attempt
    async deleteQuizAttempt(id: string) {
        try {
            const attempt = await QuizAttemptRepo.delete(id);
            if (!attempt) {
                throw new Error('Quiz attempt not found');
            }
            return attempt;
        } catch (error: any) {
            throw new Error(`Error deleting quiz attempt: ${error.message}`);
        }
    }
}

export default new QuizAttemptService();

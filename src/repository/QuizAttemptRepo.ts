import QuizAttempt from "../model/QuizAttempt.js";

class QuizAttemptRepo {
    // Create
    async create(data: any) {
        const quizAttempt = new QuizAttempt(data);
        return await quizAttempt.save();
    }

    // Read all
    async findAll(page: number) {
        const page_size = 10;
        return await QuizAttempt.find()
            .populate('user', 'username')
            .populate('quiz')
            .populate('list_question_result.question_id').skip((page - 1) * page_size).limit(page_size);
    }

    // Read by ID
    async findById(id: string) {
        return await QuizAttempt.findById(id)
            .populate('user', 'username')
            .populate('quiz')
            .populate('list_question_result.question_id');
    }

    // Read by User ID
    async findByUserId(userId: string) {
        return await QuizAttempt.find({ user: userId })
            .populate('user', 'username')
            .populate('quiz')
            .populate('list_question_result.question_id');
    }

    // Read by Quiz ID
    async findByQuizId(quizId: string) {
        return await QuizAttempt.find({ quiz: quizId })
            .populate('user', 'username')
            .populate('quiz')
            .populate('list_question_result.question_id');
    }

    // Update
    async update(id: string, data: any) {
        return await QuizAttempt.findByIdAndUpdate(id, data, { new: true, runValidators: true })
            .populate('user', 'username')
            .populate('quiz')
            .populate('list_question_result.question_id');
    }

    // Delete
    async delete(id: string) {
        return await QuizAttempt.findByIdAndDelete(id);
    }
}

export default new QuizAttemptRepo();

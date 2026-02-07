import Quiz from "../model/Quiz.js";
class QuizRepo {
    // Create
    async create(data: any) {
        const quiz = new Quiz(data);
        return await quiz.save();
    }

    // Read all
    async findAll(page: number) {
        const page_size = 10;
        return await Quiz.find()
            .populate('author', 'username')
            .populate('questions').skip((page - 1) * page_size).limit(page_size);
    }

    // Read by ID
    async findById(id: string) {
        return await Quiz.findById(id)
            .populate('author', 'username')
            .populate('questions');
    }

    // Read by author
    async findByAuthor(authorId: string) {
        return await Quiz.find({ author: authorId })
            .populate('author', 'username')
            .populate('questions');
    }
    // Find By Name
    async findByName(keywords: string) {
        return await Quiz.find({ title: { $regex: keywords, $options: 'i' } })
            .populate('author', 'username')
            .populate('questions');
    }

    // Update
    async update(id: string, data: any) {
        return await Quiz.findByIdAndUpdate(id, data, { new: true, runValidators: true })
            .populate('author', 'username')
            .populate('questions');
    }

    // Delete
    async delete(id: string) {
        return await Quiz.findByIdAndDelete(id);
    }
}

export default new QuizRepo();

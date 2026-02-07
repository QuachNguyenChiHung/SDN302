import Question from "../model/Question.js";

class QuestionRepo {
    // Create
    async create(data: any) {
        const question = new Question(data);
        return await question.save();
    }

    // Read all
    async findAll(page: number) {
        const page_size = 10;
        return await Question.find().populate('quizID').skip((page - 1) * page_size).limit(page_size);
    }

    // Read by ID
    async findById(id: string) {
        return await Question.findById(id).populate('quizID');
    }

    // Read by Quiz ID
    async findByQuizId(quizId: string) {
        return await Question.find({ quizID: quizId });
    }

    // Read by keywords
    async findByTitle(keywords: string) {
        return await Question.find({ text: { $regex: keywords, $options: 'i' } }).populate('quizID');
    }

    // Read by keywords
    async findByKeywords(keywords: string[]) {
        return await Question.find({ keywords: { $in: keywords } }).populate('quizID');
    }

    // Update
    async update(id: string, data: any) {
        return await Question.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    // Delete
    async delete(id: string) {
        return await Question.findByIdAndDelete(id);
    }

    // Delete by Quiz ID
    async deleteByQuizId(quizId: string) {
        return await Question.deleteMany({ quizID: quizId });
    }
}

export default new QuestionRepo();

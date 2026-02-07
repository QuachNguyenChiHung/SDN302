import User from "../model/User.ts";

class UserRepo {
    // Create
    async create(data: any) {
        const user = new User(data);
        return await user.save();
    }

    // Read all
    async findAll(page: number) {
        const page_size = 10;
        //0-9
        return await User.find().populate('list_quizzes').skip((page - 1) * page_size).limit(page_size);
    }

    // Read by ID
    async findById(id: string) {
        return await User.findById(id).populate('list_quizzes');
    }

    // Read by username
    async findByUsername(username: string) {
        return await User.findOne({ username }).populate('list_quizzes');
    }

    // Update
    async update(id: string, data: any) {
        return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    // Delete
    async delete(id: string) {
        return await User.findByIdAndDelete(id);
    }
}

export default new UserRepo();

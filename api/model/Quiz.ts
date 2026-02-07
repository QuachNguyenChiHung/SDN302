import mongoose, { Schema } from "mongoose";
const Quiz = mongoose.model('Quiz', new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    questions: [
        {
            ref: 'Question',
            type: Schema.Types.ObjectId
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
}));
export default Quiz;
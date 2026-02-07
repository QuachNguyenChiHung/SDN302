import mongoose, { Schema } from "mongoose";
import { ObjectId } from "mongodb";
const Question = mongoose.model("Question", new Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [String],
        required: true
    },
    keywords: {
        type: [String],
        default: []
    },
    correctAnswerIndex: {
        type: Number,
        required: true
    },
    quizID: {
        type: ObjectId,
        ref: 'Quiz',
        required: true
    }
}));
export default Question;
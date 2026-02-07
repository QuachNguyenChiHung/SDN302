import mongoose, { Mongoose, Schema } from "mongoose";

const model = mongoose.model("QuizAttempt", new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    quiz: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Quiz'
    },
    list_question_result: [
        {
            question_id: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'Question'
            },
            answer_index: {
                type: Number,
                required: true
            },
            is_correct: {
                type: Boolean,
                default: false
            }
        }
    ],
    score: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
}));
export default model
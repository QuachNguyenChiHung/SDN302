import mongoose, { Schema } from "mongoose";
const User = mongoose.model('User', new Schema({
    username: {
        type: String,
        default: "",
        unique: true
    },
    password: {
        type: String,
        default: ""
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    list_quizzes: [
        {
            type: Schema.Types.ObjectId,
            ref: "Quiz"
        }
    ]
}));
export default User
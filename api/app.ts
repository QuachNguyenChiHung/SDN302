import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { Errback, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser'
import userRoute from './controller/UserRoute.js';
import quizRoute from './controller/QuizRoute.js';
import quizAttemptRoute from './controller/QuizAttemptRoute.js';
import questionRoute from './controller/QuestionRoute.js';

dotenv.config();

const COOKIE_SECRET = process.env.COOKIE_SECRET || 'super-secret-cookie-key';

const app = express();
app.use(cookieParser(COOKIE_SECRET)); // Enable signed cookies
app.use(express.json());
app.use(cors({ origin: process.env.FE || 'http://localhost:5173', credentials: true }));
app.use(express.urlencoded({ extended: true }));
const tme = process.env.DB_URL || 'sds';
(
    async () => {
        try {
            await mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/', {
                dbName: process.env.DB_NAME || 'EX4'
            });
            app.listen(3000, () => {
                console.log("runningn");
            });
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    }
)();
app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});
app.use("/api/users", userRoute);
app.use("/api/quizzes", quizRoute);
app.use("/api/quizAttempts", quizAttemptRoute);
app.use("/api/questions", questionRoute);
app.use((err: Errback, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    return res.status(500).json({ msg: "Internal Server Error" });
});
export default app;
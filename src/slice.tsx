import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./ultis/api";

// Types
export interface User {
    id: string;
    username: string;
    isAdmin: boolean;
}

export interface Question {
    _id: string;
    text: string;
    options: string[];
    keywords: string[];
    correctAnswerIndex?: number;
    quizID: string;
}

export interface Quiz {
    _id: string;
    title: string;
    description: string;
    questions: Question[];
    author: string;
}

export interface QuestionResult {
    question_id: string;
    answer_index: number;
    is_correct: boolean;
}

export interface QuizAttempt {
    _id: string;
    user: User;
    quiz: Quiz;
    list_question_result: QuestionResult[];
    score: number;
    createdAt: string;
}

// Auth Thunks
const registerUser = createAsyncThunk(
    "auth/register",
    async (
        payload: { username: string; password: string; isAdmin?: boolean },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.post("/users/register", payload);
            return res.data;
        } catch (err: any) {
            const msg = err?.response?.data?.msg || err?.message || "Register failed";
            return rejectWithValue(msg);
        }
    }
);

const loginUser = createAsyncThunk(
    "auth/login",
    async (
        payload: { username: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.post("/users/login", payload);
            return res.data;
        } catch (err: any) {
            const msg = err?.response?.data?.msg || err?.message || "Login failed";
            return rejectWithValue(msg);
        }
    }
);

const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const res = await api.get("/users/me");
            return res.data;
        } catch (err: any) {
            const msg = err?.response?.data?.msg || "Failed to fetch user";
            return rejectWithValue(msg);
        }
    }
);

const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await api.post("/users/logout");
            return null;
        } catch (err: any) {
            return rejectWithValue("Logout failed");
        }
    }
);

// Quiz Thunks
const fetchQuizzes = createAsyncThunk(
    "quiz/fetchAll",
    async (page: number = 1, { rejectWithValue }) => {
        try {
            const res = await api.get(`/quizzes?page=${page}`);
            return res.data;
        } catch (err: any) {
            const msg = err?.response?.data?.msg || "Failed to fetch quizzes";
            return rejectWithValue(msg);
        }
    }
);

const fetchQuizById = createAsyncThunk(
    "quiz/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await api.get(`/quizzes/${id}/questions`);
            return res.data;
        } catch (err: any) {
            const msg = err?.response?.data?.msg || "Failed to fetch quiz";
            return rejectWithValue(msg);
        }
    }
);

const createQuiz = createAsyncThunk(
    "quiz/create",
    async (payload: { title: string; description: string }, { rejectWithValue }) => {
        try {
            const res = await api.post("/quizzes", payload);
            return res.data;
        } catch (err: any) {
            const msg = err?.response?.data?.msg || "Failed to create quiz";
            return rejectWithValue(msg);
        }
    }
);

const updateQuiz = createAsyncThunk(
    "quiz/update",
    async ({ id, data }: { id: string; data: { title?: string; description?: string } }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/quizzes/${id}`, data);
            return res.data;
        } catch (err: any) {
            const msg = err?.response?.data?.msg || "Failed to update quiz";
            return rejectWithValue(msg);
        }
    }
);

const deleteQuiz = createAsyncThunk(
    "quiz/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/quizzes/${id}`);
            return id;
        } catch (err: any) {
            const msg = err?.response?.data?.msg || "Failed to delete quiz";
            return rejectWithValue(msg);
        }
    }
);

// Question Thunks
const createQuestion = createAsyncThunk(
    "question/create",
    async ({ quizId, data }: { quizId: string; data: { text: string; options: string[]; keywords: string[]; correctAnswerIndex: number } }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/quizzes/${quizId}/questions`, data);
            return res.data;
        } catch (err: any) {
            const msg = err?.response?.data?.msg || "Failed to create question";
            return rejectWithValue(msg);
        }
    }
);

const updateQuestion = createAsyncThunk(
    "question/update",
    async ({ quizId, questionId, data }: { quizId: string; questionId: string; data: any }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/quizzes/${quizId}/questions/${questionId}`, data);
            return res.data;
        } catch (err: any) {
            const msg = err?.response?.data?.msg || "Failed to update question";
            return rejectWithValue(msg);
        }
    }
);

const deleteQuestion = createAsyncThunk(
    "question/delete",
    async ({ quizId, questionId }: { quizId: string; questionId: string }, { rejectWithValue }) => {
        try {
            await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
            return { quizId, questionId };
        } catch (err: any) {
            const msg = err?.response?.data?.msg || "Failed to delete question";
            return rejectWithValue(msg);
        }
    }
);

// Quiz Attempt Thunks
const submitQuizAttempt = createAsyncThunk(
    "attempt/submit",
    async ({ quizId, answers }: { quizId: string; answers: { questionId: string; answerIndex: number }[] }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/quizzes/${quizId}/attempts`, { answers });
            return res.data;
        } catch (err: any) {
            const msg = err?.response?.data?.msg || "Failed to submit quiz";
            return rejectWithValue(msg);
        }
    }
);

const fetchMyAttempts = createAsyncThunk(
    "attempt/fetchMine",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/users/me/attempts");
            return res.data;
        } catch (err: any) {
            const msg = err?.response?.data?.msg || "Failed to fetch attempts";
            return rejectWithValue(msg);
        }
    }
);

interface AppState {
    user: User | null;
    isAuthenticated: boolean;
    quizzes: Quiz[];
    currentQuiz: Quiz | null;
    attempts: QuizAttempt[];
    lastAttemptResult: { attemptId: string; score: number; list_question_result: QuestionResult[]; correctCount: number; totalQuestions: number } | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    authStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    quizLoading: boolean;
    msg: string;
}

const initialState: AppState = {
    user: null,
    isAuthenticated: false,
    quizzes: [],
    currentQuiz: null,
    attempts: [],
    lastAttemptResult: null,
    status: 'idle',
    authStatus: 'loading',
    quizLoading: false,
    msg: ''
};

const slice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        clearMsg: (state) => {
            state.msg = '';
        },
        clearLastAttempt: (state) => {
            state.lastAttemptResult = null;
        },
        setCurrentQuiz: (state, action) => {
            state.currentQuiz = action.payload;
        }
    },
    extraReducers: (builder) => {
        // Register
        builder
            .addCase(registerUser.fulfilled, (state) => {
                state.status = 'succeeded';
                state.msg = 'Registered successfully! Please login.';
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed';
                state.msg = action.payload as string;
            });

        // Login
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.msg = '';
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.msg = action.payload as string;
            })


        // Fetch current user
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.authStatus = 'loading';
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.authStatus = 'succeeded';
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.authStatus = 'succeeded'; // Don't stay in loading state
            });

        // Logout
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.quizzes = [];
                state.currentQuiz = null;
                state.attempts = [];
            });

        // Fetch quizzes
        builder
            .addCase(fetchQuizzes.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.quizzes = action.payload;
            })
            .addCase(fetchQuizzes.rejected, (state, action) => {
                state.status = 'failed';
                state.msg = action.payload as string;
            });

        // Fetch quiz by ID
        builder
            .addCase(fetchQuizById.pending, (state) => {
                state.quizLoading = true;
            })
            .addCase(fetchQuizById.fulfilled, (state, action) => {
                state.quizLoading = false;
                state.currentQuiz = action.payload;
            })
            .addCase(fetchQuizById.rejected, (state, action) => {
                state.quizLoading = false;
                state.msg = action.payload as string;
            });

        // Create quiz
        builder
            .addCase(createQuiz.fulfilled, (state, action) => {
                state.quizzes.push(action.payload);
                state.msg = 'Quiz created successfully!';
            })
            .addCase(createQuiz.rejected, (state, action) => {
                state.msg = action.payload as string;
            });

        // Update quiz
        builder
            .addCase(updateQuiz.fulfilled, (state, action) => {
                const idx = state.quizzes.findIndex(q => q._id === action.payload._id);
                if (idx !== -1) state.quizzes[idx] = action.payload;
                if (state.currentQuiz?._id === action.payload._id) {
                    state.currentQuiz = { ...state.currentQuiz, ...action.payload };
                }
                state.msg = 'Quiz updated successfully!';
            })
            .addCase(updateQuiz.rejected, (state, action) => {
                state.msg = action.payload as string;
            });

        // Delete quiz
        builder
            .addCase(deleteQuiz.fulfilled, (state, action) => {
                state.quizzes = state.quizzes.filter(q => q._id !== action.payload);
                state.msg = 'Quiz deleted successfully!';
            })
            .addCase(deleteQuiz.rejected, (state, action) => {
                state.msg = action.payload as string;
            });

        // Create question
        builder
            .addCase(createQuestion.fulfilled, (state, action) => {
                if (state.currentQuiz) {
                    state.currentQuiz.questions.push(action.payload);
                }
                state.msg = 'Question added!';
            })
            .addCase(createQuestion.rejected, (state, action) => {
                state.msg = action.payload as string;
            });

        // Update question
        builder
            .addCase(updateQuestion.fulfilled, (state, action) => {
                if (state.currentQuiz) {
                    const idx = state.currentQuiz.questions.findIndex(q => q._id === action.payload._id);
                    if (idx !== -1) state.currentQuiz.questions[idx] = action.payload;
                }
                state.msg = 'Question updated!';
            })
            .addCase(updateQuestion.rejected, (state, action) => {
                state.msg = action.payload as string;
            });

        // Delete question
        builder
            .addCase(deleteQuestion.fulfilled, (state, action) => {
                if (state.currentQuiz) {
                    state.currentQuiz.questions = state.currentQuiz.questions.filter(
                        q => q._id !== action.payload.questionId
                    );
                }
                state.msg = 'Question deleted!';
            })
            .addCase(deleteQuestion.rejected, (state, action) => {
                state.msg = action.payload as string;
            });

        // Submit attempt
        builder
            .addCase(submitQuizAttempt.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(submitQuizAttempt.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.lastAttemptResult = action.payload;
            })
            .addCase(submitQuizAttempt.rejected, (state, action) => {
                state.status = 'failed';
                state.msg = action.payload as string;
            });

        // Fetch my attempts
        builder
            .addCase(fetchMyAttempts.fulfilled, (state, action) => {
                state.attempts = action.payload;
            });
    }
});

export const { clearMsg, clearLastAttempt, setCurrentQuiz } = slice.actions;
export {
    registerUser,
    loginUser,
    fetchCurrentUser,
    logoutUser,
    fetchQuizzes,
    fetchQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    submitQuizAttempt,
    fetchMyAttempts
};
export default slice.reducer;
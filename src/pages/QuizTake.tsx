import { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { ChiHungAppDispatch, ChiHungAppSelector } from '../ultis/hook';
import { fetchQuizById, submitQuizAttempt, clearLastAttempt, clearMsg } from '../slice';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function QuizTake() {
    const { id } = useParams<{ id: string }>();
    const dispatch = ChiHungAppDispatch();
    const navigate = useNavigate();
    const currentQuiz = ChiHungAppSelector(s => s.currentQuiz);
    const quizLoading = ChiHungAppSelector(s => s.quizLoading);
    const msg = ChiHungAppSelector(s => s.msg);
    const lastAttemptResult = ChiHungAppSelector(s => s.lastAttemptResult);

    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchQuizById(id));
            dispatch(clearLastAttempt());
        }
    }, [id, dispatch]);

    const handleAnswerChange = (questionId: string, answerIndex: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    };

    const handleSubmit = async () => {
        if (!currentQuiz || !id) return;

        const answerArray = Object.entries(answers).map(([questionId, answerIndex]) => ({
            questionId,
            answerIndex
        }));

        await dispatch(submitQuizAttempt({ quizId: id, answers: answerArray }));
        setSubmitted(true);
    };

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = currentQuiz?.questions?.length || 0;
    const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    if (quizLoading && !currentQuiz) {
        return (
            <>
                <NavBar />
                <Container className="text-center py-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            </>
        );
    }

    if (!currentQuiz) {
        return (
            <>
                <NavBar />
                <Container>
                    <Alert variant="danger">Quiz not found.</Alert>
                    <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </Container>
            </>
        );
    }

    // Show results after submission
    if (submitted && lastAttemptResult) {
        return (
            <>
                <NavBar />
                <Container>
                    <Card className="my-4">
                        <Card.Header as="h4" className="bg-success text-white">
                            Quiz Completed!
                        </Card.Header>
                        <Card.Body className="text-center">
                            <h1 className="display-1 mb-3">{lastAttemptResult.score}%</h1>
                            <p className="lead">
                                You got {lastAttemptResult.correctCount} out of {lastAttemptResult.totalQuestions} questions correct
                            </p>
                            <ProgressBar
                                now={lastAttemptResult.score}
                                variant={lastAttemptResult.score >= 70 ? 'success' : lastAttemptResult.score >= 50 ? 'warning' : 'danger'}
                                className="mb-4"
                                style={{ height: '30px' }}
                            />
                        </Card.Body>
                    </Card>

                    <h5>Question Review</h5>
                    {currentQuiz.questions.map((question, idx) => {
                        const result = lastAttemptResult.list_question_result.find(
                            r => r.question_id === question._id
                        );
                        return (
                            <Card key={question._id} className="mb-3">
                                <Card.Header className={result?.is_correct ? 'bg-success text-white' : 'bg-danger text-white'}>
                                    Question {idx + 1}: {result?.is_correct ? '✓ Correct' : '✗ Incorrect'}
                                </Card.Header>
                                <Card.Body>
                                    <p><strong>{question.text}</strong></p>
                                    {question.options.map((option, optIdx) => (
                                        <div
                                            key={optIdx}
                                            className={`p-2 mb-1 rounded ${result?.answer_index === optIdx
                                                ? (result.is_correct ? 'bg-success text-white' : 'bg-danger text-white')
                                                : ''
                                                }`}
                                        >
                                            {String.fromCharCode(65 + optIdx)}. {option}
                                            {result?.answer_index === optIdx && ' (Your answer)'}
                                        </div>
                                    ))}
                                </Card.Body>
                            </Card>
                        );
                    })}

                    <Button variant="primary" onClick={() => navigate('/dashboard')} className="mb-4">
                        Back to Dashboard
                    </Button>
                </Container>
            </>
        );
    }

    return (
        <>
            <NavBar />
            <Container>
                <Card className="mb-4">
                    <Card.Header>
                        <h3>{currentQuiz.title}</h3>
                        <p className="mb-0 text-muted">{currentQuiz.description}</p>
                    </Card.Header>
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span>Progress: {answeredCount} / {totalQuestions} answered</span>
                        </div>
                        <ProgressBar now={progress} label={`${Math.round(progress)}%`} />
                    </Card.Body>
                </Card>

                {msg && (
                    <Alert variant="danger" dismissible onClose={() => dispatch(clearMsg())}>
                        {msg}
                    </Alert>
                )}

                {currentQuiz.questions.length === 0 ? (
                    <Alert variant="warning">This quiz has no questions yet.</Alert>
                ) : (
                    <>
                        {currentQuiz.questions.map((question, idx) => (
                            <Card key={question._id} className="mb-3">
                                <Card.Header>
                                    <strong>Question {idx + 1}</strong>
                                </Card.Header>
                                <Card.Body>
                                    <Card.Text className="fs-5">{question.text}</Card.Text>
                                    <Form>
                                        {question.options.map((option, optIdx) => (
                                            <Form.Check
                                                key={optIdx}
                                                type="radio"
                                                id={`q-${question._id}-opt-${optIdx}`}
                                                name={`question-${question._id}`}
                                                label={`${String.fromCharCode(65 + optIdx)}. ${option}`}
                                                checked={answers[question._id] === optIdx}
                                                onChange={() => handleAnswerChange(question._id, optIdx)}
                                                className="py-2"
                                            />
                                        ))}
                                    </Form>
                                </Card.Body>
                            </Card>
                        ))}

                        <div className="d-grid gap-2 mb-4">
                            <Button
                                variant="success"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={answeredCount === 0 || status === 'loading'}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Spinner size="sm" animation="border" className="me-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Quiz'
                                )}
                            </Button>
                            <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>
                                Cancel
                            </Button>
                        </div>
                    </>
                )}
            </Container>
        </>
    );
}

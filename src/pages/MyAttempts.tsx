import { useEffect } from 'react';
import { Container, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { ChiHungAppDispatch, ChiHungAppSelector } from '../ultis/hook';
import { fetchMyAttempts } from '../slice';
import NavBar from '../components/NavBar';

export default function MyAttempts() {
    const dispatch = ChiHungAppDispatch();
    const attempts = ChiHungAppSelector(s => s.attempts);
    const status = ChiHungAppSelector(s => s.status);

    useEffect(() => {
        dispatch(fetchMyAttempts());

    }, [dispatch]);

    const getScoreBadge = (score: number) => {
        if (score >= 80) return <Badge bg="success">{score}%</Badge>;
        if (score >= 60) return <Badge bg="warning">{score}%</Badge>;
        return <Badge bg="danger">{score}%</Badge>;
    };
    return (
        <>
            <NavBar />
            <Container>
                <h2 className="mb-4">My Quiz Attempts</h2>

                {status === 'loading' && (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                )}

                {status !== 'loading' && attempts.length === 0 && (
                    <Alert variant="info">
                        You haven't taken any quizzes yet. <a href="/dashboard">Browse quizzes</a>
                    </Alert>
                )}

                {attempts.length > 0 && (
                    <Table striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Quiz</th>
                                <th>Score</th>
                                <th>Correct Answers</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attempts.map((attempt, idx) => (
                                <tr key={attempt._id}>
                                    <td>{idx + 1}</td>
                                    <td>{(attempt.quiz as any)?.title || 'Unknown Quiz'}</td>
                                    <td>{getScoreBadge(attempt.score)}</td>
                                    <td>
                                        {attempt.list_question_result.filter(r => r.is_correct).length} / {attempt.list_question_result.length}
                                    </td>
                                    <td>{new Date(attempt.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Container>
        </>
    );
}

import { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { ChiHungAppDispatch, ChiHungAppSelector } from '../ultis/hook';
import { fetchQuizzes, clearMsg } from '../slice';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function Dashboard() {
    const dispatch = ChiHungAppDispatch();
    const navigate = useNavigate();
    const quizzes = ChiHungAppSelector(s => s.quizzes);
    const status = ChiHungAppSelector(s => s.status);
    const msg = ChiHungAppSelector(s => s.msg);

    useEffect(() => {
        dispatch(fetchQuizzes(1));
    }, [dispatch]);

    return (
        <>
            <NavBar />
            <Container>
                <h2 className="mb-4">Available Quizzes</h2>

                {msg && (
                    <Alert variant="info" dismissible onClose={() => dispatch(clearMsg())}>
                        {msg}
                    </Alert>
                )}

                {status === 'loading' && (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                )}

                {status !== 'loading' && quizzes.length === 0 && (
                    <Alert variant="secondary">No quizzes available yet.</Alert>
                )}

                <Row xs={1} md={2} lg={3} className="g-4">
                    {quizzes.map((quiz) => (
                        <Col key={quiz._id}>
                            <Card className="h-100">
                                <Card.Body>
                                    <Card.Title>{quiz.title}</Card.Title>
                                    <Card.Text className="text-muted">
                                        {quiz.description || 'No description'}
                                    </Card.Text>
                                    <Card.Text>
                                        <small className="text-muted">
                                            {quiz.questions?.length || 0} questions
                                        </small>
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer className="bg-transparent">
                                    <Button
                                        variant="primary"
                                        className="w-100"
                                        onClick={() => navigate(`/quiz/${quiz._id}`)}
                                    >
                                        Take Quiz
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
}

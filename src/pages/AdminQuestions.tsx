import { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner, Badge, Card } from 'react-bootstrap';
import { ChiHungAppDispatch, ChiHungAppSelector } from '../ultis/hook';
import { fetchQuizById, createQuestion, updateQuestion, deleteQuestion, clearMsg } from '../slice';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

interface QuestionForm {
    _id?: string;
    text: string;
    options: string[];
    keywords: string[];
    correctAnswerIndex: number;
}

const emptyQuestion: QuestionForm = {
    text: '',
    options: ['', ''],
    keywords: [],
    correctAnswerIndex: 0
};

export default function AdminQuestions() {
    const { id: quizId } = useParams<{ id: string }>();
    const dispatch = ChiHungAppDispatch();
    const navigate = useNavigate();
    const currentQuiz = ChiHungAppSelector(s => s.currentQuiz);
    const quizLoading = ChiHungAppSelector(s => s.quizLoading);
    const msg = ChiHungAppSelector(s => s.msg);
    const user = ChiHungAppSelector(s => s.user);

    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<QuestionForm | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [keywordInput, setKeywordInput] = useState('');

    useEffect(() => {
        if (quizId) {
            dispatch(fetchQuizById(quizId));
        }
    }, [quizId, dispatch]);

    // Redirect non-admin users
    if (!user?.isAdmin) {
        return (
            <>
                <NavBar />
                <Container>
                    <Alert variant="danger">Access denied. Admin only.</Alert>
                </Container>
            </>
        );
    }

    if (quizLoading && !currentQuiz) {
        return (
            <>
                <NavBar />
                <Container className="text-center py-5">
                    <Spinner animation="border" />
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
                    <Button onClick={() => navigate('/admin/quizzes')}>Back to Quizzes</Button>
                </Container>
            </>
        );
    }

    const handleOpenCreate = () => {
        setEditingQuestion({ ...emptyQuestion });
        setKeywordInput('');
        setShowModal(true);
    };

    const handleOpenEdit = (question: any) => {
        setEditingQuestion({
            _id: question._id,
            text: question.text,
            options: [...question.options],
            keywords: [...(question.keywords || [])],
            correctAnswerIndex: question.correctAnswerIndex
        });
        setKeywordInput((question.keywords || []).join(', '));
        setShowModal(true);
    };

    const handleAddOption = () => {
        if (editingQuestion && editingQuestion.options.length < 6) {
            setEditingQuestion({
                ...editingQuestion,
                options: [...editingQuestion.options, '']
            });
        }
    };

    const handleRemoveOption = (index: number) => {
        if (editingQuestion && editingQuestion.options.length > 2) {
            const newOptions = editingQuestion.options.filter((_, i) => i !== index);
            let newCorrectIndex = editingQuestion.correctAnswerIndex;
            if (index === editingQuestion.correctAnswerIndex) {
                newCorrectIndex = 0;
            } else if (index < editingQuestion.correctAnswerIndex) {
                newCorrectIndex--;
            }
            setEditingQuestion({
                ...editingQuestion,
                options: newOptions,
                correctAnswerIndex: newCorrectIndex
            });
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        if (editingQuestion) {
            const newOptions = [...editingQuestion.options];
            newOptions[index] = value;
            setEditingQuestion({ ...editingQuestion, options: newOptions });
        }
    };

    const handleSave = async () => {
        if (!editingQuestion || !quizId) return;

        const keywords = keywordInput.split(',').map(k => k.trim()).filter(k => k);
        const questionData = {
            text: editingQuestion.text,
            options: editingQuestion.options.filter(o => o.trim()),
            keywords,
            correctAnswerIndex: editingQuestion.correctAnswerIndex
        };

        if (editingQuestion._id) {
            await dispatch(updateQuestion({ quizId, questionId: editingQuestion._id, data: questionData }));
        } else {
            await dispatch(createQuestion({ quizId, data: questionData }));
        }
        setShowModal(false);
        setEditingQuestion(null);
    };

    const handleDelete = async (questionId: string) => {
        if (!quizId) return;
        await dispatch(deleteQuestion({ quizId, questionId }));
        setDeleteConfirm(null);
    };

    const isFormValid = () => {
        if (!editingQuestion) return false;
        if (!editingQuestion.text.trim()) return false;
        const validOptions = editingQuestion.options.filter(o => o.trim());
        if (validOptions.length < 2) return false;
        if (editingQuestion.correctAnswerIndex < 0 || editingQuestion.correctAnswerIndex >= validOptions.length) return false;
        return true;
    };

    return (
        <>
            <NavBar />
            <Container>
                <Card className="mb-4">
                    <Card.Header>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <Button variant="link" className="p-0 me-2" onClick={() => navigate('/admin/quizzes')}>
                                    ← Back
                                </Button>
                            </div>
                            <Badge bg="primary">{currentQuiz.questions?.length || 0} questions</Badge>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <p className="text-muted mb-0">{currentQuiz.description || 'No description'}</p>
                    </Card.Body>
                </Card>

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4>Questions</h4>
                    <Button variant="success" onClick={handleOpenCreate}>
                        + Add Question
                    </Button>
                </div>

                {msg && (
                    <Alert variant="info" dismissible onClose={() => dispatch(clearMsg())}>
                        {msg}
                    </Alert>
                )}

                {currentQuiz.questions.length === 0 && (
                    <Alert variant="secondary">No questions yet. Add one!</Alert>
                )}

                {currentQuiz.questions.length > 0 && (
                    <Table striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Question Text</th>
                                <th>Options</th>
                                <th>Correct Answer</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentQuiz.questions.map((question: any, idx: number) => (
                                <tr key={question._id}>
                                    <td>{idx + 1}</td>
                                    <td style={{ maxWidth: '300px' }}>{question.text}</td>
                                    <td>
                                        {question.options.map((opt: any, i: number) => (
                                            <div key={i}>
                                                <Badge bg={i === question.correctAnswerIndex ? 'success' : 'secondary'} className="me-1">
                                                    {String.fromCharCode(65 + i)}
                                                </Badge>
                                                {opt.substring(0, 30)}{opt.length > 30 ? '...' : ''}
                                            </div>
                                        ))}
                                    </td>
                                    <td>
                                        <Badge bg="success">
                                            {String.fromCharCode(65 + (question.correctAnswerIndex || 0))}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleOpenEdit(question)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => setDeleteConfirm(question._id)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}

                {/* Create/Edit Question Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>{editingQuestion?._id ? 'Edit Question' : 'Add Question'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Question Text *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={editingQuestion?.text || ''}
                                    onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, text: e.target.value } : null)}
                                    placeholder="Enter your question"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Options * (minimum 2)</Form.Label>
                                {editingQuestion?.options.map((option, idx) => (
                                    <div key={idx} className="d-flex mb-2">
                                        <Form.Control
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                        />
                                        {editingQuestion.options.length > 2 && (
                                            <Button
                                                variant="outline-danger"
                                                className="ms-2"
                                                onClick={() => handleRemoveOption(idx)}
                                            >
                                                ×
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {editingQuestion && editingQuestion.options.length < 6 && (
                                    <Button variant="outline-secondary" size="sm" onClick={handleAddOption}>
                                        + Add Option
                                    </Button>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Correct Answer *</Form.Label>
                                <Form.Select
                                    value={editingQuestion?.correctAnswerIndex || 0}
                                    onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, correctAnswerIndex: parseInt(e.target.value) } : null)}
                                >
                                    {editingQuestion?.options.map((option, idx) => (
                                        <option key={idx} value={idx}>
                                            {String.fromCharCode(65 + idx)}. {option || `Option ${idx + 1}`}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Keywords (comma-separated, optional)</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    placeholder="e.g., math, algebra, equations"
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave} disabled={!isFormValid()}>
                            Save Question
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this question?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </>
    );
}

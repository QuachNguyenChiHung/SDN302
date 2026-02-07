import { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { ChiHungAppDispatch, ChiHungAppSelector } from '../ultis/hook';
import { fetchQuizzes, createQuiz, updateQuiz, deleteQuiz, clearMsg } from '../slice';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function AdminQuizzes() {
    const dispatch = ChiHungAppDispatch();
    const navigate = useNavigate();
    const quizzes = ChiHungAppSelector(s => s.quizzes);
    const status = ChiHungAppSelector(s => s.status);
    const msg = ChiHungAppSelector(s => s.msg);
    const user = ChiHungAppSelector(s => s.user);

    const [showModal, setShowModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<{ _id?: string; title: string; description: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchQuizzes(1));
    }, [dispatch]);

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

    const handleOpenCreate = () => {
        setEditingQuiz({ title: '', description: '' });
        setShowModal(true);
    };

    const handleOpenEdit = (quiz: any) => {
        setEditingQuiz({ _id: quiz._id, title: quiz.title, description: quiz.description });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!editingQuiz) return;

        if (editingQuiz._id) {
            await dispatch(updateQuiz({ id: editingQuiz._id, data: { title: editingQuiz.title, description: editingQuiz.description } }));
        } else {
            await dispatch(createQuiz({ title: editingQuiz.title, description: editingQuiz.description }));
        }
        setShowModal(false);
        setEditingQuiz(null);
    };

    const handleDelete = async (id: string) => {
        await dispatch(deleteQuiz(id));
        setDeleteConfirm(null);
    };

    return (
        <>
            <NavBar />
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Manage Quizzes</h2>
                    <Button variant="success" onClick={handleOpenCreate}>
                        + New Quiz
                    </Button>
                </div>

                {msg && (
                    <Alert variant="info" dismissible onClose={() => dispatch(clearMsg())}>
                        {msg}
                    </Alert>
                )}

                {status === 'loading' && (
                    <div className="text-center py-5">
                        <Spinner animation="border" />
                    </div>
                )}

                {quizzes.length === 0 && status !== 'loading' && (
                    <Alert variant="secondary">No quizzes yet. Create one!</Alert>
                )}

                {quizzes.length > 0 && (
                    <Table striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Questions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quizzes.map((quiz, idx) => (
                                <tr key={quiz._id}>
                                    <td>{idx + 1}</td>
                                    <td>{quiz.title}</td>
                                    <td>{quiz.description || '-'}</td>
                                    <td>
                                        <Badge bg="primary">{quiz.questions?.length || 0}</Badge>
                                    </td>
                                    <td>
                                        <Button
                                            variant="info"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => navigate(`/admin/quizzes/${quiz._id}/questions`)}
                                        >
                                            Questions
                                        </Button>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleOpenEdit(quiz)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => setDeleteConfirm(quiz._id)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}

                {/* Create/Edit Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editingQuiz?._id ? 'Edit Quiz' : 'Create Quiz'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Title *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editingQuiz?.title || ''}
                                    onChange={(e) => setEditingQuiz(prev => prev ? { ...prev, title: e.target.value } : null)}
                                    placeholder="Enter quiz title"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={editingQuiz?.description || ''}
                                    onChange={(e) => setEditingQuiz(prev => prev ? { ...prev, description: e.target.value } : null)}
                                    placeholder="Enter quiz description"
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave} disabled={!editingQuiz?.title}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this quiz? This will also delete all associated questions.
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

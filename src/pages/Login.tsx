import { Alert, Button, Form, InputGroup, Container, Card, Spinner } from "react-bootstrap";
import { ChiHungAppDispatch, ChiHungAppSelector } from "../ultis/hook";
import { useState } from "react";
import { loginUser, clearMsg } from "../slice";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const dispatch = ChiHungAppDispatch();
    const navigate = useNavigate();
    const status = ChiHungAppSelector(s => s.status);
    const msg = ChiHungAppSelector(s => s.msg);
    const [form, setForm] = useState({
        username: '',
        password: ''
    });
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.username || !form.password) return;

        const result = await dispatch(loginUser({
            username: form.username,
            password: form.password
        }));

        if (loginUser.fulfilled.match(result)) {
            navigate('/dashboard');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Card style={{ width: '100%', maxWidth: '400px' }}>
                <Card.Header className="text-center">
                    <h3>Quiz App Login</h3>
                </Card.Header>
                <Card.Body>
                    {msg ? (
                        <Alert
                            variant={status === 'failed' ? 'danger' : 'success'}
                            dismissible
                            onClose={() => dispatch(clearMsg())}
                        >
                            {msg}
                        </Alert>
                    ) : null}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>@</InputGroup.Text>
                                <Form.Control
                                    placeholder="Username"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                />
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>PW</InputGroup.Text>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                            </InputGroup>

                        </Form.Group>

                        <div className="d-grid">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={status === 'loading' || !form.username || !form.password}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Spinner size="sm" animation="border" className="me-2" />
                                        Logging in...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </Button>
                        </div>
                    </Form>

                    <div className="text-center mt-3">
                        <a href="/register">No account? Register</a>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
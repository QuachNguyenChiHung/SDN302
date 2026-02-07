import { useState } from "react";
import { Alert, Button, Form, InputGroup, Container, Card, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { ChiHungAppDispatch, ChiHungAppSelector } from "../ultis/hook";
import { registerUser, clearMsg } from "../slice";

export default function Register() {
    const dispatch = ChiHungAppDispatch();
    const navigate = useNavigate();
    const status = ChiHungAppSelector(s => s.status);
    const msg = ChiHungAppSelector(s => s.msg);
    const [form, setForm] = useState({
        username: '',
        password: '',
        c_password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.username || !form.password) return;
        if (form.password !== form.c_password) {
            alert("Passwords do not match");
            return;
        }
        const result = await dispatch(registerUser({
            username: form.username,
            password: form.password,
            isAdmin: false
        })).unwrap();

        if (registerUser.fulfilled.match(result)) {
            setTimeout(() => navigate('/'), 1500);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Card style={{ width: '100%', maxWidth: '400px' }}>
                <Card.Header className="text-center">
                    <h3>Create Account</h3>
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
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirm Password"
                                value={form.c_password}
                                onChange={(e) => setForm({ ...form, c_password: e.target.value })}
                            />
                        </Form.Group>

                        <div className="d-grid">
                            <Button
                                variant="success"
                                type="submit"
                                disabled={status === 'loading' || !form.username || !form.password || !form.c_password}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Spinner size="sm" animation="border" className="me-2" />
                                        Registering...
                                    </>
                                ) : (
                                    'Register'
                                )}
                            </Button>
                        </div>
                    </Form>

                    <div className="text-center mt-3">
                        <Link to="/">Already have an account? Login</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
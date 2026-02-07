import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { ChiHungAppDispatch, ChiHungAppSelector } from '../ultis/hook';
import { logoutUser } from '../slice';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
    const dispatch = ChiHungAppDispatch();
    const navigate = useNavigate();
    const user = ChiHungAppSelector(s => s.user);
    const isAuthenticated = ChiHungAppSelector(s => s.isAuthenticated);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser());
            navigate('/');
        } catch (error) {

        }
    };
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">

            <Container>
                <Navbar.Brand href="/dashboard">Quiz App</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/dashboard">Quizzes</Nav.Link>
                        <Nav.Link href="/my-attempts">My Attempts</Nav.Link>
                        {user?.isAdmin && (
                            <Nav.Link href="/admin/quizzes">Manage Quizzes</Nav.Link>
                        )}
                    </Nav>
                    <Nav>
                        {isAuthenticated && (
                            <>
                                <Navbar.Text className="me-3">
                                    Signed in as: <strong>{user?.username}</strong>
                                    {user?.isAdmin && <span className="badge bg-warning ms-2">Admin</span>}
                                </Navbar.Text>
                                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                                    Logouts
                                </Button>

                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

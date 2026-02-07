import { useEffect, type PropsWithChildren, type ReactNode, useCallback, memo } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ChiHungAppDispatch, ChiHungAppSelector } from './ultis/hook';
import { fetchCurrentUser } from './slice';
import 'bootstrap/dist/css/bootstrap.min.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuizTake from './pages/QuizTake';
import MyAttempts from './pages/MyAttempts';
import AdminQuizzes from './pages/AdminQuizzes';
import AdminQuestions from './pages/AdminQuestions';

// Protected Route Component


// Admin Route Component
function App() {
  const dispatch = ChiHungAppDispatch();
  const isAuthenticated = ChiHungAppSelector(state => state.isAuthenticated);
  const isAdmin = ChiHungAppSelector(state => state.user?.isAdmin);
  const authStatus = ChiHungAppSelector(state => state.authStatus);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, []);

  // Show loading while checking auth status
  if (authStatus === 'loading') {
    return <div>Loading...</div>;
  }
  const ProtectedRoute = memo(({ children }: PropsWithChildren) => {
    if (!isAuthenticated) {
      return <Navigate to={"/"}></Navigate>
    }
    return <>
      {children}
    </>
  })
  const AdminRoute = memo(({ children }: PropsWithChildren) => {
    if (!isAuthenticated || !isAdmin) {
      return <Navigate to={"/"}></Navigate>
    }
    return <>
      {children}
    </>
  })
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-attempts"
          element={
            <ProtectedRoute>
              <MyAttempts />
            </ProtectedRoute>

          }
        />
        <Route
          path="/admin/quizzes"
          element={
            <AdminRoute>
              <AdminQuizzes />
            </AdminRoute>


          }
        />
        <Route
          path="/admin/quizzes/:id/questions"
          element={
            <AdminRoute>
              <AdminQuestions />
            </AdminRoute>
          }
        />
        <Route
          path="/quiz/:id"
          element={
            <ProtectedRoute>
              <QuizTake />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;

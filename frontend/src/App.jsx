import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import LearnPage from './pages/LearnPage';
import QuizPage from './pages/QuizPage';
import CivicHub from './pages/CivicHub';
import Leaderboard from './pages/Leaderboard';
import Analytics from './pages/Analytics';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'teacher' ? '/teacher' : '/dashboard'} replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/dashboard'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/dashboard'} /> : <Register />} />
      <Route path="/onboarding" element={<ProtectedRoute>{user?.interests?.length > 0 ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/dashboard'} /> : <Onboarding />}</ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/learn" element={<ProtectedRoute><LearnPage /></ProtectedRoute>} />
      <Route path="/quiz/:id" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
      <Route path="/civic" element={<ProtectedRoute><CivicHub /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

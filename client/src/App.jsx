import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import VideoRoom from './pages/VideoRoom';
import AdminDashboard from './pages/AdminDashboard';
import AdminSessionDetails from './pages/AdminSessionDetails';
import SessionHistory from './pages/SessionHistory';
import AuthGate from './components/AuthGate';

function ProtectedRoute({ children }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="w-10 h-10 border-4 border-[var(--primary-light)] border-t-[var(--primary)] rounded-full animate-spin" />
      </div>
    );
  }

  useEffect(() => {
    // If not loading and not authenticated, we don't force a redirect immediately
    // to avoid loops. We just let it render the return null or an error page.
  }, [loading, token]);

  if (!token && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white shadow rounded border border-gray-200">
            <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You must be logged in to view this page.</p>
            <button 
                onClick={() => window.location.href = 'https://smartprep.live/login'}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
                Return to Central Hub
            </button>
        </div>
      </div>
    );
  }
  if (user && user.role !== 'admin' && !user.isProfileComplete) return <Navigate to="/profile-setup" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, token, loading } = useAuth();

  if (loading) return null;
  if (!token || user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<AuthGate />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <SessionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute>
              <VideoRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/session/:id"
          element={
            <AdminRoute>
              <AdminSessionDetails />
            </AdminRoute>
          }
        />
        <Route path="*" element={<AuthGate />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;

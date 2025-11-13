import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import actual page components (we will create these next)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NlpLogsPage from './pages/NlpLogsPage';
import SettingsPage from './pages/SettingsPage';
import AppLayout from './components/AppLayout';

const NotFoundPage = () => <h1>404 Not Found</h1>;

// A wrapper for protected routes
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { token, logout } = useAuth();
  const withLayout = (Component) => (
    <ProtectedRoute>
      <AppLayout onLogout={logout}>
        <Component />
      </AppLayout>
    </ProtectedRoute>
  );
  return (
     <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={withLayout(DashboardPage)} />
        <Route path="/nlp-logs" element={withLayout(NlpLogsPage)} />
        <Route path="/settings" element={withLayout(SettingsPage)} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

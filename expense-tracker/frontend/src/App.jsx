import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import actual page components (we will create these next)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NlpLogsPage from './pages/NlpLogsPage';
import SettingsPage from './pages/SettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import TransactionsPage from './pages/TransactionsPage';
import AppLayout from './components/AppLayout';

const enableNlpLogs = import.meta.env.MODE !== 'production';

const NotFoundPage = () => <h1>404 Not Found</h1>;

// A wrapper for protected routes
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, currentUser } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  return children;
}

function AppRoutes() {
  const { isAuthenticated, logout } = useAuth();
  const withLayout = (Component) => (
    <ProtectedRoute>
      <AppLayout onLogout={logout}>
        <Component />
      </AppLayout>
    </ProtectedRoute>
  );
  return (
     <Routes>
         <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={withLayout(DashboardPage)} />
        <Route path="/transactions" element={withLayout(TransactionsPage)} />
        {enableNlpLogs && (
          <Route
            path="/nlp-logs"
            element={
              <AdminRoute>
                <AppLayout onLogout={logout}>
                  <NlpLogsPage />
                </AppLayout>
              </AdminRoute>
            }
          />
        )}
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AppLayout onLogout={logout}>
                <AdminUsersPage />
              </AppLayout>
            </AdminRoute>
          }
        />
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

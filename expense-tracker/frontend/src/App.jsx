import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NlpLogsPage = lazy(() => import('./pages/NlpLogsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));

const enableNlpLogs = import.meta.env.MODE !== 'production';

const NotFoundPage = () => <h1>404 Not Found</h1>;
const PageLoader = () => (
  <div className="flex min-h-[200px] items-center justify-center text-gray-500">Loading...</div>
);

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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
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

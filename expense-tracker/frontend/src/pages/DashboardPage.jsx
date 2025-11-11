import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      {/* A real app would fetch and display the user's name */}
      <h2>Welcome to your Dashboard</h2>
      <p>This is a protected page. Only logged-in users can see this.</p>

      <button onClick={handleLogout}>Logout</button>

      {/* Future components for displaying transactions, budgets, etc. will go here */}
    </div>
  );
};

export default DashboardPage;

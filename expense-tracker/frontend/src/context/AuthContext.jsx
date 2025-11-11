import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust if your backend port is different
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Here you might want to fetch the user profile
      // For now, we'll just assume the token is valid
      // A proper implementation would verify the token with the backend
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { accessToken } = response.data;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    return response.data;
  };

  const register = async (username, email, password, full_name) => {
     const response = await apiClient.post('/auth/register', { username, email, password, full_name });
     const { accessToken } = response.data;
     localStorage.setItem('token', accessToken);
     setToken(accessToken);
     return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const value = {
    currentUser,
    token,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

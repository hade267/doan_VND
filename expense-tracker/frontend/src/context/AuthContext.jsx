import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.warn('[Auth] Failed to decode token', err);
    return null;
  }
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setCurrentUser(decodeToken(token));
    } else {
      delete api.defaults.headers.common.Authorization;
      setCurrentUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken } = response.data;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setCurrentUser(decodeToken(accessToken));
    return response.data;
  };

  const register = async (username, email, password, full_name) => {
    const response = await api.post('/auth/register', { username, email, password, full_name });
    const { accessToken } = response.data;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setCurrentUser(decodeToken(accessToken));
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    delete api.defaults.headers.common.Authorization;
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

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrateSession = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/refresh');
      setCurrentUser(data.user);
    } catch (error) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setCurrentUser(data.user);
    return data;
  };

  const register = async (username, email, password, full_name) => {
    const { data } = await api.post('/auth/register', {
      username,
      email,
      password,
      full_name,
    });
    setCurrentUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    loading,
    login,
    register,
    logout,
    refresh: hydrateSession,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

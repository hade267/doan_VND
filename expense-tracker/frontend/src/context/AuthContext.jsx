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
  const [twoFactorSession, setTwoFactorSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrateSession = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/refresh');
      setCurrentUser(data.user);
    } catch (error) {
      setCurrentUser(null);
      setTwoFactorSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.requiresTwoFactor) {
      setTwoFactorSession({ token: data.twoFactorToken });
      return { requiresTwoFactor: true };
    }
    setTwoFactorSession(null);
    setCurrentUser(data.user);
    return data;
  };

  const verifyTwoFactor = async (code) => {
    if (!twoFactorSession?.token) {
      throw new Error('Không có phiên 2FA nào cần xác thực');
    }
    const { data } = await api.post('/auth/verify-2fa', {
      token: twoFactorSession.token,
      code,
    });
    setCurrentUser(data.user);
    setTwoFactorSession(null);
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
      setTwoFactorSession(null);
    }
  };

  const updateCurrentUser = (nextUser) => {
    setCurrentUser(nextUser);
  };

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    twoFactorRequired: Boolean(twoFactorSession),
    twoFactorToken: twoFactorSession?.token || null,
    loading,
    login,
    verifyTwoFactor,
    register,
    logout,
    refresh: hydrateSession,
    updateCurrentUser,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setCurrentUser(decodeToken(token));
    } else {
      delete api.defaults.headers.common.Authorization;
      setCurrentUser(null);
    }
  }, [token]);

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        if (data?.accessToken) {
          setToken(data.accessToken);
          setCurrentUser(decodeToken(data.accessToken));
        }
      } catch (error) {
        setToken(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config || {};
        const shouldAttemptRefresh =
          error.response?.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url &&
          !originalRequest.url.includes('/auth/login') &&
          !originalRequest.url.includes('/auth/register') &&
          !originalRequest.url.includes('/auth/refresh');

        if (!shouldAttemptRefresh) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;
        try {
          const { data } = await api.post('/auth/refresh');
          if (data?.accessToken) {
            setToken(data.accessToken);
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          setToken(null);
          setCurrentUser(null);
        }
        return Promise.reject(error);
      },
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken } = response.data;
    setToken(accessToken);
    setCurrentUser(decodeToken(accessToken));
    return response.data;
  };

  const register = async (username, email, password, full_name) => {
    const response = await api.post('/auth/register', { username, email, password, full_name });
    const { accessToken } = response.data || {};
    if (accessToken) {
      setToken(accessToken);
      setCurrentUser(decodeToken(accessToken));
    }
    return response.data;
  };

  const verifyEmail = async (token) => {
    const { data } = await api.post('/auth/verify-email', { token });
    return data;
  };

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // ignore
    }
    setToken(null);
    setCurrentUser(null);
    delete api.defaults.headers.common.Authorization;
  }, []);

  const value = {
    currentUser,
    token,
    login,
    register,
    logout,
    verifyEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('unfold_token') || null);
  const [loading, setLoading] = useState(true);

  // Load current user profile if token exists
  const fetchMe = async () => {
    const storedToken = localStorage.getItem('unfold_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get('/api/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Authentication check failed:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (loginIdentifier, password) => {
    const data = await api.post('/api/auth/login', { loginIdentifier, password });
    if (data.success && data.token) {
      localStorage.setItem('unfold_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (userData) => {
    const data = await api.post('/api/auth/register', userData);
    if (data.success && data.token) {
      localStorage.setItem('unfold_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('unfold_token');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = (updatedUserData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUserData } : updatedUserData));
  };

  const decrementUnreadNotificationCount = () => {
    setUser((prev) => {
      if (!prev) return prev;
      const current = prev.unreadNotificationsCount || 0;
      return { ...prev, unreadNotificationsCount: Math.max(0, current - 1) };
    });
  };

  const resetUnreadNotificationCount = () => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, unreadNotificationsCount: 0 };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        fetchMe,
        updateUserProfile,
        decrementUnreadNotificationCount,
        resetUnreadNotificationCount,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

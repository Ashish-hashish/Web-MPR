import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('civic_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('civic_token');
      const storedUser = localStorage.getItem('civic_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('civic_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('civic_token', res.token);
      localStorage.setItem('civic_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (name, email, password, role) => {
    const res = await authService.register(name, email, password, role);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('civic_token', res.token);
      localStorage.setItem('civic_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('civic_token');
    localStorage.removeItem('civic_user');
  };

  const isCitizen = user?.role === 'citizen';
  const isWorker = user?.role === 'worker';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isCitizen,
        isWorker,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

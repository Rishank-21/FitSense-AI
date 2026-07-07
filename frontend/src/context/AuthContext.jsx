import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('fitsense_token');
      if (token) {
        try {
          const res = await API.get('/auth/profile');
          setUser(res.data);
        } catch (err) {
          console.error('Auto login check failed:', err.response?.data?.message || err.message);
          localStorage.removeItem('fitsense_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  // Register User
  const register = async (userData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await API.post('/auth/register', userData);
      localStorage.setItem('fitsense_token', res.data.token);
      setUser(res.data.user);
      setLoading(false);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  // Login User
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('fitsense_token', res.data.token);
      setUser(res.data.user);
      setLoading(false);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('fitsense_token');
    setUser(null);
    setError(null);
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await API.post('/auth/profile', profileData);
      setUser(res.data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        setError
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

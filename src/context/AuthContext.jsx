import React, { createContext, useState, useEffect } from 'react';
import authServiceInstance from '../services/auth.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = authServiceInstance.getToken();
        const storedUser = authServiceInstance.getCurrentUser();
        
        console.log('Init Auth - Token:', storedToken);
        console.log('Init Auth - User:', storedUser);
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authServiceInstance.login(email, password);
      console.log('Login response:', response);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (fullName, email, password, phoneNumber, address) => {
    try {
      const response = await authServiceInstance.register(fullName, email, password, phoneNumber, address);
      console.log('Register response:', response);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authServiceInstance.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!token && !!user
  };

  console.log('AuthContext value:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
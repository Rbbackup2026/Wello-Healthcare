"use client";

// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('adminToken');
      const userData = localStorage.getItem('adminUser');
      const tokenExpiry = localStorage.getItem('adminTokenExpiry');

      console.log("Auth Check:", { token: !!token, userData: !!userData, tokenExpiry });

      if (token && userData && tokenExpiry) {
        const isExpired = Date.now() > parseInt(tokenExpiry);
        
        if (isExpired) {
          console.log("Token expired");
          logout();
        } else {
          setIsAuthenticated(true);
          setUser(JSON.parse(userData));
          console.log("User authenticated");
        }
      } else {
        console.log("No valid auth data");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData, keepLoggedIn = true) => {
    try {
      const expiresIn = keepLoggedIn ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const expiryTime = Date.now() + expiresIn;

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      localStorage.setItem('adminTokenExpiry', expiryTime.toString());

      setIsAuthenticated(true);
      setUser(userData);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminTokenExpiry');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

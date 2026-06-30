import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.status === 'success' && response.data) {
      const { accessToken, refreshToken, user: backendUser } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Map backendUser for backward compatibility (ensure name is set)
      const mappedUser = {
        id: backendUser.id,
        name: backendUser.fullName,
        fullName: backendUser.fullName,
        email: backendUser.email,
        role: backendUser.role
      };

      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      return mappedUser;
    }
    throw new Error(response.message || 'Login failed');
  };

  const register = async (fullName, email, password, role, phoneNumber) => {
    return await api.post('/auth/register', { fullName, email, password, role, phoneNumber });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

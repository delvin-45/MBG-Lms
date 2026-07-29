import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

// Penyedia State Global Autentikasi (User, Login, Logout, Register)
export function AuthProvider({ children }) {
  // Inisialisasi state user dari localStorage saat aplikasi pertama kali dibuka
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Ambil data profil terbaru dari backend begitu halaman di-refresh untuk menyinkronkan foto avatar
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get(`/users/profile?_t=${Date.now()}`)
        .then(res => {
          if (res.status === 'success' && res.data) {
            setUser(prev => {
              if (!prev) return null;
              if (prev.avatarUrl !== res.data.avatarUrl) {
                return { ...prev, avatarUrl: res.data.avatarUrl };
              }
              return prev;
            });
          }
        })
        .catch(err => console.warn('Gagal menyinkronkan avatar profil:', err));
    }
  }, []);

  // Fungsi Login: Tembak POST /auth/login, simpan token JWT, dan set state user
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.status === 'success' && response.data) {
      const { accessToken, refreshToken, user: backendUser } = response.data;

      // Simpan token autentikasi di memori browser
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Pemetaan objek user agar cocok dengan komponen UI
      const mappedUser = {
        id: backendUser.id,
        name: backendUser.fullName,
        fullName: backendUser.fullName,
        email: backendUser.email,
        role: backendUser.role,
        avatarUrl: backendUser.avatarUrl
      };

      try {
        const profileRes = await api.get(`/users/profile?_t=${Date.now()}`);
        if (profileRes.status === 'success' && profileRes.data?.avatarUrl) {
          mappedUser.avatarUrl = profileRes.data.avatarUrl;
        }
      } catch (err) {
        console.warn('Failed to fetch full profile on login:', err);
      }

      setUser(mappedUser);
      
      try {
        localStorage.setItem('user', JSON.stringify(mappedUser));
      } catch (err) {
        console.warn('Failed to save user to localStorage on login, falling back without avatarUrl:', err);
        const fallback = { ...mappedUser };
        delete fallback.avatarUrl;
        localStorage.setItem('user', JSON.stringify(fallback));
      }

      return mappedUser;
    }
    throw new Error(response.message || 'Login failed');
  };

  const register = async (fullName, email, password, role) => {
    return await api.post('/auth/register', { fullName, email, password, role });
  };

  const updateUserInfo = (newData) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated = {
        ...prevUser,
        ...newData,
        ...(newData.fullName ? { name: newData.fullName, fullName: newData.fullName } : {})
      };
      
      try {
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save user to localStorage, falling back without avatarUrl:', err);
        const fallback = { ...updated };
        delete fallback.avatarUrl;
        localStorage.setItem('user', JSON.stringify(fallback));
      }

      return updated;
    });
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
    <AuthContext.Provider value={{ user, login, register, logout, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

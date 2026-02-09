import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth only if token exists
  useEffect(() => {
    checkAuth();
  }, []);

    const checkAuth = async () => {
        try {
            const res = await api.get('/auth/users/me/');
            setUser(res.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

  const login = async (email, password) => {
    const response = await api.post('/auth/login/', {
      email,
      password,
    });

    // Store tokens
    localStorage.setItem('access', response.data.access);
    localStorage.setItem('refresh', response.data.refresh);

    await checkAuth();
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      // ignore backend logout errors
    } finally {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      setUser(null);
    }
  };

  const register = async (userData) => {
    const response = await api.post('/auth/users/', userData);
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

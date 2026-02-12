import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // With 'withCredentials: true', this request automatically sends the 'access' cookie
      const res = await api.get('/auth/users/me/');
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    // 1. Send credentials
    const response = await api.post('/auth/login/', {
      email,
      password,
    });
    
    // 2. Backend sets 'access' and 'refresh' cookies here automatically.
    // We don't need to (and can't) save them manually in localStorage.

    // 3. Update user state immediately
    await checkAuth();
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/'); // Backend deletes the cookies
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      // Optional: Redirect to login handled by protected routes
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
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
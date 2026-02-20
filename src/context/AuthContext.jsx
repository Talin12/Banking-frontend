import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);

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
    // ✅ Fixed: removed checkAuth() call here.
    // Cookies are only set AFTER OTP verification, not after login.
    // Calling checkAuth() here caused a 401 → refresh → 400 → redirect loop.
    const response = await api.post('/auth/login/', { email, password });
    return response.data;
  };

  const verifyOtp = async (otp) => {
    // ✅ Call checkAuth() here instead, after OTP verification sets the cookies
    const response = await api.post('/auth/verify-otp/', { otp });
    await checkAuth();
    return response.data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout/'); } catch {}
    finally { setUser(null); }
  };

  const register = async (userData) => {
    const response = await api.post('/auth/users/', userData);
    return response.data;
  };

  // Role helpers
  const isTeller = user?.role === 'teller';
  const isAccountExecutive = user?.role === 'account_executive';
  const isBranchManager = user?.role === 'branch_manager';
  const isStaff = isTeller || isAccountExecutive || isBranchManager;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      verifyOtp,
      logout,
      register,
      checkAuth,
      isTeller,
      isAccountExecutive,
      isBranchManager,
      isStaff
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
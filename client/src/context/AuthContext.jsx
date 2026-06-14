import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef(null);

  const getToken = () => localStorage.getItem('yori_token');
  const getRefreshToken = () => localStorage.getItem('yori_refresh');

  useEffect(() => {
    const token = getToken();
    const savedUser = localStorage.getItem('yori_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        scheduleRefresh();
      } catch {
        clearAuth();
      }
    }
    setLoading(false);
    return () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); };
  }, []);

  const scheduleRefresh = () => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    const refreshToken = getRefreshToken();
    if (!refreshToken) return;
    refreshTimer.current = setTimeout(async () => {
      try {
        const data = await authService.refresh(refreshToken);
        localStorage.setItem('yori_token', data.idToken);
        if (data.refreshToken) {
          localStorage.setItem('yori_refresh', data.refreshToken);
        }
        scheduleRefresh();
      } catch {
        clearAuth();
      }
    }, 55 * 60 * 1000);
  };

  const setAuth = (data) => {
    localStorage.setItem('yori_token', data.idToken);
    localStorage.setItem('yori_refresh', data.refreshToken);
    localStorage.setItem('yori_user', JSON.stringify(data.user));
    setUser(data.user);
    scheduleRefresh();
  };

  const clearAuth = () => {
    localStorage.removeItem('yori_token');
    localStorage.removeItem('yori_refresh');
    localStorage.removeItem('yori_user');
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    setUser(null);
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setAuth(data);
    return data.user;
  };

  const logout = () => {
    clearAuth();
  };

  const refreshToken = async () => {
    const refresh = getRefreshToken();
    if (!refresh) return false;
    try {
      const data = await authService.refresh(refresh);
      localStorage.setItem('yori_token', data.idToken);
      if (data.refreshToken) {
        localStorage.setItem('yori_refresh', data.refreshToken);
      }
      scheduleRefresh();
      return true;
    } catch {
      clearAuth();
      return false;
    }
  };

  const isAuthenticated = !!user;
  const hasRole = (...roles) => isAuthenticated && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      getToken,
      login,
      logout,
      refreshToken,
      isAuthenticated,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

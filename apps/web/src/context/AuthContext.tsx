import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string; email?: string }>;
  verifyOtp: (email: string, code: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  login: async () => ({}),
  register: async () => ({}),
  verifyOtp: async () => ({}),
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get('/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsAdmin(data.isAdmin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch {
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Login failed' };
      setUser(data.user);
      setIsAdmin(data.isAdmin);
      return {};
    } catch {
      return { error: 'Network error' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Registration failed' };
      return { email: data.email };
    } catch {
      return { error: 'Network error' };
    }
  };

  const verifyOtp = async (email: string, code: string) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, code });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Verification failed' };
      setUser(data.user);
      return {};
    } catch {
      return { error: 'Network error' };
    }
  };

  const logout = async () => {
    await api.post('/auth/logout', {});
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, register, verifyOtp, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

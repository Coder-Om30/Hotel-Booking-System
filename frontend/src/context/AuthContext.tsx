import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, AuthResponse } from '../types';
import { apiRequest, setAuthToken, getAuthToken, setOnUnauthorized } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await apiRequest<User>('/api/v1/auth/me');
      setUser(profile);
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    setOnUnauthorized(logout);

    const initialToken = getAuthToken();
    if (initialToken) {
      refreshProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshProfile, logout]);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setAuthToken(res.accessToken);
    setTokenState(res.accessToken);
    setUser(res.user);
  };

  const register = async (fullName: string, email: string, password: string) => {
    const res = await apiRequest<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    });

    setAuthToken(res.accessToken);
    setTokenState(res.accessToken);
    setUser(res.user);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    loading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

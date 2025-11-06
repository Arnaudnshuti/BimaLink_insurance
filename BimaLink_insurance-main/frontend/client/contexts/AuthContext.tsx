import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { apiService, AuthResponse } from '@/services/api';

export type UserRole = 'agent' | 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: 'agent' | 'customer';
  }) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  verifyLoginOtp: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Failed to parse user data', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }
      
      // Return email for OTP verification
      return response.data.email;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const verifyLoginOtp = useCallback(async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.verifyLoginOtp({ email, otp: code });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'OTP verification failed');
      }

      const { token, user: userData } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
      role: 'agent' | 'customer';
    }) => {
      setIsLoading(true);
      try {
        const response = await apiService.register(data);
        if (!response.success) {
          throw new Error(response.error || 'Registration failed');
        }
        // Registration successful, user needs to verify OTP
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const verifyOtp = useCallback(async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.verifyOtp({ email, otp: code });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'OTP verification failed');
      }

      const { token, user: userData } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiService.logout();
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    verifyOtp,
    verifyLoginOtp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

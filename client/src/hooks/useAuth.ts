import React, { createContext, useContext, useState, useEffect } from 'react';
import { secureStorage, STORAGE_KEYS } from '@/utils/secure-storage';

interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  role: 'admin' | 'member';
  status: 'active' | 'inactive';
  lastLogin?: Date;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

interface RegisterData {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  role?: 'admin' | 'member';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication state from secure storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUser = await secureStorage.getItem(STORAGE_KEYS.AUTH_USER);

        if (storedToken && storedUser) {
          setToken(storedToken);
          
          // Verify token with server
          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Token is invalid, clear storage
            await secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            await secureStorage.removeItem(STORAGE_KEYS.AUTH_USER);
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid data
        await secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        await secureStorage.removeItem(STORAGE_KEYS.AUTH_USER);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        
        // Store in secure storage
        await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        await secureStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(data.user));
        
        return true;
      } else {
        setError(data.message || 'Đăng nhập thất bại');
        return false;
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi đăng nhập');
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        
        // Store in secure storage
        await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        await secureStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(data.user));
        
        return true;
      } else {
        setError(data.message || 'Đăng ký thất bại');
        return false;
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi đăng ký');
      console.error('Register error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and secure storage
      setUser(null);
      setToken(null);
      setError(null);
      await secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await secureStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    error,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
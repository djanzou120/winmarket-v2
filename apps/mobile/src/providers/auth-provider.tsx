import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN_MUTATION, REGISTER_MUTATION, LOGOUT_MUTATION } from '../graphql/mutations/auth';
import { ME_QUERY } from '../graphql/queries/auth';
import type { User } from '@winmarket/shared-types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'buyer' | 'seller' | 'both';
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // GraphQL mutations and queries
  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const { data: meData, loading: meLoading, refetch: refetchMe } = useQuery(ME_QUERY, {
    skip: !user,
    errorPolicy: 'ignore',
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (meData?.me) {
      setUser(meData.me);
    }
  }, [meData]);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        // Token exists, try to fetch user data
        try {
          const result = await refetchMe();
          if (result.data?.me) {
            setUser(result.data.me);
          } else {
            // Token is invalid, clear it
            await clearAuthData();
          }
        } catch (error) {
          console.error('Error validating token:', error);
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await loginMutation({
        variables: {
          input: { email, password }
        }
      });

      if (result.data?.login) {
        const { user: userData, accessToken, refreshToken } = result.data.login;

        // Store tokens
        await AsyncStorage.setItem('authToken', accessToken);
        if (refreshToken) {
          await AsyncStorage.setItem('refreshToken', refreshToken);
        }

        // Set user data
        setUser(userData);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const result = await registerMutation({
        variables: {
          input: data
        }
      });

      if (result.data?.register) {
        const { user: userData, accessToken, refreshToken } = result.data.register;

        // Store tokens
        await AsyncStorage.setItem('authToken', accessToken);
        if (refreshToken) {
          await AsyncStorage.setItem('refreshToken', refreshToken);
        }

        // Set user data
        setUser(userData);
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Call logout mutation to invalidate token on server
      try {
        await logoutMutation();
      } catch (error) {
        console.error('Error calling logout mutation:', error);
      }

      // Clear local data
      await clearAuthData();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const result = await refetchMe();
      if (result.data?.me) {
        setUser(result.data.me);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading: loading || meLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
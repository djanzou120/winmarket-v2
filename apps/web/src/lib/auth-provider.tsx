'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  useMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  User,
  UserRole,
  LoginInput,
  RegisterInput
} from '@/graphql/generated';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType?: UserRole;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // GraphQL hooks
  const { data: meData, loading: meLoading, refetch: refetchMe } = useMeQuery({
    skip: typeof window === 'undefined' || !localStorage.getItem('winmarket_token'),
    errorPolicy: 'all',
  });

  const [loginMutation, { loading: loginLoading }] = useLoginMutation();
  const [registerMutation, { loading: registerLoading }] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();

  const user = (meData?.me as User | undefined) || null;
  const isAuthenticated = !!user;

  // Update loading state
  useEffect(() => {
    setLoading(meLoading || loginLoading || registerLoading);
  }, [meLoading, loginLoading, registerLoading]);

  // Check for token on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('winmarket_token') : null;
    if (token && !meData && !meLoading) {
      // Refetch user data if we have a token but no user data
      refetchMe();
    } else if (!token) {
      setLoading(false);
    }
  }, [meData, meLoading, refetchMe]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const loginInput: LoginInput = {
        email,
        password,
        rememberMe: true,
      };

      const { data } = await loginMutation({
        variables: { input: loginInput },
      });

      if (data?.login.token && data?.login.user) {
        // Store tokens
        localStorage.setItem('winmarket_token', data.login.token);

        // Show success message
        toast.success(`Welcome back, ${data.login.user.firstName}!`);

        // Refetch user data to update cache
        await refetchMe();

        // Redirect to dashboard or previous page
        router.push('/dashboard');
      } else {
        throw new Error('Login failed: Invalid response');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.graphQLErrors?.[0]?.message || error.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);

      const registerInput: RegisterInput = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: data.userType || UserRole.Buyer,
        phone: data.phone,
      };

      const { data: registerData } = await registerMutation({
        variables: { input: registerInput },
      });

      if (registerData?.register.token && registerData?.register.user) {
        // Store tokens
        localStorage.setItem('winmarket_token', registerData.register.token);

        // Show success message
        toast.success(`Welcome to WinMarket, ${registerData.register.user.firstName}!`);

        // Refetch user data to update cache
        await refetchMe();

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error('Registration failed: Invalid response');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.graphQLErrors?.[0]?.message || error.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Call logout mutation
      await logoutMutation();

      // Clear local storage
      localStorage.removeItem('winmarket_token');
      localStorage.removeItem('winmarket_refresh_token');

      // Show success message
      toast.success('Logged out successfully');

      // Redirect to home page
      router.push('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still clear local storage even if the API call fails
      localStorage.removeItem('winmarket_token');
      localStorage.removeItem('winmarket_refresh_token');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;

    const rolesToCheck = Array.isArray(roles) ? roles : [roles];
    return rolesToCheck.includes(user.userType);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
    hasRole,
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
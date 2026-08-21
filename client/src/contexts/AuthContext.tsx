import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'starter' | 'growth' | 'scale';
  onboardingCompleted: boolean;
  status: 'active' | 'paused' | 'cancelled';
  tokenLimit: number;
  tokenUsed: number;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, workspaceName: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('contextiq_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = async () => {
    const savedToken = localStorage.getItem('contextiq_token');
    if (!savedToken) {
      setUser(null);
      setTenant(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiRequest<{ user: any; tenant: any }>('/auth/me');
      setUser({
        id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      });
      setTenant({
        id: data.tenant._id,
        name: data.tenant.name,
        slug: data.tenant.slug,
        plan: data.tenant.plan,
        onboardingCompleted: data.tenant.onboardingCompleted,
        status: data.tenant.status,
        tokenLimit: data.tenant.tokenLimit,
        tokenUsed: data.tenant.tokenUsed,
      });
    } catch (err) {
      console.error('[Auth] Failed to refresh session:', err);
      localStorage.removeItem('contextiq_token');
      setToken(null);
      setUser(null);
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiRequest<{ token: string; user: any; tenant: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('contextiq_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setTenant(data.tenant);
  };

  const signup = async (name: string, email: string, password: string, workspaceName: string) => {
    const data = await apiRequest<{ token: string; user: any; tenant: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, workspaceName }),
    });

    localStorage.setItem('contextiq_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setTenant(data.tenant);
  };

  const logout = () => {
    localStorage.removeItem('contextiq_token');
    setToken(null);
    setUser(null);
    setTenant(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        token,
        isLoading,
        login,
        signup,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

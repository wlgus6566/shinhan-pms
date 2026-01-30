'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { tokenManager } from '@/lib/api/fetcher';

// AuthContext용 간소화된 User 타입 (인증에 필요한 최소 정보만)
interface User {
  id: string;
  email: string;
  name: string;
  department: string;
  position: string;
  role: string;
  grade?: string;
  profileImage?: string;
  requirePasswordChange?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cache storage API calls (js-cache-storage)
  useEffect(() => {
    // Batch storage reads together
    const savedUser = localStorage.getItem('user');
    const token = tokenManager.getAccessToken();
    
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Clear invalid data
        tokenManager.clearTokens();
      }
    }
    setLoading(false);
  }, []);

  // Stable callbacks with useCallback
  const login = useCallback((token: string, user: User) => {
    tokenManager.setAccessToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    tokenManager.clearTokens();
    setUser(null);
    router.push('/');
  }, [router]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

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

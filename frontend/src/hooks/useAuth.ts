'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { getStoredUser, saveAuth, clearAuth } from '@/lib/auth';
import { auth as authApi } from '@/lib/api';
import { disconnectSocket } from '@/lib/websocket';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login(email, password);
      saveAuth(response);
      setUser(response.user);
      router.push('/dashboard');
      return response;
    },
    [router],
  );

  const logout = useCallback(() => {
    clearAuth();
    disconnectSocket();
    setUser(null);
    router.push('/login');
  }, [router]);

  return { user, loading, login, logout, isLoggedIn: !!user };
}

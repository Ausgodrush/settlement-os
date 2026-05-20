'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, saveAuth } from '@/lib/auth';
import { auth as authApi } from '@/lib/api';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      router.replace('/dashboard');
      return;
    }
    if (IS_DEMO) {
      authApi
        .login('admin@demo.com', 'demo1234')
        .then((res) => {
          saveAuth(res);
          router.replace('/dashboard');
        })
        .catch(() => {
          router.replace('/login');
        });
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

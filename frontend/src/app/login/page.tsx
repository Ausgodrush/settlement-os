'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { saveAuth } from '@/lib/auth';
import { auth as authApi } from '@/lib/api';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@demo.com' },
  { role: 'Buyer Conveyancer', email: 'buyer-conv@demo.com' },
  { role: 'Seller Conveyancer', email: 'seller-conv@demo.com' },
  { role: 'Buyer', email: 'buyer@demo.com' },
  { role: 'Seller', email: 'seller@demo.com' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      saveAuth(response);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword('demo1234');
    setError('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Settlement OS</h1>
          </div>

          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold text-amber-800 mb-2">Demo accounts — click to pre-fill</p>
            <div className="grid grid-cols-1 gap-1">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className="flex items-center justify-between text-left px-3 py-1.5 rounded text-xs hover:bg-amber-100 transition-colors"
                >
                  <span className="font-medium text-amber-900">{acc.role}</span>
                  <span className="text-amber-600">{acc.email}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-amber-600 mt-2">Password for all accounts: <strong>demo1234</strong></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com.au"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Demo environment — data resets on restart
          </p>
        </div>
      </div>
    </div>
  );
}

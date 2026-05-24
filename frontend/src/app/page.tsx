'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredUser, saveAuth } from '@/lib/auth';
import { auth as authApi } from '@/lib/api';
import { MOCK_LISTINGS } from '@/lib/mockListings';

async function attemptLogin(): Promise<void> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), 5000),
  );
  try {
    const res = await Promise.race([authApi.login('admin@demo.com', 'demo1234'), timeout]);
    saveAuth(res as Awaited<ReturnType<typeof authApi.login>>);
  } catch {
    // proceed anyway — login page will handle unauthenticated state
  }
}

export default function Home() {
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (getStoredUser()) router.replace('/dashboard');
  }, [router]);

  async function handleSignIn() {
    if (signingIn) return;
    setSigningIn(true);
    await attemptLogin();
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className="font-bold text-gray-900">Settlement OS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/listings" className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors">
            Browse listings
          </Link>
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-colors"
          >
            {signingIn
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Opening…</>
              : 'Sign in →'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Australian & Bali Property,<br />Coordinated.
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          Browse properties across Australia and Bali. Track conditions, manage documents, and coordinate all parties through to settlement.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-base font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            Browse all listings →
          </Link>
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 text-base font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            {signingIn ? 'Opening…' : 'Manage deals'}
          </button>
        </div>
      </div>

      {/* Featured listings preview */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Featured listings
          </h2>
          <Link href="/listings" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all {MOCK_LISTINGS.length} →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_LISTINGS.map((deal) => (
            <Link
              key={deal.id}
              href="/listings"
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden block hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                <img
                  src={deal.imageUrl}
                  alt={deal.propertyAddress}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 text-xl">{deal.flag}</span>
              </div>

              <div className="p-5">
                <div className="mb-3">
                  <p className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
                    {deal.propertyAddress}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{deal.suburb}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{deal.type} · {deal.titleRef}</p>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="font-semibold text-gray-800">
                    ${deal.purchasePrice.toLocaleString('en-AU')} {deal.currency}
                  </span>
                  {deal.settled ? (
                    <span className="text-xs text-green-600 font-medium">✓ Settled</span>
                  ) : (
                    <span className="text-xs text-gray-500">{deal.daysToSettle}d · {deal.settlementDate}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-1">
                    {deal.parties.map((initial, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
                        <span className="text-[9px] font-semibold text-indigo-600">{initial}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-indigo-500 group-hover:text-indigo-700 font-medium transition-colors">
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function ListingsPage() {
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  const totalValue = MOCK_LISTINGS.reduce((s, d) => s + d.purchasePrice, 0);
  const activeCount = MOCK_LISTINGS.filter((d) => !d.settled).length;
  const settledCount = MOCK_LISTINGS.filter((d) => d.settled).length;

  async function handleSignIn() {
    if (signingIn) return;
    setSigningIn(true);
    await attemptLogin();
    router.push('/dashboard');
  }

  const isLoggedIn = typeof window !== 'undefined' && !!getStoredUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/listings" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">Settlement OS</span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Dashboard →
              </Link>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {signingIn
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Opening…</>
                  : 'Sign in →'}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Australian & Bali property</p>
          </div>
          {isLoggedIn && (
            <Link href="/deals/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Listing
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">Active settlements</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-2xl font-bold text-green-600">{settledCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">Settled</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-800">
              ${(totalValue / 1_000_000).toFixed(2)}M AUD
            </p>
            <p className="text-sm text-gray-500 mt-0.5">Total portfolio value</p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {MOCK_LISTINGS.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group"
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
                    <span className="text-xs text-green-600 font-medium">✓ Settled {deal.settlementDate}</span>
                  ) : (
                    <span className={`text-xs flex items-center gap-1 ${
                      deal.daysToSettle <= 14 ? 'text-red-600 font-medium' : 'text-gray-500'
                    }`}>
                      {deal.daysToSettle <= 14 && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                      {deal.daysToSettle}d to settle · {deal.settlementDate}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                  <span>Deposit {deal.deposit}</span>
                  {deal.depositPaid && <span className="text-green-600 font-medium">✓ Paid</span>}
                </div>

                {deal.conditionsTotal > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Conditions</span>
                      <span>{deal.conditionsMet}/{deal.conditionsTotal} met</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.round((deal.conditionsMet / deal.conditionsTotal) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 mb-3 line-clamp-1">{deal.notes}</p>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-1">
                    {deal.parties.map((initial, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
                        <span className="text-[9px] font-semibold text-indigo-600">{initial}</span>
                      </div>
                    ))}
                  </div>
                  {isLoggedIn && (
                    <Link
                      href={`/deals/${deal.id}`}
                      className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                    >
                      Open →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          {isLoggedIn ? (
            <>Showing demo listings · <Link href="/deals" className="text-indigo-500 hover:underline">Manage all deals</Link></>
          ) : (
            <>Browse freely · <button onClick={handleSignIn} className="text-indigo-500 hover:underline">Sign in to manage deals</button></>
          )}
        </p>
      </main>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredUser, saveAuth } from '@/lib/auth';
import { auth as authApi } from '@/lib/api';
import { MOCK_LISTINGS } from '@/lib/mockListings';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

async function attemptDemoLogin(): Promise<void> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), 5000),
  );
  try {
    const res = await Promise.race([authApi.login('admin@demo.com', 'demo1234'), timeout]);
    saveAuth(res as Awaited<ReturnType<typeof authApi.login>>);
  } catch {
    // proceed anyway — dashboard will redirect to /login if needed
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
    if (IS_DEMO) {
      await attemptDemoLogin();
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
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
          <span className="font-bold text-gray-900">BALIPROP Settlement OS</span>
        </div>

        {IS_DEMO ? (
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 cursor-pointer transition-colors"
          >
            {signingIn
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Opening…</>
              : 'Enter demo →'}
          </button>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            Sign in →
          </Link>
        )}
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-10 text-center">
        <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Australian & Bali Property Settlement Platform
        </span>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Property Settlements,<br />Coordinated.
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          Track conditions, manage documents, and coordinate all parties across Australian and Bali property transactions.
        </p>
        {IS_DEMO ? (
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-base font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 cursor-pointer transition-colors"
          >
            {signingIn ? 'Opening dashboard…' : 'View live dashboard →'}
          </button>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-base font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            Sign in to dashboard →
          </Link>
        )}
      </div>

      {/* Listings grid */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Current settlements
          </h2>
          <span className="text-xs text-gray-400">{MOCK_LISTINGS.length} properties</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_LISTINGS.map((deal) => (
            <div
              key={deal.id}
              role="button"
              tabIndex={0}
              onClick={handleSignIn}
              onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group select-none"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-base">{deal.flag}</span>
                    <p className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
                      {deal.propertyAddress}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">{deal.suburb}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{deal.type} · {deal.titleRef}</p>
                </div>
                <span className={`ml-3 flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${deal.statusColor}`}>
                  {deal.statusLabel}
                </span>
              </div>

              {/* Price */}
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
                    {deal.daysToSettle}d · {deal.settlementDate}
                  </span>
                )}
              </div>

              {/* Deposit */}
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                <span>Deposit {deal.deposit}</span>
                {deal.depositPaid && <span className="text-green-600 font-medium">✓ Paid</span>}
              </div>

              {/* Conditions bar */}
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

              {/* Notes */}
              <p className="text-xs text-gray-400 mb-3 line-clamp-1">{deal.notes}</p>

              {/* Parties & arrow */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-1">
                  {deal.parties.map((initial, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
                      <span className="text-[9px] font-semibold text-indigo-600">{initial}</span>
                    </div>
                  ))}
                </div>
                <span className="text-xs text-indigo-500 group-hover:text-indigo-700 font-medium transition-colors">
                  Open →
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          {IS_DEMO
            ? 'Demo environment · sign in to create and manage your own settlement deals'
            : 'Sign in to create and manage property settlement deals'}
        </p>
      </div>
    </div>
  );
}

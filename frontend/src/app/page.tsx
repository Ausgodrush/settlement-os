'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveAuth } from '@/lib/auth';
import { auth as authApi } from '@/lib/api';
import { MOCK_LISTINGS } from '@/lib/mockListings';
import ListingImageCarousel from '@/components/listings/ListingImageCarousel';

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

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Listings', href: '/listings' },
  { label: 'Invest', href: '/invest' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Deals', href: '/deals' },
  { label: 'Contact', href: '/contact' },
];

export default function Home() {
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  async function handleSignIn() {
    if (signingIn) return;
    setSigningIn(true);
    await attemptLogin();
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Navbar */}
      <nav className="px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo + burger button */}
          <div className="relative">
            <button
              aria-expanded={navOpen}
              aria-controls="home-nav"
              data-testid="burger-menu"
              onClick={() => setNavOpen((v) => !v)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Settlement OS</span>
              <div className="w-4 h-4 relative ml-1">
                <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${navOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 18 14">
                    <rect y="0" width="18" height="2" rx="1"/>
                    <rect y="6" width="18" height="2" rx="1"/>
                    <rect y="12" width="18" height="2" rx="1"/>
                  </svg>
                </span>
                <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${navOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </span>
              </div>
            </button>

            {/* Floating dropdown nav */}
            {navOpen && (
              <div
                id="home-nav"
                className="absolute top-full left-0 mt-2 w-48 z-50 bg-white border border-gray-200 rounded-xl shadow-xl"
              >
                <div className="p-2">
                  {NAV_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setNavOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => { setNavOpen(false); handleSignIn(); }}
                      disabled={signingIn}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-60"
                    >
                      {signingIn ? 'Opening…' : 'Sign in →'}
                    </button>
                  </div>
                </div>
              </div>
            )}
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
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_LISTINGS.map((deal) => (
            <Link
              key={deal.id}
              href={`/listings/${deal.id}`}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden block hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <ListingImageCarousel images={deal.images} alt={deal.propertyAddress} />

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

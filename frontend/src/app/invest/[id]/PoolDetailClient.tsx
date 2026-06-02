'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_POOLS, CRYPTO_SYMBOLS, CRYPTO_PRICES, CryptoSymbol, PaymentMethod } from '@/lib/investData';
import { getPools } from '@/lib/investStore';
import CheckoutModal from '@/components/invest/CheckoutModal';
import { useWallet } from '@/hooks/useWallet';
import { usePortfolio } from '@/hooks/usePortfolio';

const NAV_LINKS = [
  { label: 'Home',      href: '/' },
  { label: 'Listings',  href: '/listings' },
  { label: 'Invest',    href: '/invest' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Contact',   href: '/contact' },
];

export default function PoolDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const pool = MOCK_POOLS.find((p) => p.id === id);
  const [imgIdx, setImgIdx] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { wallet, connecting, connect, disconnect } = useWallet();
  const { invest } = usePortfolio();

  const handleConfirm = useCallback(
    (amount: number, method: PaymentMethod, crypto: CryptoSymbol | null) => {
      if (!pool) return;
      const result = invest(pool, amount, method, crypto);
      setSuccessMsg(`Invested $${amount.toLocaleString('en-AU')} AUD in ${pool.name}. Fee: $${result.holding.feePaid.toFixed(2)}.`);
      setShowModal(false);
    },
    [pool, invest],
  );

  if (!pool) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Pool not found.</p>
          <Link href="/invest" className="text-indigo-600 hover:underline text-sm">← Back to invest</Link>
        </div>
      </div>
    );
  }

  const images = pool.images?.length ? pool.images : [pool.imageUrl];
  const total  = images.length;
  const pct = Math.min(Math.round((pool.amountRaised / pool.targetRaise) * 100), 100);
  const remaining = pool.targetRaise - pool.amountRaised;
  const slotsLeft = pool.maxInvestors - pool.investorCount;
  const isOpen = pool.status === 'OPEN';

  // Annual return on minimum investment
  const minReturn = parseFloat((pool.minInvestment * pool.expectedYield / 100).toFixed(0));

  const livePool = typeof window !== 'undefined'
    ? (getPools().find((p) => p.id === id) ?? pool)
    : pool;

  return (
    <div className="min-h-screen bg-white">

      {/* Burger nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="relative">
            <button onClick={() => setNavOpen((v) => !v)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
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
                    <rect y="0" width="18" height="2" rx="1"/><rect y="6" width="18" height="2" rx="1"/><rect y="12" width="18" height="2" rx="1"/>
                  </svg>
                </span>
                <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${navOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </span>
              </div>
            </button>
            {navOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 z-50 bg-white border border-gray-200 rounded-xl shadow-xl">
                <div className="p-2">
                  {NAV_LINKS.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setNavOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <Link href="/login" onClick={() => setNavOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors">
                      Sign in →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/invest" className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors hidden sm:block">
              All pools
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              Sign in →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero gallery */}
      <div className="relative bg-gray-900" style={{ height: 420 }}>
        <img src={images[imgIdx]} alt={pool.name} className="w-full h-full object-cover transition-opacity duration-200" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {total > 1 && (
          <>
            <button onClick={() => setImgIdx((i) => (i - 1 + total) % total)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10">
              <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button onClick={() => setImgIdx((i) => (i + 1) % total)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10">
              <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </>
        )}

        <div className="absolute bottom-[4.5rem] right-4 px-3 py-1 bg-black/60 text-white text-xs font-medium rounded-full z-10">
          {imgIdx + 1} / {total}
        </div>

        {total > 1 && (
          <div className="absolute bottom-[4.5rem] left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((src, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${i === imgIdx ? 'border-white shadow-lg scale-105' : 'border-white/40 hover:border-white/80'}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-2xl">{pool.flag}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  isOpen ? 'bg-green-500 text-white' : pool.status === 'FUNDED' ? 'bg-indigo-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {isOpen ? 'Open for Investment' : pool.status === 'FUNDED' ? '✓ Fully Funded' : 'Closed'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">{pool.name}</h1>
              <p className="text-white/70 text-base">{pool.location} · {pool.propertyType}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <p className="text-2xl font-extrabold text-green-400">{pool.expectedYield}%</p>
                <p className="text-xs text-white/70 mt-0.5">Expected yield p.a.</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <p className="text-2xl font-extrabold text-white">{pool.term}yr</p>
                <p className="text-xs text-white/70 mt-0.5">Investment term</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="max-w-6xl mx-auto px-6 mt-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            {successMsg}
            <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-600 hover:text-green-800">✕</button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Min. investment', value: `$${pool.minInvestment.toLocaleString('en-AU')}` },
                { label: 'Payout',          value: pool.payoutFrequency },
                { label: 'Investors',        value: `${pool.investorCount} / ${pool.maxInvestors}` },
                { label: 'Est. annual return', value: `$${minReturn.toLocaleString('en-AU')}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                  <p className="text-sm font-bold text-gray-900">{value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">About this pool</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{pool.description}</p>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Investment highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pool.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Funding progress */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Funding progress</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-2xl font-extrabold text-indigo-600">
                      ${(pool.amountRaised / 1000).toFixed(0)}k
                    </span>
                    <span className="text-sm text-gray-400 ml-1">raised</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-500">
                    {pct}% of ${(pool.targetRaise / 1000).toFixed(0)}k target
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${isOpen ? 'bg-indigo-500' : 'bg-gray-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{pool.investorCount} investors · {slotsLeft > 0 ? `${slotsLeft} slots remaining` : 'All slots filled'}</span>
                  {isOpen && remaining > 0 && (
                    <span className="font-medium text-gray-600">${remaining.toLocaleString('en-AU')} to go</span>
                  )}
                </div>
              </div>
            </div>

            {/* Pool details table */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Pool details</h2>
              <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
                {([
                  ['Pool name',       pool.name],
                  ['Property type',   pool.propertyType],
                  ['Location',        pool.location],
                  ['Beds / Baths',    `${pool.beds} bed · ${pool.baths} bath${pool.landSize ? ` · ${pool.landSize}` : ''}`],
                  ['Target raise',    `$${pool.targetRaise.toLocaleString('en-AU')} AUD`],
                  ['Min. investment', `$${pool.minInvestment.toLocaleString('en-AU')} AUD`],
                  ['Expected yield',  `${pool.expectedYield}% p.a.`],
                  ['Investment term', `${pool.term} years`],
                  ['Payout freq.',    pool.payoutFrequency],
                  ['Currency',        pool.currency],
                  ['Max investors',   `${pool.maxInvestors}`],
                  ['Pool ID',         pool.id.toUpperCase()],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex items-start px-5 py-3 gap-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 flex-shrink-0 pt-0.5">{label}</span>
                    <span className="text-sm text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-4 lg:sticky lg:top-20">

            {/* Invest CTA */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-extrabold text-indigo-600">{pool.expectedYield}%</p>
                  <p className="text-xs text-gray-400">Expected yield p.a.</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{pool.term}yr</p>
                  <p className="text-xs text-gray-400">Term</p>
                </div>
              </div>

              {isOpen ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-3.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mb-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                  Invest from ${pool.minInvestment.toLocaleString('en-AU')} AUD
                </button>
              ) : (
                <div className="w-full py-3 text-center bg-gray-100 text-gray-500 text-sm font-semibold rounded-xl mb-2">
                  {pool.status === 'FUNDED' ? '✓ Fully Funded' : 'Pool Closed'}
                </div>
              )}

              <Link href="/login"
                className="block w-full py-2.5 text-center border border-gray-300 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                Sign in to manage investment
              </Link>

              <p className="text-[10px] text-gray-400 text-center mt-3">
                Min. ${pool.minInvestment.toLocaleString('en-AU')} AUD · 2% platform fee applies
              </p>
            </div>

            {/* Pool health */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Pool snapshot</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Investors</span>
                  <span className="font-semibold text-gray-900">{pool.investorCount} / {pool.maxInvestors}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Capital raised</span>
                  <span className="font-semibold text-gray-900">${(pool.amountRaised / 1000).toFixed(0)}k AUD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payout</span>
                  <span className="font-semibold text-gray-900">{pool.payoutFrequency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Est. on min. invest</span>
                  <span className="font-semibold text-green-600">+${minReturn.toLocaleString('en-AU')}/yr</span>
                </div>
              </div>
            </div>

            {/* Crypto equivalent */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-3">Pay with crypto</p>
              <div className="space-y-2">
                {(['BTC', 'ETH', 'SOL'] as CryptoSymbol[]).map((c) => {
                  const cryptoAmt = (pool.minInvestment / CRYPTO_PRICES[c]);
                  const fmt = c === 'BTC' ? cryptoAmt.toFixed(6) : c === 'ETH' ? cryptoAmt.toFixed(4) : cryptoAmt.toFixed(2);
                  return (
                    <div key={c} className="flex items-center justify-between text-sm">
                      <span className="text-indigo-700 font-medium">{CRYPTO_SYMBOLS[c]} {c}</span>
                      <span className="font-semibold text-indigo-900">{fmt}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-indigo-400 mt-2">Rates for minimum investment. Live rates at checkout.</p>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>&copy; {new Date().getFullYear()} BALIPROP LLC · Settlement OS</span>
          <div className="flex gap-4">
            <Link href="/invest" className="hover:text-gray-600 transition-colors">All pools</Link>
            <Link href="/listings" className="hover:text-gray-600 transition-colors">Listings</Link>
            <Link href="/contact" className="hover:text-gray-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

      {showModal && (
        <CheckoutModal
          pool={livePool}
          walletState={wallet}
          connecting={connecting}
          onConnect={connect}
          onDisconnect={disconnect}
          onConfirm={handleConfirm}
          onClose={() => setShowModal(false)}
        />
      )}

    </div>
  );
}

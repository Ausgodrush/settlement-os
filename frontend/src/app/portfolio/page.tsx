'use client';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  CRYPTO_SYMBOLS,
  CRYPTO_PRICES,
  CryptoSymbol,
  cryptoEquiv,
} from '@/lib/investData';
import Link from 'next/link';

export default function PortfolioPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { portfolio, totalInvested, totalFees, projectedAnnual } = usePortfolio();
  const [cryptoView, setCryptoView] = useState<CryptoSymbol>('ETH');

  useEffect(() => {
    if (!loading && user === null) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return null;

  const totalCrypto = cryptoEquiv(totalInvested, cryptoView);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your fractional investment holdings</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-2xl font-bold text-indigo-600">
              ${totalInvested.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">Total invested</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-2xl font-bold text-green-600">
              ${projectedAnnual.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">Projected annual return</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-800">{portfolio.length}</p>
            <p className="text-sm text-gray-500 mt-0.5">Holdings</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-2xl font-bold text-amber-600">
              ${totalFees.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">Platform fees paid</p>
          </div>
        </div>

        {/* Crypto equivalent */}
        {totalInvested > 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-900">Portfolio crypto equivalent</p>
                <p className="text-2xl font-bold text-indigo-700 mt-1">
                  {CRYPTO_SYMBOLS[cryptoView]}{totalCrypto} {cryptoView}
                </p>
                <p className="text-xs text-indigo-400 mt-0.5">
                  at ${CRYPTO_PRICES[cryptoView].toLocaleString()} AUD/{cryptoView}
                </p>
              </div>
              <div className="flex gap-2">
                {(['BTC', 'ETH', 'SOL'] as CryptoSymbol[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCryptoView(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      cryptoView === c
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-indigo-600 border border-indigo-200 hover:border-indigo-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Holdings */}
        {portfolio.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-lg font-semibold text-gray-700">No investments yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">Browse open pools and invest to build your portfolio</p>
            <Link
              href="/invest"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse investment pools →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Holdings</h2>
            {portfolio.map((h, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{h.poolName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{h.location} · Invested {h.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">${h.amount.toLocaleString('en-AU')} AUD</p>
                    <p className="text-xs text-green-600 mt-0.5">{h.expectedYield}% p.a.</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">Net invested</p>
                    <p className="font-medium text-gray-800 mt-0.5">${h.netAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Fee paid</p>
                    <p className="font-medium text-gray-800 mt-0.5">${h.feePaid.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Annual return (est.)</p>
                    <p className="font-medium text-green-700 mt-0.5">
                      +${(h.netAmount * h.expectedYield / 100).toFixed(0)}/yr
                    </p>
                  </div>
                </div>

                {h.crypto && h.cryptoAmount && (
                  <div className="mt-2 text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-1.5">
                    {CRYPTO_SYMBOLS[h.crypto]}{h.cryptoAmount} {h.crypto} equivalent
                    · Returns paid in {h.crypto}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

'use client';
import { useState, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import CheckoutModal from '@/components/invest/CheckoutModal';
import { InvestPool, PLATFORM_FEE_RATE, CryptoSymbol, PaymentMethod } from '@/lib/investData';
import { usePools } from '@/hooks/usePortfolio';
import { useWallet } from '@/hooks/useWallet';
import { usePortfolio } from '@/hooks/usePortfolio';

export default function InvestPage() {
  const { pools, refresh } = usePools();
  const { wallet, connecting, connect, disconnect } = useWallet();
  const { invest } = usePortfolio();
  const [selectedPool, setSelectedPool] = useState<InvestPool | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'AU' | 'ID' | 'OPEN'>('ALL');

  const filtered = pools.filter((p) => {
    if (filter === 'AU') return p.country === 'AU';
    if (filter === 'ID') return p.country === 'ID';
    if (filter === 'OPEN') return p.status === 'OPEN';
    return true;
  });

  const openCount = pools.filter((p) => p.status === 'OPEN').length;
  const totalTarget = pools.reduce((s, p) => s + p.targetRaise, 0);
  const totalRaised = pools.reduce((s, p) => s + p.amountRaised, 0);

  const handleConfirm = useCallback(
    (amount: number, method: PaymentMethod, crypto: CryptoSymbol | null) => {
      if (!selectedPool) return;
      const result = invest(selectedPool, amount, method, crypto);
      refresh();
      setSuccessMsg(
        `Invested $${amount.toLocaleString('en-AU')} AUD in ${selectedPool.name}. Fee: $${result.holding.feePaid.toFixed(2)}.`,
      );
      setSelectedPool(null);
    },
    [selectedPool, invest, refresh],
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Investment Pools</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fractional property investment · AU & Bali</p>
        </div>

        {successMsg && (
          <div className="mb-4 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
            <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-600 hover:text-green-800">✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-2xl font-bold text-indigo-600">{openCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">Open pools</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-2xl font-bold text-green-600">
              ${(totalRaised / 1_000_000).toFixed(2)}M
            </p>
            <p className="text-sm text-gray-500 mt-0.5">Capital raised</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-800">
              {Math.round((totalRaised / totalTarget) * 100)}%
            </p>
            <p className="text-sm text-gray-500 mt-0.5">Avg. funded</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(['ALL', 'OPEN', 'AU', 'ID'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {f === 'ALL' ? 'All pools' : f === 'OPEN' ? 'Open' : f === 'AU' ? '🇦🇺 Australia' : '🇮🇩 Bali'}
            </button>
          ))}
        </div>

        {/* Pool grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((pool) => {
            const pct = Math.min(Math.round((pool.amountRaised / pool.targetRaise) * 100), 100);
            const remaining = pool.targetRaise - pool.amountRaised;
            return (
              <div
                key={pool.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md hover:border-indigo-200 transition-all flex flex-col"
              >
                {/* Image */}
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  <img
                    src={pool.imageUrl}
                    alt={pool.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 text-xl">{pool.flag}</span>
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    pool.status === 'OPEN'
                      ? 'bg-green-100 text-green-700'
                      : pool.status === 'FUNDED'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {pool.status === 'OPEN' ? 'Open' : pool.status === 'FUNDED' ? '✓ Funded' : 'Closed'}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-3">
                    <p className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                      {pool.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{pool.location} · {pool.propertyType}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pool.description}</p>
                  </div>

                  {/* Key metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-sm font-bold text-indigo-600">{pool.expectedYield}%</p>
                      <p className="text-[10px] text-gray-400">Yield p.a.</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-sm font-bold text-gray-800">{pool.term}yr</p>
                      <p className="text-[10px] text-gray-400">Term</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs font-bold text-gray-800 leading-tight">{pool.payoutFrequency}</p>
                      <p className="text-[10px] text-gray-400">Payout</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>${(pool.amountRaised / 1000).toFixed(0)}k raised</span>
                      <span>{pct}% of ${(pool.targetRaise / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pool.status === 'FUNDED' ? 'bg-indigo-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{pool.investorCount}/{pool.maxInvestors} investors</span>
                      {pool.status === 'OPEN' && <span>${(remaining / 1000).toFixed(0)}k remaining</span>}
                    </div>
                  </div>

                  {/* Min investment */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Min. investment</span>
                    <span className="font-semibold text-gray-800">${pool.minInvestment.toLocaleString('en-AU')} AUD</span>
                  </div>

                  {/* Features */}
                  {pool.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {pool.features.slice(0, 3).map((f) => (
                        <span key={f} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto">
                    {pool.status === 'OPEN' ? (
                      <button
                        onClick={() => setSelectedPool(pool)}
                        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Invest Now
                      </button>
                    ) : (
                      <div className="w-full py-2.5 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg text-center">
                        {pool.status === 'FUNDED' ? 'Fully Funded' : 'Closed'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">No pools match this filter</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Demo environment · {PLATFORM_FEE_RATE * 100}% platform fee on all investments
        </p>
      </main>

      {selectedPool && (
        <CheckoutModal
          pool={selectedPool}
          walletState={wallet}
          connecting={connecting}
          onConnect={connect}
          onDisconnect={disconnect}
          onConfirm={handleConfirm}
          onClose={() => setSelectedPool(null)}
        />
      )}
    </div>
  );
}

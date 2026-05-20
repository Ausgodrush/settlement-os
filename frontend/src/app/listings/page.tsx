'use client';
import Link from 'next/link';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { MOCK_LISTINGS } from '@/lib/mockListings';

type Filter = 'ALL' | 'AU' | 'ID';

export default function ListingsPage() {
  const [filter, setFilter] = useState<Filter>('ALL');

  const visible = filter === 'ALL'
    ? MOCK_LISTINGS
    : MOCK_LISTINGS.filter((d) => d.country === filter);

  const totalValue = MOCK_LISTINGS.reduce((s, d) => s + d.purchasePrice, 0);
  const activeCount = MOCK_LISTINGS.filter((d) => !d.settled).length;
  const settledCount = MOCK_LISTINGS.filter((d) => d.settled).length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Australian & Bali property settlements</p>
          </div>
          <Link href="/deals/new" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Deal
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">Active settlements</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-green-600">{settledCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">Settled</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-gray-800">
              ${(totalValue / 1_000_000).toFixed(2)}M AUD
            </p>
            <p className="text-sm text-gray-500 mt-0.5">Total portfolio value</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1 mb-6 w-fit">
          {(['ALL', 'AU', 'ID'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'ALL' ? 'All' : f === 'AU' ? '🇦🇺 Australia' : '🇮🇩 Bali'}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visible.map((deal) => (
            <Link
              key={deal.id}
              href={`/deals/${deal.id}`}
              className="card p-5 block hover:shadow-md hover:border-indigo-200 transition-all group"
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
                <span className={`ml-3 flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${deal.statusColor}`}>
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
                    {deal.daysToSettle}d to settle · {deal.settlementDate}
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
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Showing demo listings ·{' '}
          <Link href="/deals" className="text-indigo-500 hover:underline">Manage all deals</Link>
        </p>
      </main>
    </div>
  );
}

'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import CheckoutModal from '@/components/invest/CheckoutModal';
import { getStoredUser } from '@/lib/auth';
import { MOCK_LISTINGS } from '@/lib/mockListings';
import ListingImageCarousel from '@/components/listings/ListingImageCarousel';
import { InvestPool, CryptoSymbol, PaymentMethod } from '@/lib/investData';
import { usePools } from '@/hooks/usePortfolio';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useWallet } from '@/hooks/useWallet';

export default function ListingsPage() {
  const totalValue = MOCK_LISTINGS.reduce((s, d) => s + d.purchasePrice, 0);
  const activeCount = MOCK_LISTINGS.filter((d) => !d.settled).length;
  const settledCount = MOCK_LISTINGS.filter((d) => d.settled).length;

  const isLoggedIn = typeof window !== 'undefined' && !!getStoredUser();

  const { pools, refresh } = usePools();
  const { invest } = usePortfolio();
  const { wallet, connecting, connect, disconnect } = useWallet();

  const [selectedPool, setSelectedPool] = useState<InvestPool | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

        {successMsg && (
          <div className="mb-5 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
            <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-600 hover:text-green-800">✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
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
          {MOCK_LISTINGS.map((deal) => {
            const listingPool = deal.poolId ? pools.find((p) => p.id === deal.poolId) : null;
            const hasOpenPools = listingPool?.status === 'OPEN';

            return (
              <Link
                key={deal.id}
                href={`/listings/${deal.id}`}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group block"
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

                    <div className="flex items-center gap-2">
                      {hasOpenPools && listingPool && (
                        <button
                          onClick={() => setSelectedPool(listingPool)}
                          className="text-xs px-2.5 py-1 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          Invest
                        </button>
                      )}
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
              </Link>
            );
          })}
        </div>

        {isLoggedIn && (
          <p className="text-center text-xs text-gray-400 mt-8">
            Showing demo listings · <Link href="/deals" className="text-indigo-500 hover:underline">Manage all deals</Link>
          </p>
        )}
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

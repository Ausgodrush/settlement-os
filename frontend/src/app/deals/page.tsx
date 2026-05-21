'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import DealCard from '@/components/deals/DealCard';
import { useDeals } from '@/hooks/useDeals';
import { DealStatus, DEAL_STATUS_LABELS } from '@/types';

const STATUS_TABS: { label: string; value: DealStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Ready', value: 'READY' },
  { label: 'Settled', value: 'SETTLED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function DealsPage() {
  const { data, loading, error, status, setStatus, search, setSearch } = useDeals();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <Link href="/deals/new" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Listing
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setStatus(tab.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  status === tab.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="input pl-9"
              placeholder="Search address or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {data && (
            <span className="text-sm text-gray-400">{data.total} deal{data.total !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Deal Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card p-8 text-center text-red-600">{error}</div>
        ) : data?.data.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-500">No deals found.</p>
            <Link href="/deals/new" className="btn-primary mt-4 inline-flex">
              Create a deal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {data?.data.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

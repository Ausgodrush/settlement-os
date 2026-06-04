'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { useDeals } from '@/hooks/useDeals';
import { Deal, DEAL_STATUS_COLORS, DEAL_STATUS_LABELS } from '@/types';

const MOCK_PIPELINE: Partial<Deal>[] = [
  {
    id: 'd1',
    referenceNo: 'PSOS-2024-0042',
    propertyAddress: '14 Glenelg Street',
    propertySuburb: 'Norwood',
    propertyState: 'SA',
    status: 'ACTIVE' as const,
    purchasePrice: 850000,
    settlementDate: '2026-06-20',
    daysToSettlement: 17,
    conditionsSummary: { total: 5, met: 3, pending: 2 },
  },
  {
    id: 'd2',
    referenceNo: 'PSOS-2024-0039',
    propertyAddress: '7 Jetty Road',
    propertySuburb: 'Glenelg',
    propertyState: 'SA',
    status: 'READY' as const,
    purchasePrice: 620000,
    settlementDate: '2026-06-06',
    daysToSettlement: 3,
    conditionsSummary: { total: 4, met: 4, pending: 0 },
  },
  {
    id: 'd3',
    referenceNo: 'PSOS-2024-0051',
    propertyAddress: 'Villa Karang Sunset',
    propertySuburb: 'Seminyak',
    propertyState: 'BALI',
    status: 'ACTIVE' as const,
    purchasePrice: 485000,
    settlementDate: '2026-07-01',
    daysToSettlement: 28,
    conditionsSummary: { total: 3, met: 1, pending: 2 },
  },
  {
    id: 'd4',
    referenceNo: 'PSOS-2024-0031',
    propertyAddress: '42 Prospect Street',
    propertySuburb: 'Prospect',
    propertyState: 'SA',
    status: 'SETTLED' as const,
    purchasePrice: 750000,
    conditionsSummary: { total: 5, met: 5, pending: 0 },
  },
  {
    id: 'd5',
    referenceNo: 'PSOS-2024-0058',
    propertyAddress: '3 Moseley Square',
    propertySuburb: 'Glenelg',
    propertyState: 'SA',
    status: 'INIT' as const,
    purchasePrice: 1450000,
    conditionsSummary: { total: 5, met: 0, pending: 5 },
  },
];

export default function ConveyancerPipelinePage() {
  const { data, loading } = useDeals();
  const apiDeals = data?.data || [];
  const deals = (apiDeals.length > 0 ? apiDeals : MOCK_PIPELINE) as Deal[];

  const actionRequired = deals.filter((d) =>
    d.status === 'READY' ||
    (d.conditionsSummary && d.conditionsSummary.pending === 0 && d.status === 'ACTIVE'),
  );

  const grouped = {
    INIT: deals.filter((d) => d.status === 'INIT'),
    ACTIVE: deals.filter((d) => d.status === 'ACTIVE'),
    READY: deals.filter((d) => d.status === 'READY'),
    SETTLED: deals.filter((d) => d.status === 'SETTLED'),
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conveyancer Pipeline</h1>
            <p className="text-sm text-gray-500 mt-0.5">Overview of all deals requiring attention</p>
          </div>
          <Link href="/deals/new" className="btn-primary">
            New Listing
          </Link>
        </div>

        {/* Action Required */}
        {actionRequired.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Action Required ({actionRequired.length})
            </h2>
            <div className="space-y-2">
              {actionRequired.map((deal) => (
                <ActionCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        )}

        {/* Kanban Pipeline */}
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
          Full Pipeline
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(grouped).map(([status, statusDeals]) => (
              <div key={status} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className={`badge ${DEAL_STATUS_COLORS[status as keyof typeof DEAL_STATUS_COLORS]}`}>
                    {DEAL_STATUS_LABELS[status as keyof typeof DEAL_STATUS_LABELS]}
                  </span>
                  <span className="text-xs text-gray-400">{statusDeals.length}</span>
                </div>
                <div className="space-y-2">
                  {statusDeals.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="block card p-3 hover:shadow-md transition-shadow"
                    >
                      <p className="text-xs font-semibold text-gray-900 leading-tight truncate">
                        {deal.propertyAddress}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{deal.referenceNo}</p>
                      {deal.settlementDate && (
                        <p className="text-[10px] text-gray-500 mt-1">
                          {deal.daysToSettlement != null && deal.daysToSettlement >= 0
                            ? `${deal.daysToSettlement}d`
                            : new Date(deal.settlementDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                      {deal.conditionsSummary && (
                        <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: deal.conditionsSummary.total
                                ? `${Math.round((deal.conditionsSummary.met / deal.conditionsSummary.total) * 100)}%`
                                : '0%',
                            }}
                          />
                        </div>
                      )}
                    </Link>
                  ))}
                  {statusDeals.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No deals</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ActionCard({ deal }: { deal: Deal }) {
  const [localStatus, setLocalStatus] = useState(deal.status);
  const [done, setDone] = useState(false);
  const isReady = localStatus === 'READY';

  function handleApprove() {
    if (!window.confirm(`Approve ${deal.propertyAddress} for settlement? All conditions have been verified.`)) return;
    setLocalStatus('READY');
  }

  function handleExecute() {
    if (!window.confirm(`Execute settlement for ${deal.propertyAddress}? This will trigger PEXA and release escrow.`)) return;
    setLocalStatus('SETTLED');
    setDone(true);
  }

  if (done) {
    return (
      <div className="card p-4 flex items-center gap-3 border-l-4 border-l-green-400 bg-green-50">
        <span className="text-xl">🏠</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-green-800 text-sm">{deal.propertyAddress}</p>
          <p className="text-xs text-green-600 mt-0.5">Settlement executed — PEXA notified ✓</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 border-l-4 border-l-red-400 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 text-sm truncate">{deal.propertyAddress}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {deal.referenceNo} · ${deal.purchasePrice?.toLocaleString('en-AU')}
          </p>
          <p className={`text-xs mt-1 font-medium ${isReady ? 'text-amber-700' : 'text-indigo-700'}`}>
            {isReady ? '⚡ Ready to execute settlement' : '✅ All conditions met — awaiting approval'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isReady ? (
            <button
              onClick={handleExecute}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              Execute Settlement
            </button>
          ) : (
            <button
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Approve for Settlement
            </button>
          )}
          <Link href={`/deals/${deal.id}`} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}

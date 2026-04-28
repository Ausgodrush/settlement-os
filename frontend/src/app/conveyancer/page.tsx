'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { useDeals } from '@/hooks/useDeals';
import { Deal, DEAL_STATUS_COLORS, DEAL_STATUS_LABELS } from '@/types';

export default function ConveyancerPipelinePage() {
  const { data, loading } = useDeals();
  const deals = data?.data || [];

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
            New Deal
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
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
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
  const isReady = deal.status === 'READY';
  return (
    <Link
      href={`/deals/${deal.id}`}
      className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow border-l-4 border-l-red-400"
    >
      <div>
        <p className="font-medium text-gray-900 text-sm">{deal.propertyAddress}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {deal.referenceNo} · ${deal.purchasePrice?.toLocaleString('en-AU')}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {isReady && (
          <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
            Approve Settlement
          </span>
        )}
        {!isReady && deal.conditionsSummary?.pending === 0 && (
          <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">
            All Conditions Met
          </span>
        )}
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

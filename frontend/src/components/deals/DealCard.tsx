'use client';
import Link from 'next/link';
import { Deal, DEAL_STATUS_LABELS, DEAL_STATUS_COLORS } from '@/types';

interface Props {
  deal: Deal;
}

export default function DealCard({ deal }: Props) {
  const urgency = deal.daysToSettlement != null && deal.daysToSettlement <= 14;

  return (
    <Link href={`/deals/${deal.id}`} className="card p-5 block hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
            {deal.propertyAddress}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{deal.referenceNo}</p>
        </div>
        <span className={`badge ml-3 flex-shrink-0 ${DEAL_STATUS_COLORS[deal.status]}`}>
          {DEAL_STATUS_LABELS[deal.status]}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>${deal.purchasePrice?.toLocaleString('en-AU')}</span>
        {deal.settlementDate && (
          <span className={`flex items-center gap-1 ${urgency ? 'text-red-600 font-medium' : ''}`}>
            {urgency && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
            {deal.daysToSettlement != null && deal.daysToSettlement >= 0
              ? `${deal.daysToSettlement}d to settle`
              : deal.status === 'SETTLED'
              ? 'Settled'
              : formatDate(deal.settlementDate)}
          </span>
        )}
      </div>

      {deal.conditionsSummary && deal.conditionsSummary.total > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Conditions</span>
            <span>{deal.conditionsSummary.met}/{deal.conditionsSummary.total}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{
                width: `${Math.round((deal.conditionsSummary.met / deal.conditionsSummary.total) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {deal.parties && deal.parties.length > 0 && (
        <div className="mt-3 flex -space-x-1">
          {deal.parties.slice(0, 4).map((p) => (
            <div
              key={p.id}
              title={`${p.user.name} (${p.role})`}
              className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center"
            >
              <span className="text-[9px] font-semibold text-indigo-600">
                {p.user.name?.charAt(0)}
              </span>
            </div>
          ))}
          {deal.parties.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
              <span className="text-[9px] text-gray-500">+{deal.parties.length - 4}</span>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

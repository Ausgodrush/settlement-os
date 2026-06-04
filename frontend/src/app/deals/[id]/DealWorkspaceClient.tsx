'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import DealTimeline from '@/components/deals/DealTimeline';
import ConditionList from '@/components/deals/ConditionList';
import ActivityFeed from '@/components/deals/ActivityFeed';
import SettlementPanel from '@/components/deals/SettlementPanel';
import MessagesTab from '@/components/deals/MessagesTab';
import { useDeal } from '@/hooks/useDeals';
import { useDealSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/hooks/useAuth';
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS, ROLE_LABELS } from '@/types';

const ROLE_COLORS: Record<string, string> = {
  BUYER: 'bg-blue-100 text-blue-600',
  SELLER: 'bg-rose-100 text-rose-600',
  BUYER_CONVEYANCER: 'bg-indigo-100 text-indigo-600',
  SELLER_CONVEYANCER: 'bg-amber-100 text-amber-600',
  AGENT: 'bg-green-100 text-green-600',
  ADMIN: 'bg-purple-100 text-purple-600',
};

export default function DealWorkspaceClient() {
  const { id } = useParams<{ id: string }>();
  const { deal, loading, error, refetch, updateLocal } = useDeal(id);
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'messages'>('overview');

  useDealSocket(id, {
    'deal:updated': (data) => {
      updateLocal((d) => ({ ...d, status: data.status }));
    },
    'condition:updated': () => { refetch(); },
    'document:uploaded': () => { refetch(); },
    'document:verified': () => { refetch(); },
    'settlement:status': (data) => {
      if (data.executionStatus === 'COMPLETED') refetch();
    },
  });

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64" />
            <div className="h-4 bg-gray-100 rounded w-48" />
            <div className="grid grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">{error || 'Deal not found'}</p>
            <button onClick={() => router.push('/deals')} className="btn-secondary mt-4">
              Back to Deals
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => router.push('/deals')}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ← Deals
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-sm text-gray-500">{deal.referenceNo}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{deal.propertyAddress}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {deal.propertySuburb} {deal.propertyState} {deal.propertyPostcode}
              {deal.titleReference && <span className="ml-2 text-gray-400">· CT {deal.titleReference}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {deal.settlementDate && deal.status !== 'SETTLED' && (
              <div className={`text-sm px-3 py-1.5 rounded-lg ${
                deal.daysToSettlement != null && deal.daysToSettlement <= 7
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {deal.daysToSettlement != null && deal.daysToSettlement >= 0
                  ? `${deal.daysToSettlement} days to settle`
                  : `Settlement ${new Date(deal.settlementDate).toLocaleDateString('en-AU')}`}
              </div>
            )}
            <span className={`badge text-sm px-3 py-1.5 ${DEAL_STATUS_COLORS[deal.status]}`}>
              {DEAL_STATUS_LABELS[deal.status]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-xs text-gray-400 mb-1">Purchase Price</p>
            <p className="text-xl font-bold text-gray-900">
              ${deal.purchasePrice?.toLocaleString('en-AU')}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-400 mb-1">Deposit</p>
            <p className="text-xl font-bold text-gray-900">
              {deal.depositAmount ? `$${deal.depositAmount.toLocaleString('en-AU')}` : '—'}
            </p>
            {deal.depositPaid && (
              <span className="text-xs text-green-600 font-medium">✓ Paid</span>
            )}
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-400 mb-1">Settlement Date</p>
            <p className="text-xl font-bold text-gray-900">
              {deal.settlementDate
                ? new Date(deal.settlementDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>

        {deal.parties && deal.parties.length > 0 && (
          <div className="card p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Parties</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {deal.parties.map((party) => (
                <div key={party.id} className="text-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-semibold text-indigo-600">
                      {party.user.name?.charAt(0)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-900 truncate">{party.user.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {ROLE_LABELS[party.role as keyof typeof ROLE_LABELS] || party.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {(['overview', 'messages'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'text-indigo-600 border-indigo-500'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab === 'overview' ? 'Overview' : (
                <span className="flex items-center gap-1.5">
                  Messages
                  {deal.parties && (
                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">
                      {deal.parties.filter((p) => p.user?.name !== `${user?.firstName} ${user?.lastName}`).length}
                    </span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {deal.milestones && deal.milestones.length > 0 && (
                <DealTimeline milestones={deal.milestones} />
              )}
              {deal.conditions && (
                <ConditionList
                  dealId={deal.id}
                  conditions={deal.conditions}
                  onUpdate={refetch}
                  currentUserRole={user?.role}
                />
              )}
            </div>
            <div className="space-y-6">
              <SettlementPanel
                deal={deal}
                currentUserRole={user?.role}
                onStatusChange={refetch}
              />
              {deal.recentActivity !== undefined && (
                <ActivityFeed
                  dealId={deal.id}
                  activities={deal.recentActivity || []}
                  onNewActivity={refetch}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && deal.parties && (
          <div className="card p-5">
            <MessagesTab
              dealId={deal.id}
              parties={deal.parties.map((p) => ({
                id: p.id,
                name: p.user?.name ?? p.id,
                role: ROLE_LABELS[p.role as keyof typeof ROLE_LABELS] ?? p.role,
                initials: (p.user?.name ?? '?').split(' ').map((w: string) => w[0]).join('').slice(0, 2),
                color: ROLE_COLORS[p.role] ?? 'bg-gray-100 text-gray-600',
              }))}
              currentUserName={user ? `${user.firstName} ${user.lastName}` : ''}
              currentUserRole={user?.role ?? ''}
            />
          </div>
        )}
      </main>
    </div>
  );
}

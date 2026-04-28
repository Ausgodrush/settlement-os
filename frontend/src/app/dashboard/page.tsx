'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useDeals } from '@/hooks/useDeals';
import Sidebar from '@/components/layout/Sidebar';
import DealCard from '@/components/deals/DealCard';
import { ROLE_LABELS } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading } = useDeals();

  const deals = data?.data || [];
  const activeDeals = deals.filter((d) => d.status === 'ACTIVE');
  const readyDeals = deals.filter((d) => d.status === 'READY');
  const settledDeals = deals.filter((d) => d.status === 'SETTLED');
  const urgentDeals = deals.filter(
    (d) => d.daysToSettlement !== null && d.daysToSettlement !== undefined && d.daysToSettlement <= 7 && d.status !== 'SETTLED',
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Good {getGreeting()}, {user?.firstName}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {user ? ROLE_LABELS[user.role] : ''} · {new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link href="/deals/new" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Deal
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Active Deals" value={activeDeals.length} color="blue" />
          <StatCard label="Ready to Settle" value={readyDeals.length} color="amber" />
          <StatCard label="Settled (All Time)" value={settledDeals.length} color="green" />
          <StatCard label="Due This Week" value={urgentDeals.length} color="red" />
        </div>

        {/* Urgent Deals */}
        {urgentDeals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Settlement Due Within 7 Days
            </h2>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {urgentDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Deals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {readyDeals.length > 0 ? 'Ready to Settle' : 'Active Deals'}
            </h2>
            <Link href="/deals" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-500 text-sm">No deals yet.</p>
              <Link href="/deals/new" className="btn-primary mt-4 inline-flex">
                Create your first deal
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {(readyDeals.length > 0 ? readyDeals : activeDeals).slice(0, 6).map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <div className={`card p-5 border ${colors[color as keyof typeof colors]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-75">{label}</p>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MessagesTab from '@/components/deals/MessagesTab';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getPools, getPlatformFees, savePools, resetPools } from '@/lib/investStore';
import { MOCK_POOLS, InvestPool, OWNER_WALLETS, CRYPTO_PRICES, CRYPTO_SYMBOLS, CryptoSymbol } from '@/lib/investData';

const ADMIN_DEALS = [
  {
    id: 'd1',
    referenceNo: 'PSOS-2024-0042',
    address: '14 Glenelg Street, Norwood SA 5067',
    status: 'ACTIVE',
    parties: [
      { id:'p1', name:'Jane Cooper',    role:"Buyer's Conveyancer", initials:'JC', color:'bg-indigo-100 text-indigo-600' },
      { id:'p2', name:'Michael Torres', role:'Buyer',                initials:'MT', color:'bg-blue-100 text-blue-600' },
      { id:'p3', name:'Sarah Chen',     role:'Seller',               initials:'SC', color:'bg-rose-100 text-rose-600' },
      { id:'p4', name:'David Walsh',    role:"Seller's Conveyancer", initials:'DW', color:'bg-amber-100 text-amber-600' },
      { id:'p5', name:'Emma Wilson',    role:'Agent',                initials:'EW', color:'bg-green-100 text-green-600' },
    ],
  },
  {
    id: 'd2',
    referenceNo: 'PSOS-2024-0039',
    address: '7 Jetty Road, Glenelg SA 5045',
    status: 'READY',
    parties: [
      { id:'p6', name:'Lisa Park',    role:"Buyer's Conveyancer", initials:'LP', color:'bg-indigo-100 text-indigo-600' },
      { id:'p7', name:'Tom Nguyen',   role:'Buyer',               initials:'TN', color:'bg-blue-100 text-blue-600' },
      { id:'p8', name:'Ray Santos',   role:'Seller',              initials:'RS', color:'bg-rose-100 text-rose-600' },
    ],
  },
  {
    id: 'd3',
    referenceNo: 'PSOS-2024-0051',
    address: 'Villa Karang Sunset, Seminyak, Bali',
    status: 'ACTIVE',
    parties: [
      { id:'p9',  name:'Chris Blake',  role:'Buyer',               initials:'CB', color:'bg-blue-100 text-blue-600' },
      { id:'p10', name:'Wayan Sukerta', role:'Seller',              initials:'WS', color:'bg-rose-100 text-rose-600' },
      { id:'p11', name:'Ni Luh Ayu',   role:"Seller's Conveyancer", initials:'NA', color:'bg-amber-100 text-amber-600' },
    ],
  },
];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pools, setPools] = useState<InvestPool[]>([]);
  const [fees, setFees] = useState(0);
  const [resetDone, setResetDone] = useState(false);
  const [messagingDealId, setMessagingDealId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (user === null) { router.replace('/login'); return; }
    if (user.role !== 'ADMIN') { router.replace('/dashboard'); return; }
  }, [loading, user, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPools(getPools());
      setFees(getPlatformFees());
    }
  }, []);

  if (loading || !user || user.role !== 'ADMIN') return null;

  const openPools = pools.filter((p) => p.status === 'OPEN');
  const fundedPools = pools.filter((p) => p.status === 'FUNDED');
  const totalTarget = pools.reduce((s, p) => s + p.targetRaise, 0);
  const totalRaised = pools.reduce((s, p) => s + p.amountRaised, 0);

  function handleReset() {
    resetPools();
    setPools(MOCK_POOLS);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  }

  function handleClosePool(poolId: string) {
    const updated = pools.map((p) =>
      p.id === poolId ? { ...p, status: 'CLOSED' as const } : p,
    );
    savePools(updated);
    setPools(updated);
  }

  function handleReopenPool(poolId: string) {
    const updated = pools.map((p) =>
      p.id === poolId ? { ...p, status: 'OPEN' as const } : p,
    );
    savePools(updated);
    setPools(updated);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform management · Admin only</p>
        </div>

        {resetDone && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            ✓ Pool data reset to defaults
          </div>
        )}

        {/* Revenue overview */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Platform Revenue</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-2xl font-bold text-green-600">${fees.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-0.5">Total fees collected</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-2xl font-bold text-indigo-600">{openPools.length}</p>
              <p className="text-sm text-gray-500 mt-0.5">Open pools</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-2xl font-bold text-gray-800">${(totalRaised / 1_000_000).toFixed(2)}M</p>
              <p className="text-sm text-gray-500 mt-0.5">Capital raised</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-2xl font-bold text-amber-600">{fundedPools.length}</p>
              <p className="text-sm text-gray-500 mt-0.5">Funded pools</p>
            </div>
          </div>
        </section>

        {/* Owner wallets */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Trust Wallet Addresses</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AUD Trust Account</p>
                <p className="font-mono text-sm text-gray-900 mt-0.5">{OWNER_WALLETS.AUD}</p>
              </div>
              <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">Primary</span>
            </div>
            {(['BTC', 'ETH', 'SOL'] as CryptoSymbol[]).map((c) => (
              <div key={c} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {CRYPTO_SYMBOLS[c]} {c} Wallet
                    <span className="ml-2 text-gray-400 font-normal normal-case">
                      ${CRYPTO_PRICES[c].toLocaleString()} AUD/{c}
                    </span>
                  </p>
                  <p className="font-mono text-sm text-gray-900 mt-0.5 break-all">{OWNER_WALLETS[c]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pool management */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Investment Pool Management</h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {pools.map((pool) => {
              const pct = Math.min(Math.round((pool.amountRaised / pool.targetRaise) * 100), 100);
              return (
                <div key={pool.id} className="p-4 flex items-center gap-4">
                  <span className="text-xl flex-shrink-0">{pool.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{pool.name}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${
                        pool.status === 'OPEN'
                          ? 'bg-green-100 text-green-700'
                          : pool.status === 'FUNDED'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {pool.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-400">{pool.location}</p>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-24">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-gray-500">{pct}% · {pool.investorCount} investors</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-800">
                      ${(pool.amountRaised / 1000).toFixed(0)}k / ${(pool.targetRaise / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-indigo-600">{pool.expectedYield}% yield</p>
                  </div>
                  <div className="flex-shrink-0">
                    {pool.status === 'OPEN' || pool.status === 'FUNDED' ? (
                      <button
                        onClick={() => handleClosePool(pool.id)}
                        className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReopenPool(pool.id)}
                        className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Active Deals — Admin Messaging */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active Deals</h2>
              <p className="text-xs text-gray-400 mt-0.5">Open a deal to message its parties directly</p>
            </div>
          </div>

          <div className="space-y-3">
            {ADMIN_DEALS.map((deal) => {
              const isOpen = messagingDealId === deal.id;
              const statusColor = deal.status === 'ACTIVE'
                ? 'bg-green-100 text-green-700'
                : deal.status === 'READY'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-500';
              return (
                <div key={deal.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{deal.address}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${statusColor}`}>
                          {deal.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          {deal.parties.slice(0, 5).map((p) => (
                            <div key={p.id} className={`w-6 h-6 rounded-full ${p.color} flex items-center justify-center border-2 border-white flex-shrink-0`}>
                              <span className="text-[8px] font-bold">{p.initials}</span>
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">{deal.parties.length} parties · {deal.referenceNo}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setMessagingDealId(isOpen ? null : deal.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex-shrink-0 ${
                        isOpen
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'border border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      {isOpen ? 'Close' : 'Message Parties'}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="border-t border-gray-100 p-5">
                      <MessagesTab
                        dealId={deal.id}
                        parties={deal.parties}
                        currentUserName="Admin User"
                        currentUserRole="ADMIN"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <p className="text-center text-xs text-gray-400">
          Demo environment · Data resets on restart
        </p>
      </main>
    </div>
  );
}

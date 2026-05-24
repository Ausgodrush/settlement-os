'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getPools, getPlatformFees, savePools, resetPools } from '@/lib/investStore';
import { MOCK_POOLS, InvestPool, OWNER_WALLETS, CRYPTO_PRICES, CRYPTO_SYMBOLS, CryptoSymbol } from '@/lib/investData';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pools, setPools] = useState<InvestPool[]>([]);
  const [fees, setFees] = useState(0);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    if (user === null) { router.replace('/login'); return; }
    if (user && user.role !== 'ADMIN') { router.replace('/dashboard'); return; }
  }, [user, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPools(getPools());
      setFees(getPlatformFees());
    }
  }, []);

  if (!user || user.role !== 'ADMIN') return null;

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
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              Reset all pools
            </button>
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

        <p className="text-center text-xs text-gray-400">
          Demo environment · Data resets on restart
        </p>
      </main>
    </div>
  );
}

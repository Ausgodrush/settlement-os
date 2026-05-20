'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, saveAuth } from '@/lib/auth';
import { auth as authApi } from '@/lib/api';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const MOCK_DEALS = [
  {
    id: 'demo-001',
    referenceNo: 'DEMO-001',
    propertyAddress: '42 Prospect Street',
    suburb: 'Prospect SA 5082',
    purchasePrice: 750000,
    status: 'ACTIVE' as const,
    statusLabel: 'Active',
    statusColor: 'bg-blue-100 text-blue-700',
    settlementDate: '10 Jun 2026',
    daysToSettle: 20,
    conditionsMet: 3,
    conditionsTotal: 4,
    titleRef: 'CT 5432/876',
    deposit: '$75,000',
    depositPaid: true,
    parties: ['S', 'M', 'C', 'D'],
  },
  {
    id: 'demo-002',
    referenceNo: 'DEMO-002',
    propertyAddress: '15 King William Road',
    suburb: 'Unley SA 5061',
    purchasePrice: 1200000,
    status: 'ACTIVE' as const,
    statusLabel: 'Active',
    statusColor: 'bg-blue-100 text-blue-700',
    settlementDate: '18 Jul 2026',
    daysToSettle: 58,
    conditionsMet: 0,
    conditionsTotal: 3,
    titleRef: 'CT 6701/234',
    deposit: '$120,000',
    depositPaid: false,
    parties: ['M', 'C'],
  },
  {
    id: 'demo-003',
    referenceNo: 'DEMO-003',
    propertyAddress: '8 Greenhill Road',
    suburb: 'Tusmore SA 5065',
    purchasePrice: 980000,
    status: 'SETTLED' as const,
    statusLabel: 'Settled',
    statusColor: 'bg-green-100 text-green-700',
    settlementDate: '25 Apr 2026',
    daysToSettle: -26,
    conditionsMet: 0,
    conditionsTotal: 0,
    titleRef: 'CT 4219/551',
    deposit: '$98,000',
    depositPaid: true,
    parties: ['M', 'C'],
  },
];

export default function Home() {
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (user) router.replace('/dashboard');
  }, [router]);

  async function enterApp() {
    setSigningIn(true);
    try {
      if (IS_DEMO) {
        const res = await authApi.login('admin@demo.com', 'demo1234');
        saveAuth(res);
      }
      router.push('/dashboard');
    } catch {
      router.push('/login');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className="font-bold text-gray-900">Settlement OS</span>
        </div>
        <button
          onClick={enterApp}
          disabled={signingIn}
          className="btn-primary text-sm"
        >
          {signingIn ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Sign in →'
          )}
        </button>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-10 text-center">
        <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          South Australian Property Settlement Platform
        </span>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Property Settlements,<br />Coordinated.
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          Track conditions, manage documents, and coordinate all parties through to settlement day — in one place.
        </p>
        <button
          onClick={enterApp}
          disabled={signingIn}
          className="btn-primary text-base px-6 py-3"
        >
          {signingIn ? 'Opening...' : 'View live dashboard →'}
        </button>
      </div>

      {/* Live listings */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Active settlements
          </h2>
          <span className="text-xs text-gray-400">{MOCK_DEALS.length} properties</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_DEALS.map((deal) => (
            <button
              key={deal.id}
              onClick={enterApp}
              disabled={signingIn}
              className="card p-5 text-left hover:shadow-md transition-all group cursor-pointer w-full"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {deal.propertyAddress}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{deal.suburb} · {deal.titleRef}</p>
                </div>
                <span className={`badge ml-3 flex-shrink-0 text-xs px-2 py-0.5 ${deal.statusColor}`}>
                  {deal.statusLabel}
                </span>
              </div>

              {/* Price & Settlement */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span className="font-medium">${deal.purchasePrice.toLocaleString('en-AU')}</span>
                {deal.status === 'SETTLED' ? (
                  <span className="text-green-600 font-medium text-xs">✓ Settled {deal.settlementDate}</span>
                ) : (
                  <span className={`text-xs flex items-center gap-1 ${deal.daysToSettle <= 14 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    {deal.daysToSettle <= 14 && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                    {deal.daysToSettle}d to settle · {deal.settlementDate}
                  </span>
                )}
              </div>

              {/* Deposit */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-400">Deposit {deal.deposit}</span>
                {deal.depositPaid && (
                  <span className="text-xs text-green-600 font-medium">✓ Paid</span>
                )}
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

              {/* Party avatars */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-1">
                  {deal.parties.map((initial, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
                      <span className="text-[9px] font-semibold text-indigo-600">{initial}</span>
                    </div>
                  ))}
                </div>
                <span className="text-xs text-indigo-500 group-hover:text-indigo-700 font-medium">
                  Open →
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Demo environment — sign in to create, manage and track your own settlement deals
        </p>
      </div>
    </div>
  );
}

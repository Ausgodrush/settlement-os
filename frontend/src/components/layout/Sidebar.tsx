'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole, ROLE_LABELS } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useDeals } from '@/hooks/useDeals';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
  },
  {
    label: 'Deals',
    href: '/deals',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  {
    label: 'Pipeline',
    href: '/conveyancer',
    roles: ['BUYER_CONVEYANCER', 'SELLER_CONVEYANCER', 'ADMIN'] as UserRole[],
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: dealsData, loading: dealsLoading } = useDeals();

  const visibleItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  const activeDeals = (dealsData?.data || []).filter(
    (d) => d.status === 'ACTIVE' || d.status === 'READY',
  );

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Settlement OS</p>
            <p className="text-xs text-gray-400">South Australia</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="p-4 space-y-1">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {item.icon}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* My Deals — visible for all logged-in users */}
      {user && (
        <div className="flex-1 px-4 pb-4 overflow-y-auto border-t border-gray-100">
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">My Deals</p>
              <Link href="/deals" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                All →
              </Link>
            </div>

            {dealsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse px-2 py-2 rounded-lg">
                    <div className="h-3 bg-gray-100 rounded w-4/5 mb-1.5" />
                    <div className="h-2 bg-gray-50 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : activeDeals.length === 0 ? (
              <Link
                href="/deals/new"
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create new deal
              </Link>
            ) : (
              <div className="space-y-0.5">
                {activeDeals.slice(0, 6).map((deal) => {
                  const isCurrent = pathname === `/deals/${deal.id}`;
                  const urgent = deal.daysToSettlement != null && deal.daysToSettlement <= 7;
                  return (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className={`block px-2 py-2 rounded-lg transition-colors group ${
                        isCurrent ? 'bg-indigo-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs font-medium truncate leading-tight ${
                          isCurrent ? 'text-indigo-700' : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {deal.propertyAddress}
                        </p>
                        {urgent && (
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0 mt-1 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          deal.status === 'READY' ? 'bg-amber-400' : 'bg-blue-400'
                        }`} />
                        {deal.status === 'READY' ? 'Ready to settle' : 'Active'}
                        {deal.daysToSettlement != null && deal.daysToSettlement >= 0
                          ? ` · ${deal.daysToSettlement}d`
                          : ''}
                      </p>
                    </Link>
                  );
                })}
                {dealsData && dealsData.total > 6 && (
                  <Link
                    href="/deals"
                    className="block px-2 py-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    +{dealsData.total - 6} more
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User footer */}
      {user && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-indigo-600">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}

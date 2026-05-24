'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole, ROLE_LABELS } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useDeals } from '@/hooks/useDeals';

interface NavChild {
  label: string;
  href: string;
  requiresAuth?: boolean;
  roles?: UserRole[];
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  requiresAuth?: boolean;
  roles?: UserRole[];
  icon: React.ReactNode;
  children: NavChild[];
}

interface SingleItem {
  label: string;
  href: string;
  requiresAuth?: boolean;
  icon: React.ReactNode;
}

function Icon({ path }: { path: React.ReactNode }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {path}
    </svg>
  );
}

const SINGLE_ITEMS: SingleItem[] = [
  {
    label: 'Home',
    href: '/',
    requiresAuth: false,
    icon: <Icon path={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />} />,
  },
];

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Properties',
    icon: <Icon path={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />} />,
    children: [
      {
        label: 'Listings',
        href: '/listings',
        icon: <Icon path={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />} />,
      },
      {
        label: 'Investment Pools',
        href: '/invest',
        icon: <Icon path={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />} />,
      },
    ],
  },
  {
    label: 'My Account',
    requiresAuth: true,
    icon: <Icon path={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />} />,
    children: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        requiresAuth: true,
        icon: <Icon path={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />} />,
      },
      {
        label: 'Deals',
        href: '/deals',
        requiresAuth: true,
        icon: <Icon path={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />} />,
      },
      {
        label: 'Portfolio',
        href: '/portfolio',
        requiresAuth: true,
        icon: <Icon path={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />} />,
      },
    ],
  },
  {
    label: 'Professionals',
    requiresAuth: true,
    roles: ['BUYER_CONVEYANCER', 'SELLER_CONVEYANCER', 'ADMIN'] as UserRole[],
    icon: <Icon path={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />} />,
    children: [
      {
        label: 'Pipeline',
        href: '/conveyancer',
        requiresAuth: true,
        roles: ['BUYER_CONVEYANCER', 'SELLER_CONVEYANCER', 'ADMIN'] as UserRole[],
        icon: <Icon path={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />} />,
      },
      {
        label: 'Admin Panel',
        href: '/admin',
        requiresAuth: true,
        roles: ['ADMIN'] as UserRole[],
        icon: <Icon path={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />} />,
      },
    ],
  },
];

function isChildVisible(child: NavChild, user: ReturnType<typeof useAuth>['user']): boolean {
  if (child.requiresAuth && !user) return false;
  if (child.roles && (!user || !child.roles.includes(user.role))) return false;
  return true;
}

function isGroupVisible(group: NavGroup, user: ReturnType<typeof useAuth>['user']): boolean {
  if (group.requiresAuth && !user) return false;
  if (group.roles && (!user || !group.roles.includes(user.role))) return false;
  return group.children.some((c) => isChildVisible(c, user));
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: dealsData, loading: dealsLoading } = useDeals();

  const isOnPath = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  const defaultOpen = NAV_GROUPS.reduce<Record<string, boolean>>((acc, g) => {
    const hasActive = g.children.some((c) => isOnPath(c.href));
    acc[g.label] = hasActive;
    return acc;
  }, {});

  const [open, setOpen] = useState<Record<string, boolean>>(defaultOpen);

  function toggle(label: string) {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  const activeDeals = (dealsData?.data || []).filter(
    (d) => d.status === 'ACTIVE' || d.status === 'READY',
  );

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Settlement OS</p>
            <p className="text-xs text-gray-400">Settlement Platform</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="p-4 space-y-0.5 border-b border-gray-100">
        {/* Single items (Home) */}
        {SINGLE_ITEMS.map((item) => {
          if (item.requiresAuth && !user) return null;
          const active = isOnPath(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        {/* Grouped dropdown items */}
        {NAV_GROUPS.map((group) => {
          if (!isGroupVisible(group, user)) return null;
          const visibleChildren = group.children.filter((c) => isChildVisible(c, user));
          const groupHasActive = visibleChildren.some((c) => isOnPath(c.href));
          const isOpen = open[group.label] ?? groupHasActive;

          return (
            <div key={group.label}>
              {/* Group header — clickable toggle */}
              <button
                onClick={() => toggle(group.label)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  groupHasActive && !isOpen
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {group.icon}
                <span className="flex-1 text-left">{group.label}</span>
                <svg
                  className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Sub-items */}
              {isOpen && (
                <div className="mt-0.5 ml-3 pl-3 border-l border-gray-200 space-y-0.5">
                  {visibleChildren.map((child) => {
                    const active = isOnPath(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          active
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {child.icon}
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* My Deals — logged-in users only */}
      {user && (
        <div className="flex-1 px-4 pb-4 overflow-y-auto">
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
                Create new listing
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

      {/* User footer (logged in) */}
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

      {/* Sign in footer (logged out) */}
      {!user && (
        <div className="p-4 border-t border-gray-100 mt-auto">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign in
          </Link>
        </div>
      )}
    </aside>
  );
}

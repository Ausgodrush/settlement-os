'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole, ROLE_LABELS } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  {
    label: 'Home',
    href: '/',
    requiresAuth: false,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    requiresAuth: true,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
  },
  {
    label: 'Listings',
    href: '/listings',
    requiresAuth: false,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    ),
  },
  {
    label: 'Invest',
    href: '/invest',
    requiresAuth: false,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    ),
  },
  {
    label: 'Deals',
    href: '/deals',
    requiresAuth: true,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  {
    label: 'Portfolio',
    href: '/portfolio',
    requiresAuth: true,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    ),
  },
  {
    label: 'Pipeline',
    href: '/conveyancer',
    requiresAuth: true,
    roles: ['BUYER_CONVEYANCER', 'SELLER_CONVEYANCER', 'ADMIN'] as UserRole[],
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    ),
  },
  {
    label: 'Admin',
    href: '/admin',
    requiresAuth: true,
    roles: ['ADMIN'] as UserRole[],
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(true);

  const visibleItems = navItems.filter((item) => {
    if (item.requiresAuth && !user) return false;
    if (item.roles && (!user || !item.roles.includes(user.role))) return false;
    return true;
  });

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo title IS the burger toggle */}
      <button
        aria-expanded={navOpen}
        aria-controls="main-nav"
        data-testid="burger-menu"
        onClick={() => setNavOpen((v) => !v)}
        className="w-full px-4 py-4 border-b border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors group text-left flex-shrink-0"
      >
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">Settlement OS</p>
          <p className="text-xs text-gray-400 truncate">Settlement Platform</p>
        </div>
        <div className="w-4 h-4 flex-shrink-0 relative">
          <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${navOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 18 14">
              <rect y="0" width="18" height="2" rx="1"/>
              <rect y="6" width="18" height="2" rx="1"/>
              <rect y="12" width="18" height="2" rx="1"/>
            </svg>
          </span>
          <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${navOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </span>
        </div>
      </button>

      {/* Inline nav — always in document flow, no overlay */}
      {navOpen && (
        <nav id="main-nav" className="border-b border-gray-100 flex-shrink-0">
          <div className="p-2">
            {visibleItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
          </div>
        </nav>
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

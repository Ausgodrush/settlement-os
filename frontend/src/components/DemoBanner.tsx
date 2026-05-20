'use client';
import { useState } from 'react';

const DEMO_CREDENTIALS = [
  { role: 'Admin', email: 'admin@demo.com', password: 'demo1234' },
  { role: 'Buyer Conveyancer', email: 'buyer-conv@demo.com', password: 'demo1234' },
  { role: 'Seller Conveyancer', email: 'seller-conv@demo.com', password: 'demo1234' },
  { role: 'Buyer', email: 'buyer@demo.com', password: 'demo1234' },
  { role: 'Seller', email: 'seller@demo.com', password: 'demo1234' },
];

export function DemoBanner() {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState('');

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  }

  return (
    <div className="w-full bg-amber-500 text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-700 text-xs font-bold tracking-wide">
            DEMO
          </span>
          <span>Demo mode — no real data, no credentials required.</span>
          <a
            href="mailto:wewhothem@gmail.com?subject=Settlement OS — Go Live"
            className="underline underline-offset-2 hover:text-amber-100 whitespace-nowrap"
          >
            Contact us to go live
          </a>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 flex items-center gap-1 bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded text-xs font-medium transition-colors"
        >
          Demo logins
          <svg
            className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-amber-400 bg-amber-600">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <p className="text-xs text-amber-100 mb-2">All accounts use password: <strong>demo1234</strong></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <div key={cred.role} className="bg-amber-700 rounded p-2 text-xs">
                  <div className="font-semibold text-amber-100 mb-1">{cred.role}</div>
                  <button
                    onClick={() => copy(cred.email, cred.role + '-email')}
                    className="flex items-center gap-1 text-white hover:text-amber-200 w-full text-left truncate"
                    title="Click to copy email"
                  >
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copied === cred.role + '-email' ? 'Copied!' : cred.email}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

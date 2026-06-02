'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_LISTINGS } from '@/lib/mockListings';

export default function ListingDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const listing = MOCK_LISTINGS.find((l) => l.id === id);
  const [imgIdx, setImgIdx] = useState(0);
  const [enquirySent, setEnquirySent] = useState(false);

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Listing not found.</p>
          <Link href="/listings" className="text-indigo-600 hover:underline text-sm">← Back to listings</Link>
        </div>
      </div>
    );
  }

  const total = listing.images.length;
  const condPct = listing.conditionsTotal > 0
    ? Math.round((listing.conditionsMet / listing.conditionsTotal) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white">

      {/* Sticky top bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to listings
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-gray-900 text-sm truncate">{listing.propertyAddress}</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500 flex-shrink-0">${listing.purchasePrice.toLocaleString('en-AU')} {listing.currency}</span>
          </div>
          <Link href="/login" className="flex-shrink-0 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            Sign in →
          </Link>
        </div>
      </header>

      {/* Hero gallery */}
      <div className="relative bg-gray-900" style={{ height: 480 }}>
        <img src={listing.images[imgIdx]} alt={listing.propertyAddress} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {total > 1 && (
          <>
            <button onClick={() => setImgIdx((i) => (i - 1 + total) % total)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors">
              <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button onClick={() => setImgIdx((i) => (i + 1) % total)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors">
              <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </>
        )}

        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-xs font-medium rounded-full">
          {imgIdx + 1} / {total}
        </div>

        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {listing.images.map((src, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${i === imgIdx ? 'border-white shadow-lg scale-105' : 'border-white/40 hover:border-white/80'}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">

            <div>
              <p className="text-sm text-gray-400 mb-1">{listing.suburb}</p>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{listing.propertyAddress}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-bold text-indigo-600">
                  ${listing.purchasePrice.toLocaleString('en-AU')}
                  <span className="text-lg font-medium text-gray-400 ml-1">{listing.currency}</span>
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${listing.statusColor}`}>
                  {listing.statusLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 py-4 border-t border-b border-gray-100 flex-wrap">
              {[
                { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Bed', value: listing.beds },
                { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Bath', value: listing.baths },
                { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', label: 'Car', value: listing.parking },
                { icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4', label: 'Land', value: listing.landSize },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                  <span className="font-bold text-gray-900">{value}</span>
                  <span className="text-sm text-gray-400">{label}</span>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">About this property</h2>
              <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                {listing.description.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Property highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {listing.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Property details</h2>
              <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
                {([
                  ['Property type', listing.type],
                  ['Land size', listing.landSize],
                  ['Title reference', listing.titleRef],
                  ['Location', listing.suburb],
                  ...(listing.country === 'ID' ? [['Tenure', listing.notes?.includes('Hak Milik') ? 'Hak Milik (Freehold)' : 'Leasehold']] : []),
                  ['Deposit', listing.deposit],
                  ['Deposit paid', listing.depositPaid ? 'Yes' : 'No'],
                  ['Settlement date', listing.settlementDate],
                  ['Reference', listing.referenceNo],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex items-start px-5 py-3 gap-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 flex-shrink-0 pt-0.5">{label}</span>
                    <span className="text-sm text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right sidebar */}
          <div className="space-y-4 lg:sticky lg:top-20">

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Listed by</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">
                    {listing.agent.name.split(' ').map((w: string) => w[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{listing.agent.name}</p>
                  <p className="text-xs text-gray-400">{listing.agent.role} · {listing.agent.firm}</p>
                </div>
              </div>
              {enquirySent ? (
                <div className="text-center py-3">
                  <svg className="w-7 h-7 text-green-500 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  <p className="text-sm font-semibold text-gray-800">Enquiry sent!</p>
                  <p className="text-xs text-gray-400 mt-0.5">We'll be in touch shortly</p>
                </div>
              ) : (
                <button onClick={() => setEnquirySent(true)}
                  className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors mb-2">
                  Enquire now
                </button>
              )}
              <Link href="/contact"
                className="block w-full py-2.5 text-center border border-gray-300 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                Contact Settlement OS
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Settlement status</p>
              {listing.settled ? (
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-sm font-semibold">Settled {listing.settlementDate}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Conditions met</span>
                    <span className="text-sm font-semibold text-indigo-600">{listing.conditionsMet}/{listing.conditionsTotal}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${condPct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Settlement</span>
                    <span className="font-medium text-gray-600">{listing.settlementDate}</span>
                  </div>
                  {listing.daysToSettle != null && listing.daysToSettle >= 0 && (
                    <div className={`mt-3 text-center py-2 rounded-lg text-xs font-semibold ${listing.daysToSettle <= 14 ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {listing.daysToSettle} days to settlement
                    </div>
                  )}
                </>
              )}
            </div>

            {listing.poolId && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">Investment available</p>
                <p className="text-sm text-indigo-800 font-medium mb-3">Fractional investment open for this property.</p>
                <Link href="/invest"
                  className="block w-full py-2.5 text-center bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                  View investment pool →
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 bg-gray-50 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>&copy; {new Date().getFullYear()} BALIPROP LLC · Settlement OS</span>
          <div className="flex gap-4">
            <Link href="/listings" className="hover:text-gray-600 transition-colors">All listings</Link>
            <Link href="/contact" className="hover:text-gray-600 transition-colors">Contact</Link>
            <Link href="/invest" className="hover:text-gray-600 transition-colors">Invest</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

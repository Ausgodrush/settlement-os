'use client';
import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { deals as dealsApi } from '@/lib/api';

export default function NewDealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saleType, setSaleType] = useState<'deal' | 'invest' | 'both'>('deal');
  const [pool, setPool] = useState({
    poolName: '',
    targetRaise: '',
    minInvestment: '5000',
    expectedYield: '',
    term: '5',
    payoutFrequency: 'Quarterly',
  });

  function setPoolField(field: string, value: string) {
    setPool((prev) => ({ ...prev, [field]: value }));
  }
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhotoFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (photos.length >= 10) return;
      const url = URL.createObjectURL(file);
      setPhotos((prev) => prev.length < 10 ? [...prev, url] : prev);
    });
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }
  const [form, setForm] = useState({
    propertyAddress: '',
    propertySuburb: '',
    propertyState: 'SA',
    propertyPostcode: '',
    titleReference: '',
    purchasePrice: '',
    depositAmount: '',
    contractDate: '',
    settlementDate: '',
    notes: '',
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const deal = await dealsApi.create({
        ...form,
        purchasePrice: parseFloat(form.purchasePrice),
        depositAmount: form.depositAmount ? parseFloat(form.depositAmount) : undefined,
        contractDate: form.contractDate || undefined,
        settlementDate: form.settlementDate || undefined,
        titleReference: form.titleReference || undefined,
        notes: form.notes || undefined,
      });
      router.push(`/deals/${deal.id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to create deal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
              ←
            </button>
            <h1 className="text-2xl font-bold text-gray-900">New Listing</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Details */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Property Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Street Address *</label>
                  <input
                    className="input"
                    value={form.propertyAddress}
                    onChange={(e) => set('propertyAddress', e.target.value)}
                    placeholder="14 Glenelg Street"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="label">Suburb *</label>
                    <input
                      className="input"
                      value={form.propertySuburb}
                      onChange={(e) => set('propertySuburb', e.target.value)}
                      placeholder="Norwood"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Postcode *</label>
                    <input
                      className="input"
                      value={form.propertyPostcode}
                      onChange={(e) => set('propertyPostcode', e.target.value)}
                      placeholder="5067"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Title Reference (CT Volume/Folio)</label>
                  <input
                    className="input"
                    value={form.titleReference}
                    onChange={(e) => set('titleReference', e.target.value)}
                    placeholder="CT 6142/456"
                  />
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Financial Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Purchase Price (AUD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                    <input
                      className="input pl-7"
                      type="number"
                      value={form.purchasePrice}
                      onChange={(e) => set('purchasePrice', e.target.value)}
                      placeholder="850000"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Deposit Amount (AUD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                    <input
                      className="input pl-7"
                      type="number"
                      value={form.depositAmount}
                      onChange={(e) => set('depositAmount', e.target.value)}
                      placeholder="85000"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Key Dates</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Contract Date</label>
                  <input
                    className="input"
                    type="date"
                    value={form.contractDate}
                    onChange={(e) => set('contractDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Settlement Date</label>
                  <input
                    className="input"
                    type="date"
                    value={form.settlementDate}
                    onChange={(e) => set('settlementDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Notes</h2>
              <textarea
                className="input min-h-[80px] resize-y"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Any additional notes about this deal..."
              />
            </div>

            {/* Sale Type */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-1">Listing Type</h2>
              <p className="text-xs text-gray-400 mb-4">How would you like to offer this property?</p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: 'deal',   icon: '📋', label: 'Settlement Deal',  sub: 'Standard conveyancing deal' },
                  { value: 'invest', icon: '📊', label: 'Investment Pool',   sub: 'Raise capital from investors' },
                  { value: 'both',   icon: '✨', label: 'Both',              sub: 'Deal + fractional investment' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSaleType(opt.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${saleType === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                  >
                    <div className="text-xl mb-1">{opt.icon}</div>
                    <p className={`text-sm font-semibold ${saleType === opt.value ? 'text-indigo-700' : 'text-gray-800'}`}>{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Investment Pool Details — shown when invest or both */}
            {(saleType === 'invest' || saleType === 'both') && (
              <div className="card p-6 border-indigo-200 bg-indigo-50">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📊</span>
                  <div>
                    <h2 className="font-semibold text-indigo-800">Investment Pool Details</h2>
                    <p className="text-xs text-indigo-500 mt-0.5">Configure how investors can buy into this property</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Fund / Pool Name</label>
                    <input className="input bg-white" placeholder="e.g. Norwood Residential Fund"
                      value={pool.poolName} onChange={(e) => setPoolField('poolName', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Target Raise (AUD) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                      <input className="input pl-7 bg-white" type="number" min="0" placeholder="500000"
                        value={pool.targetRaise} onChange={(e) => setPoolField('targetRaise', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Minimum Investment (AUD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                      <input className="input pl-7 bg-white" type="number" min="500" placeholder="5000"
                        value={pool.minInvestment} onChange={(e) => setPoolField('minInvestment', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Expected Yield (% p.a.)</label>
                    <div className="relative">
                      <input className="input pr-8 bg-white" type="number" min="0" max="50" step="0.1" placeholder="8.5"
                        value={pool.expectedYield} onChange={(e) => setPoolField('expectedYield', e.target.value)} />
                      <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="label">Investment Term (years)</label>
                    <div className="relative">
                      <input className="input pr-10 bg-white" type="number" min="1" max="30" placeholder="5"
                        value={pool.term} onChange={(e) => setPoolField('term', e.target.value)} />
                      <span className="absolute right-3 top-2 text-gray-400 text-sm">yrs</span>
                    </div>
                  </div>
                  <div>
                    <label className="label">Payout Frequency</label>
                    <select className="input bg-white" value={pool.payoutFrequency}
                      onChange={(e) => setPoolField('payoutFrequency', e.target.value)}>
                      {['Monthly', 'Quarterly', 'Half-Yearly', 'Annually'].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live preview */}
                {pool.expectedYield && pool.targetRaise && (
                  <div className="mt-4 p-3 bg-white border border-indigo-200 rounded-xl grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-indigo-600">{pool.expectedYield}%</p>
                      <p className="text-[10px] text-gray-400">Yield p.a.</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-800">{pool.term}yr</p>
                      <p className="text-[10px] text-gray-400">Term</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{pool.payoutFrequency}</p>
                      <p className="text-[10px] text-gray-400">Payout</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Photos */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-1">Photos</h2>
              <p className="text-xs text-gray-400 mb-4">Up to 10 photos — first photo becomes the cover image</p>

              {photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {photos.map((url, i) => (
                    <div key={url} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none"
                        title="Remove"
                      >
                        ×
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 text-[9px] font-semibold bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {photos.length < 10 && (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePhotoFiles(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl py-5 px-4 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                  >
                    <p className="text-sm text-gray-500">📷 Click to add photos</p>
                    <p className="text-xs text-gray-400 mt-0.5">JPEG · PNG · WEBP — select multiple at once</p>
                  </button>
                </>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Create Listing'
                )}
              </button>
              <button type="button" onClick={() => router.back()} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

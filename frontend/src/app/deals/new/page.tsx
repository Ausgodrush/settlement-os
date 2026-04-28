'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { deals as dealsApi } from '@/lib/api';

export default function NewDealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
            <h1 className="text-2xl font-bold text-gray-900">New Deal</h1>
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
                  'Create Deal'
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

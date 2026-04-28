'use client';
import { useState } from 'react';
import { Deal, DealStatus, SettlementValidation, SettlementExecution } from '@/types';
import { settlement as settlementApi } from '@/lib/api';

interface Props {
  deal: Deal;
  currentUserRole?: string;
  onStatusChange?: () => void;
}

export default function SettlementPanel({ deal, currentUserRole, onStatusChange }: Props) {
  const [validation, setValidation] = useState<SettlementValidation | null>(null);
  const [execution, setExecution] = useState<SettlementExecution | null>(null);
  const [loading, setLoading] = useState(false);
  const [pexaWorkspaceId, setPexaWorkspaceId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isConveyancer = currentUserRole?.includes('CONVEYANCER') || currentUserRole === 'ADMIN';
  const isSettled = deal.status === 'SETTLED';
  const isReady = deal.status === 'READY';
  const isActive = deal.status === 'ACTIVE';

  async function validate() {
    setLoading(true);
    setError('');
    try {
      const result = await settlementApi.validate(deal.id);
      setValidation(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function approve() {
    setLoading(true);
    setError('');
    try {
      await settlementApi.approve(deal.id, notes);
      setSuccess('Deal approved for settlement. Status moved to READY.');
      onStatusChange?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function execute() {
    setLoading(true);
    setError('');
    try {
      const result = await settlementApi.execute(deal.id, pexaWorkspaceId || undefined) as any;
      setExecution(result);
      setSuccess('Settlement initiated. PEXA notification sent. Monitor status below.');
      onStatusChange?.();
    } catch (e: any) {
      setError(typeof e.details === 'object' ? JSON.stringify(e.details) : e.message);
    } finally {
      setLoading(false);
    }
  }

  if (isSettled) {
    return (
      <div className="card p-5 bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-800">Settled</p>
            <p className="text-sm text-green-600">
              {deal.actualSettledAt
                ? `Settled on ${new Date(deal.actualSettledAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'Transaction complete'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConveyancer) {
    return (
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-2">Settlement</h3>
        <p className="text-sm text-gray-500">
          Status: <span className="font-medium text-gray-800">{deal.status}</span>
        </p>
        {deal.settlementDate && (
          <p className="text-sm text-gray-500 mt-1">
            Target date:{' '}
            <span className="font-medium text-gray-800">
              {new Date(deal.settlementDate).toLocaleDateString('en-AU', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Settlement Controls</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Validate Step */}
      {isActive && (
        <div className="mb-4">
          <button onClick={validate} disabled={loading} className="btn-secondary w-full justify-center">
            {loading ? '...' : 'Check Settlement Readiness'}
          </button>

          {validation && (
            <div className={`mt-3 p-4 rounded-lg border ${validation.canSettle ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <p className={`text-sm font-semibold ${validation.canSettle ? 'text-green-800' : 'text-amber-800'}`}>
                {validation.canSettle ? '✓ Ready to settle' : '⚠ Not ready to settle'}
              </p>
              {validation.blockers.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {validation.blockers.map((b, i) => (
                    <li key={i} className="text-xs text-amber-700 flex items-start gap-1">
                      <span className="mt-0.5">•</span> {b}
                    </li>
                  ))}
                </ul>
              )}
              {validation.canSettle && (
                <div className="mt-3 space-y-2">
                  <input
                    className="input text-sm"
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <button
                    onClick={approve}
                    disabled={loading}
                    className="btn-primary w-full justify-center"
                  >
                    {loading ? '...' : 'Approve for Settlement (ACTIVE → READY)'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Execute Step */}
      {isReady && (
        <div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-sm text-amber-800">
            <strong>Ready to settle.</strong> This will trigger PEXA and release escrow.
          </div>
          <div className="space-y-2 mb-3">
            <input
              className="input text-sm"
              placeholder="PEXA Workspace ID (optional)"
              value={pexaWorkspaceId}
              onChange={(e) => setPexaWorkspaceId(e.target.value)}
            />
          </div>
          <button
            onClick={execute}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Execute Settlement
              </>
            )}
          </button>
        </div>
      )}

      {execution && (
        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
          <p className="font-semibold">Execution ID: {execution.id}</p>
          <p className="text-xs mt-1 opacity-75">Status: {execution.status}</p>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState } from 'react';
import { Condition, ConditionStatus, CONDITION_STATUS_COLORS } from '@/types';
import { conditions as conditionsApi } from '@/lib/api';

interface Props {
  dealId: string;
  conditions: Condition[];
  onUpdate?: () => void;
  currentUserRole?: string;
}

const STATUS_ICONS: Record<ConditionStatus, string> = {
  MET: '✓',
  PENDING: '○',
  WAIVED: '~',
  FAILED: '✗',
};

const STATUS_BG: Record<ConditionStatus, string> = {
  MET: 'bg-green-50 border-green-200',
  PENDING: 'bg-white border-gray-200',
  WAIVED: 'bg-amber-50 border-amber-200',
  FAILED: 'bg-red-50 border-red-200',
};

export default function ConditionList({ dealId, conditions, onUpdate, currentUserRole }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [waivedReason, setWaivedReason] = useState('');
  const [waivedTarget, setWaivedTarget] = useState<string | null>(null);

  const isConveyancer = currentUserRole?.includes('CONVEYANCER') || currentUserRole === 'ADMIN';

  async function markMet(conditionId: string) {
    setLoading(conditionId);
    try {
      await conditionsApi.update(dealId, conditionId, { status: 'MET' });
      onUpdate?.();
    } finally {
      setLoading(null);
    }
  }

  async function waive(conditionId: string) {
    if (!waivedReason.trim()) return;
    setLoading(conditionId);
    try {
      await conditionsApi.update(dealId, conditionId, { status: 'WAIVED', waivedReason });
      setWaivedTarget(null);
      setWaivedReason('');
      onUpdate?.();
    } finally {
      setLoading(null);
    }
  }

  if (!conditions?.length) {
    return (
      <div className="card p-5 text-center text-sm text-gray-400">
        No conditions configured for this deal.
      </div>
    );
  }

  const met = conditions.filter((c) => c.status === 'MET' || c.status === 'WAIVED').length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Settlement Conditions</h3>
        <span className={`badge ${met === conditions.length ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {met}/{conditions.length} met
        </span>
      </div>

      {/* Settlement gate indicator */}
      {met === conditions.length ? (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4 text-sm text-green-700 font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          All conditions met — deal is ready to settle
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-sm text-amber-700">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {conditions.length - met} condition{conditions.length - met !== 1 ? 's' : ''} pending
        </div>
      )}

      <div className="space-y-2">
        {conditions.map((condition) => (
          <div key={condition.id} className={`border rounded-lg p-4 ${STATUS_BG[condition.status]}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className={`text-sm font-bold mt-0.5 ${CONDITION_STATUS_COLORS[condition.status]}`}>
                  {STATUS_ICONS[condition.status]}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{condition.name}</p>
                  {condition.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{condition.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    {condition.assignedToRole && (
                      <span>→ {formatRole(condition.assignedToRole)}</span>
                    )}
                    {condition.dueDate && condition.status === 'PENDING' && (
                      <span>Due {formatDate(condition.dueDate)}</span>
                    )}
                    {condition.metAt && (
                      <span className="text-green-600">Met {formatDate(condition.metAt)}</span>
                    )}
                    {condition.waivedReason && (
                      <span className="text-amber-600">Waived: {condition.waivedReason}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {condition.status === 'PENDING' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => markMet(condition.id)}
                    disabled={loading === condition.id}
                    className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading === condition.id ? '...' : 'Mark Met'}
                  </button>
                  {isConveyancer && (
                    <button
                      onClick={() => setWaivedTarget(condition.id)}
                      className="text-xs px-3 py-1.5 bg-white text-amber-600 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      Waive
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Waive modal inline */}
            {waivedTarget === condition.id && (
              <div className="mt-3 pt-3 border-t border-amber-200">
                <input
                  className="input text-xs mb-2"
                  placeholder="Reason for waiving this condition..."
                  value={waivedReason}
                  onChange={(e) => setWaivedReason(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => waive(condition.id)}
                    disabled={!waivedReason.trim() || loading === condition.id}
                    className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
                  >
                    Confirm Waive
                  </button>
                  <button
                    onClick={() => { setWaivedTarget(null); setWaivedReason(''); }}
                    className="text-xs px-3 py-1.5 text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

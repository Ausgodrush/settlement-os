'use client';
import { useState } from 'react';
import { Condition, ConditionStatus, ConditionType, CONDITION_STATUS_COLORS } from '@/types';
import { conditions as conditionsApi } from '@/lib/api';

interface Props {
  dealId: string;
  conditions: Condition[];
  onUpdate?: () => void;
  currentUserRole?: string;
}

// Extended local state for intermediate statuses not in the backend enum
type LocalStatus = ConditionStatus | 'AWAITING_APPROVAL';

interface LocalCondition extends Condition {
  localStatus?: LocalStatus;
  submittedBy?: string;
  docName?: string;
  rejectedReason?: string;
  waivedReason?: string;
}

const TYPE_BADGE: Partial<Record<string, string>> = {
  BOOLEAN_FLAG:           'bg-indigo-50 text-indigo-600',
  DOCUMENT_UPLOAD:        'bg-blue-50 text-blue-600',
  APPROVAL:               'bg-purple-50 text-purple-600',
  EXTERNAL_CONFIRMATION:  'bg-gray-100 text-gray-500',
};
const TYPE_LABEL: Partial<Record<string, string>> = {
  BOOLEAN_FLAG: 'Flag', DOCUMENT_UPLOAD: 'Document', APPROVAL: 'Approval', EXTERNAL_CONFIRMATION: 'External',
};

function canActOnCondition(assignedToRole: string | undefined, currentUserRole: string | undefined): boolean {
  if (!currentUserRole) return false;
  if (currentUserRole === 'ADMIN') return true;
  const a = (assignedToRole ?? '').toLowerCase();
  if (!a) return true;
  if (a.includes('buyer') && a.includes('conveyancer')) return currentUserRole === 'BUYER_CONVEYANCER';
  if (a.includes('seller') && a.includes('conveyancer')) return currentUserRole === 'SELLER_CONVEYANCER';
  if (a.includes('buyer'))  return currentUserRole === 'BUYER' || currentUserRole === 'BUYER_CONVEYANCER';
  if (a.includes('seller')) return currentUserRole === 'SELLER' || currentUserRole === 'SELLER_CONVEYANCER';
  if (a.includes('agent'))  return currentUserRole === 'AGENT' || currentUserRole === 'ADMIN';
  return true;
}

export default function ConditionList({ dealId, conditions: rawConditions, onUpdate, currentUserRole }: Props) {
  const [local, setLocal] = useState<Record<string, LocalCondition>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [docInputs, setDocInputs] = useState<Record<string, string>>({});
  const [waiveTarget, setWaiveTarget] = useState<string | null>(null);
  const [waiveReason, setWaiveReason] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const isConveyancer = currentUserRole?.includes('CONVEYANCER') || currentUserRole === 'ADMIN';

  const conditions: LocalCondition[] = rawConditions.map((c) => ({ ...c, ...local[c.id] }));
  const met = conditions.filter((c) => (c.localStatus ?? c.status) === 'MET' || (c.localStatus ?? c.status) === 'WAIVED').length;
  const total = conditions.length;
  const allMet = met === total && total > 0;
  const pct = total ? Math.round(met / total * 100) : 0;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function patchLocal(id: string, patch: Partial<LocalCondition>) {
    setLocal((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } as LocalCondition }));
  }

  async function markMet(conditionId: string) {
    patchLocal(conditionId, { localStatus: 'MET', metAt: new Date().toISOString() });
    notify('✅ Condition marked complete');
    setLoading(conditionId);
    try { await conditionsApi.update(dealId, conditionId, { status: 'MET' }); onUpdate?.(); } catch { /* optimistic */ } finally { setLoading(null); }
    if (met + 1 === total && isConveyancer) notify('🎉 All conditions met! Approve in the Settlement panel.');
  }

  async function requestApproval(conditionId: string, submittedBy: string, docName?: string) {
    patchLocal(conditionId, { localStatus: 'AWAITING_APPROVAL', submittedBy, docName, rejectedReason: undefined });
    notify(docName ? `📎 Document uploaded — awaiting approval` : `🔔 Approval requested — awaiting conveyancer`);
  }

  async function approveCondition(conditionId: string) {
    patchLocal(conditionId, { localStatus: 'MET', metAt: new Date().toISOString(), submittedBy: undefined, docName: undefined });
    notify('✅ Condition approved');
    setLoading(conditionId);
    try { await conditionsApi.update(dealId, conditionId, { status: 'MET' }); onUpdate?.(); } catch { /* optimistic */ } finally { setLoading(null); }
  }

  async function rejectCondition(conditionId: string) {
    const reason = window.prompt('Reason for rejection:');
    if (reason === null) return;
    patchLocal(conditionId, { localStatus: 'PENDING', submittedBy: undefined, docName: undefined, rejectedReason: reason || 'No reason given' });
    notify('Condition sent back for revision');
  }

  async function waiveCondition(conditionId: string) {
    if (!waiveReason.trim()) return;
    patchLocal(conditionId, { localStatus: 'WAIVED', waivedReason: waiveReason, metAt: new Date().toISOString() });
    notify(`〜 Condition waived`);
    setWaiveTarget(null); setWaiveReason('');
    setLoading(conditionId);
    try { await conditionsApi.update(dealId, conditionId, { status: 'WAIVED', waivedReason: waiveReason }); onUpdate?.(); } catch { /* optimistic */ } finally { setLoading(null); }
  }

  if (!conditions?.length) {
    return <div className="card p-5 text-center text-sm text-gray-400">No conditions configured for this deal.</div>;
  }

  return (
    <div className="card p-5 space-y-4">
      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 p-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <span>{toast}</span>
        </div>
      )}

      {/* Header + progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Settlement Conditions</h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${allMet ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {met}/{total} met
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className={`h-full rounded-full transition-all ${allMet ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
        </div>
        {allMet ? (
          <p className="text-xs text-green-600 font-medium">✅ All conditions satisfied — approve in the Settlement panel to proceed.</p>
        ) : (
          <p className="text-xs text-gray-400">{total - met} condition{total - met !== 1 ? 's' : ''} still pending</p>
        )}
      </div>

      {/* Condition cards */}
      <div className="space-y-2">
        {conditions.map((cond) => {
          const effectiveStatus = (cond.localStatus ?? cond.status) as LocalStatus;
          const isPending   = effectiveStatus === 'PENDING';
          const isAwaiting  = effectiveStatus === 'AWAITING_APPROVAL';
          const isMet       = effectiveStatus === 'MET';
          const isWaived    = effectiveStatus === 'WAIVED';
          const canAct      = canActOnCondition(cond.assignedToRole, currentUserRole);
          const condType    = cond.conditionType ?? (cond as any).type ?? 'BOOLEAN_FLAG';

          const borderCls = isMet ? 'bg-green-50 border-green-200'
            : isWaived    ? 'bg-amber-50 border-amber-200'
            : isAwaiting  ? 'bg-blue-50 border-blue-200'
            : 'bg-white border-gray-200';

          const statusIcon = isMet ? '✅' : isWaived ? '〜' : isAwaiting ? '⏳' : '○';

          return (
            <div key={cond.id} className={`border rounded-xl p-4 transition-colors ${borderCls}`}>
              <div className="flex items-start gap-3">
                <span className="text-base mt-0.5 flex-shrink-0">{statusIcon}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{cond.name}</p>
                      {cond.description && <p className="text-xs text-gray-400 mt-0.5">{cond.description}</p>}
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${TYPE_BADGE[condType] ?? 'bg-gray-100 text-gray-500'}`}>
                      {TYPE_LABEL[condType] ?? condType}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                    {cond.assignedToRole && <span className="text-gray-400">→ <span className="font-medium text-gray-600">{formatRole(cond.assignedToRole)}</span></span>}
                    {isMet && <span className="text-green-600 font-medium">Met {cond.metAt ? formatDate(cond.metAt) : '✓'}</span>}
                    {isWaived && <span className="text-amber-600 font-medium">Waived{cond.waivedReason ? ' — ' + cond.waivedReason : ''}</span>}
                    {isAwaiting && <span className="text-blue-600 font-medium">Submitted by {cond.submittedBy ?? 'party'}{cond.docName ? ` — ${cond.docName}` : ''} · Awaiting approval</span>}
                    {isPending && cond.rejectedReason && <span className="text-red-500 font-medium">Rejected: {cond.rejectedReason} — please resubmit</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {isPending && canAct && condType === 'DOCUMENT_UPLOAD' && (
                      <>
                        <input
                          type="text"
                          placeholder="Document name (e.g. Finance_Letter.pdf)"
                          value={docInputs[cond.id] ?? ''}
                          onChange={(e) => setDocInputs((prev) => ({ ...prev, [cond.id]: e.target.value }))}
                          className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1 min-w-0"
                        />
                        <button
                          onClick={() => {
                            if (!docInputs[cond.id]?.trim()) return;
                            requestApproval(cond.id, currentUserRole ?? 'Party', docInputs[cond.id]);
                            setDocInputs((p) => ({ ...p, [cond.id]: '' }));
                          }}
                          className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex-shrink-0"
                        >
                          📎 Upload
                        </button>
                      </>
                    )}

                    {isPending && canAct && condType === 'APPROVAL' && (
                      <button onClick={() => requestApproval(cond.id, currentUserRole ?? 'Party')}
                        className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                        🔔 Request Approval
                      </button>
                    )}

                    {isPending && canAct && (condType === 'BOOLEAN_FLAG' || !condType) && (
                      <button onClick={() => markMet(cond.id)} disabled={loading === cond.id}
                        className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50">
                        {loading === cond.id ? '…' : '✓ Mark Complete'}
                      </button>
                    )}

                    {isPending && !canAct && (
                      <span className="text-xs text-gray-400 italic">Waiting for {formatRole(cond.assignedToRole ?? 'assigned party')} to act</span>
                    )}

                    {isPending && isConveyancer && waiveTarget !== cond.id && (
                      <button onClick={() => { setWaiveTarget(cond.id); setWaiveReason(''); }}
                        className="text-xs px-3 py-1.5 bg-white text-amber-600 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors">
                        Waive
                      </button>
                    )}

                    {isAwaiting && isConveyancer && (
                      <>
                        <button onClick={() => approveCondition(cond.id)} disabled={loading === cond.id}
                          className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50">
                          ✓ Approve
                        </button>
                        <button onClick={() => rejectCondition(cond.id)}
                          className="text-xs px-3 py-1.5 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium">
                          ✗ Reject
                        </button>
                      </>
                    )}

                    {isAwaiting && !isConveyancer && (
                      <span className="text-xs text-blue-500 italic font-medium">Awaiting conveyancer review…</span>
                    )}
                  </div>

                  {/* Waive form inline */}
                  {waiveTarget === cond.id && (
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <input
                        autoFocus
                        className="text-xs w-full px-2.5 py-1.5 border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 mb-2"
                        placeholder="Reason for waiving…"
                        value={waiveReason}
                        onChange={(e) => setWaiveReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => waiveCondition(cond.id)} disabled={!waiveReason.trim() || loading === cond.id}
                          className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50">
                          Confirm Waive
                        </button>
                        <button onClick={() => { setWaiveTarget(null); setWaiveReason(''); }}
                          className="text-xs px-3 py-1.5 text-gray-500 hover:text-gray-800">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  try { return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }); } catch { return dateStr; }
}

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

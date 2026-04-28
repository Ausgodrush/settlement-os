'use client';
import { useState, useRef, useEffect } from 'react';
import { Activity, ActivityEventType } from '@/types';
import { activities as activitiesApi } from '@/lib/api';

interface Props {
  dealId: string;
  activities: Activity[];
  onNewActivity?: (activity: Activity) => void;
}

const EVENT_ICONS: Partial<Record<ActivityEventType, string>> = {
  COMMENT: '💬',
  STATUS_CHANGED: '🔄',
  CONDITION_MET: '✅',
  CONDITION_WAIVED: '〜',
  DOCUMENT_UPLOADED: '📎',
  DOCUMENT_VERIFIED: '✓',
  PARTY_ADDED: '👤',
  MILESTONE_COMPLETE: '🎯',
  SETTLEMENT_APPROVED: '🔐',
  SETTLEMENT_EXECUTED: '🏠',
  SYSTEM: '⚙',
};

const EVENT_COLORS: Partial<Record<ActivityEventType, string>> = {
  CONDITION_MET: 'bg-green-50 border-green-100',
  SETTLEMENT_APPROVED: 'bg-indigo-50 border-indigo-100',
  SETTLEMENT_EXECUTED: 'bg-green-50 border-green-200',
  STATUS_CHANGED: 'bg-blue-50 border-blue-100',
  COMMENT: 'bg-white border-gray-200',
};

export default function ActivityFeed({ dealId, activities: initial, onNewActivity }: Props) {
  const [activities, setActivities] = useState<Activity[]>(initial || []);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setActivities(initial || []); }, [initial]);

  async function postComment() {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const activity = await activitiesApi.comment(dealId, comment.trim());
      setActivities((prev) => [activity, ...prev]);
      setComment('');
      onNewActivity?.(activity);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="card flex flex-col" style={{ maxHeight: '600px' }}>
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Activity</h3>
        <p className="text-xs text-gray-400 mt-0.5">Replaces email — all deal communication here</p>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activities.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">No activity yet.</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`border rounded-lg p-3 text-sm ${
                EVENT_COLORS[activity.eventType] || 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base flex-shrink-0 mt-0.5">
                  {EVENT_ICONS[activity.eventType] || '•'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800">{activity.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    {activity.user && (
                      <span className="font-medium text-gray-600">{activity.user.name}</span>
                    )}
                    {activity.actorRole && (
                      <span className="badge bg-gray-100 text-gray-500 text-[10px]">
                        {formatRole(activity.actorRole)}
                      </span>
                    )}
                    <span className="ml-auto">{timeAgo(activity.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Comment Box */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            className="input flex-1 text-sm"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && postComment()}
          />
          <button
            onClick={postComment}
            disabled={!comment.trim() || posting}
            className="btn-primary px-3"
          >
            {posting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

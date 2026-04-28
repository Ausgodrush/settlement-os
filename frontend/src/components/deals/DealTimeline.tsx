'use client';
import { Milestone, MilestoneStatus } from '@/types';

interface Props {
  milestones: Milestone[];
}

const statusConfig: Record<MilestoneStatus, { icon: string; color: string; ring: string }> = {
  COMPLETE: {
    icon: '✓',
    color: 'bg-green-500 text-white',
    ring: 'ring-green-200',
  },
  IN_PROGRESS: {
    icon: '●',
    color: 'bg-indigo-500 text-white',
    ring: 'ring-indigo-200',
  },
  PENDING: {
    icon: '○',
    color: 'bg-gray-200 text-gray-400',
    ring: 'ring-gray-100',
  },
  BLOCKED: {
    icon: '!',
    color: 'bg-red-500 text-white',
    ring: 'ring-red-200',
  },
};

export default function DealTimeline({ milestones }: Props) {
  if (!milestones?.length) return null;

  const completedCount = milestones.filter((m) => m.status === 'COMPLETE').length;
  const progressPct = Math.round((completedCount / milestones.length) * 100);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Timeline</h3>
        <span className="text-sm text-gray-500">
          {completedCount}/{milestones.length} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Milestone list */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100" />

        <div className="space-y-3">
          {milestones.map((milestone, idx) => {
            const cfg = statusConfig[milestone.status];
            return (
              <div key={milestone.id} className="flex items-start gap-3">
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ring-4 ${cfg.color} ${cfg.ring}`}
                >
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      milestone.status === 'COMPLETE' ? 'text-gray-500 line-through' :
                      milestone.status === 'IN_PROGRESS' ? 'text-indigo-700' :
                      milestone.status === 'BLOCKED' ? 'text-red-700' :
                      'text-gray-700'
                    }`}>
                      {milestone.name}
                    </p>
                    {milestone.completedAt && (
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {formatDate(milestone.completedAt)}
                      </span>
                    )}
                    {!milestone.completedAt && milestone.dueDate && (
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        Due {formatDate(milestone.dueDate)}
                      </span>
                    )}
                  </div>
                  {milestone.assignedToRole && milestone.status !== 'COMPLETE' && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      → {formatRole(milestone.assignedToRole)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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

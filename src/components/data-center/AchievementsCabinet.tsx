'use client';

import { Lock } from 'lucide-react';
import type { Achievement } from '@/types';

interface Props {
  achievements: Achievement[];
}

export function AchievementsCabinet({ achievements }: Props) {
  const unlocked = achievements.filter((a) => a.unlockedAt !== null);
  const locked = achievements.filter((a) => a.unlockedAt === null);

  if (achievements.length === 0) {
    return <p className="text-[13px] text-neutral-400 dark:text-neutral-500">Achievements appear after your first session.</p>;
  }

  return (
    <div className="space-y-5">
      {unlocked.length > 0 && (
        <div>
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Unlocked ({unlocked.length})
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {unlocked.map((a) => <AchievementBadge key={a.id} achievement={a} unlocked />)}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Locked ({locked.length})
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((a) => <AchievementBadge key={a.id} achievement={a} unlocked={false} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function AchievementBadge({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        unlocked
          ? 'border-yellow-200/80 bg-yellow-50/80 dark:border-yellow-500/20 dark:bg-yellow-500/10'
          : 'border-neutral-100 bg-neutral-50/50 opacity-50 dark:border-neutral-800 dark:bg-neutral-800/30'
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-xl shadow-sm dark:bg-neutral-900">
        {unlocked ? (
          <span>{achievement.icon}</span>
        ) : (
          <Lock size={14} strokeWidth={2} className="text-neutral-400 dark:text-neutral-500" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-neutral-800 truncate dark:text-neutral-200">{achievement.title}</p>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 line-clamp-2">{achievement.description}</p>
        {unlocked && achievement.unlockedAt && (
          <p className="mt-0.5 text-[10px] text-yellow-600/70 dark:text-yellow-500/60">
            {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}

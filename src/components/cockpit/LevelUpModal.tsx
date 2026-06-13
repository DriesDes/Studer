'use client';

import { useEffect, useState } from 'react';
import { Star, X, Zap } from 'lucide-react';
import { computeLevelInfo } from '@/lib/xp';
import { celebrateComplete, celebrateAchievement } from '@/lib/confetti';
import type { SessionCompletedPayload } from '@/types';

interface Props {
  payload: SessionCompletedPayload;
  onClose: () => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export function LevelUpModal({ payload, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const levelInfo = computeLevelInfo(
    payload.progress.currentXp - payload.xpEarned,
    payload.progress.currentXp
  );

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    const c = setTimeout(() => {
      celebrateComplete(levelInfo.leveledUp);
      if (payload.newAchievements.length > 0) {
        setTimeout(celebrateAchievement, 350);
      }
    }, 180);
    return () => { clearTimeout(t); clearTimeout(c); };
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-250 ${
        visible ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={close}
    >
      <div
        className={`w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950 transition-all duration-250 ${
          visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-3'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            {levelInfo.leveledUp ? (
              <Star size={15} strokeWidth={2} className="text-yellow-500" />
            ) : (
              <Zap size={15} strokeWidth={2} className="text-violet-500" />
            )}
            <h2 className="text-[14px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {levelInfo.leveledUp ? `Level ${levelInfo.level} reached!` : 'Session Complete'}
            </h2>
          </div>
          <button
            onClick={close}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors dark:hover:bg-neutral-800"
          >
            <X size={13} strokeWidth={2} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <StatPill label="Time" value={formatTime(payload.elapsed)} />
            <StatPill label="XP Earned" value={`+${payload.xpEarned.toLocaleString()}`} highlight />
            <StatPill
              label="Bonus"
              value={`${payload.xpResult.bonusMultiplier}×`}
              highlight={payload.xpResult.bonusMultiplier > 1}
            />
          </div>

          {/* XP bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
              <span>Level {levelInfo.level}</span>
              <span>{levelInfo.progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-1000"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </div>

          {/* New achievements */}
          {payload.newAchievements.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Achievements Unlocked
              </p>
              {payload.newAchievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-lg border border-yellow-200/80 bg-yellow-50 p-3 dark:border-yellow-500/20 dark:bg-yellow-500/10"
                >
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-200">{a.title}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={close}
            className="w-full rounded-lg bg-neutral-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{label}</p>
      <p className={`mt-0.5 text-[13px] font-semibold ${highlight ? 'text-violet-600 dark:text-violet-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
        {value}
      </p>
    </div>
  );
}

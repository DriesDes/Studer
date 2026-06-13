'use client';

import { useState, useEffect } from 'react';
import { Flame, Zap, History, WifiOff } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Timer } from './Timer';
import { LevelUpModal } from './LevelUpModal';
import { SessionHistory } from './SessionHistory';
import { computeLevelInfo } from '@/lib/xp';
import type { Subject } from '@/types';

const TARGET_PRESETS = [
  { label: 'No target', value: 0 },
  { label: '25 min', value: 25 },
  { label: '50 min', value: 50 },
  { label: '90 min', value: 90 },
];

export function FocusCockpit() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [targetDuration, setTargetDuration] = useState(25);
  const [showConfirmAbandon, setShowConfirmAbandon] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [progressData, setProgressData] = useState<{
    currentXp: number;
    currentLevel: number;
    currentStreak: number;
  } | null>(null);

  const isOnline = useOnlineStatus();

  const {
    isActive,
    elapsed,
    sessionState,
    completedPayload,
    isConnected,
    startSession,
    stopSession,
    abandonSession,
    clearCompleted,
  } = useSession();

  useEffect(() => {
    fetch('/api/subjects').then((r) => r.json()).then(setSubjects).catch(console.error);
    fetch('/api/progress').then((r) => r.json()).then(setProgressData).catch(console.error);
  }, []);

  useEffect(() => {
    if (completedPayload) {
      setProgressData({
        currentXp: completedPayload.progress.currentXp,
        currentLevel: completedPayload.progress.currentLevel,
        currentStreak: completedPayload.progress.currentStreak,
      });
      setHistoryRefreshKey((k) => k + 1);
    }
  }, [completedPayload]);

  const handleStart = () => startSession(selectedSubjectId || null, targetDuration);
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const levelInfo = progressData
    ? computeLevelInfo(progressData.currentXp, progressData.currentXp)
    : null;

  return (
    <div className="mx-auto max-w-md px-4 pt-6 pb-8 sm:pt-10 sm:pb-16">
      {completedPayload && (
        <LevelUpModal payload={completedPayload} onClose={clearCompleted} />
      )}

      {/* ── Offline banner ─────────────────────────────────────────── */}
      {!isOnline && (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/20 dark:bg-amber-500/10">
          <WifiOff size={13} strokeWidth={2} className="shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="text-[12px] text-amber-700 dark:text-amber-300">
            You&apos;re offline — timer won&apos;t sync until reconnected
          </span>
        </div>
      )}

      {/* ── Connection status ──────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-center gap-1.5">
        <div
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            isConnected ? 'bg-green-400 animate-pulse-slow' : 'bg-red-400'
          }`}
        />
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
          {isConnected ? 'Synced across devices' : 'Connecting…'}
        </span>
      </div>

      {/* ── Timer ─────────────────────────────────────────────────── */}
      <div className="mb-2 text-center">
        <Timer
          elapsed={elapsed}
          targetDuration={sessionState?.targetDuration ?? targetDuration}
          isActive={isActive}
        />
      </div>

      {isActive && currentSubject && (
        <div className="mb-6 flex items-center justify-center gap-2 animate-fade-in">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: currentSubject.color }}
          />
          <span className="text-[13px] text-neutral-500 dark:text-neutral-400">
            {currentSubject.name}
          </span>
        </div>
      )}

      {/* ── Controls ──────────────────────────────────────────────── */}
      {!isActive ? (
        <div className="space-y-4 animate-slide-up">
          <button
            onClick={handleStart}
            disabled={!isConnected}
            className="
              w-full rounded-xl bg-red-600 py-5 text-[17px] font-semibold tracking-tight text-white
              transition-all duration-150
              hover:bg-red-500 hover:scale-[1.015]
              active:scale-[0.985] active:bg-red-700
              disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-950
            "
          >
            Start Session
          </button>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-800
                           focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 appearance-none cursor-pointer
                           dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-violet-500"
              >
                <option value="">Unspecified</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Target
              </label>
              <select
                value={targetDuration}
                onChange={(e) => setTargetDuration(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-800
                           focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 appearance-none cursor-pointer
                           dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:focus:border-violet-500"
              >
                {TARGET_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-center text-[12px] text-neutral-400 dark:text-neutral-500">
            Subject is optional — hit Start and go
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-slide-up">
          <button
            onClick={stopSession}
            className="
              w-full rounded-xl bg-neutral-900 py-4 text-[15px] font-semibold tracking-tight text-white
              transition-all duration-150
              hover:bg-neutral-800 hover:scale-[1.015]
              active:scale-[0.985]
              dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100
              focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-950
            "
          >
            Stop &amp; Save
          </button>

          {showConfirmAbandon ? (
            <div className="flex gap-2">
              <button
                onClick={() => { abandonSession(); setShowConfirmAbandon(false); setHistoryRefreshKey((k) => k + 1); }}
                className="flex-1 rounded-lg border border-red-200 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                Abandon
              </button>
              <button
                onClick={() => setShowConfirmAbandon(false)}
                className="flex-1 rounded-lg border border-neutral-200 py-2 text-[13px] text-neutral-600 hover:bg-neutral-50 transition-colors dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/50"
              >
                Keep going
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmAbandon(true)}
              className="w-full rounded-lg py-2 text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors dark:hover:text-neutral-300"
            >
              Abandon session (no XP)
            </button>
          )}
        </div>
      )}

      {/* ── XP Bar ────────────────────────────────────────────────── */}
      {levelInfo && progressData && (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-500/20">
                <Zap size={12} strokeWidth={2.5} className="text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-200">
                Level {levelInfo.level}
              </span>
              <span className="text-[12px] text-neutral-400 dark:text-neutral-500">
                {progressData.currentXp.toLocaleString()} XP
              </span>
            </div>
            <div className="flex items-center gap-1 text-orange-400">
              <Flame size={13} strokeWidth={2} />
              <span className="text-[12px] font-medium">{progressData.currentStreak}d</span>
            </div>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>

          <div className="mt-2 flex justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
            <span>
              {(progressData.currentXp - levelInfo.xpForCurrentLevel).toLocaleString()} /{' '}
              {(levelInfo.xpForNextLevel - levelInfo.xpForCurrentLevel).toLocaleString()} XP
            </span>
            <span>Level {levelInfo.level + 1}</span>
          </div>
        </div>
      )}

      {/* ── Session History ────────────────────────────────────────── */}
      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <History size={13} strokeWidth={2} className="text-neutral-400 dark:text-neutral-500" />
          <h2 className="text-[12px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Recent Sessions
          </h2>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900">
          <SessionHistory subjects={subjects} refreshKey={historyRefreshKey} />
        </div>
      </div>
    </div>
  );
}

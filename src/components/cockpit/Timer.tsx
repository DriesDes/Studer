'use client';

import { Target } from 'lucide-react';

interface TimerProps {
  elapsed: number;
  targetDuration: number;
  isActive: boolean;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Timer({ elapsed, targetDuration, isActive }: TimerProps) {
  const targetSeconds = targetDuration * 60;
  const hasTarget = targetDuration > 0;
  const reachedTarget = hasTarget && elapsed >= targetSeconds;
  const overtime = reachedTarget ? elapsed - targetSeconds : 0;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const ringProgress = hasTarget ? Math.min(1, elapsed / targetSeconds) : 0;
  const strokeDashoffset = circumference * (1 - ringProgress);

  return (
    <div className="flex flex-col items-center gap-3">
      {/*
        The SVG uses viewBox so it scales naturally with its container.
        w-full + max-w-[220px] makes it shrink on narrow phones but cap on wide screens.
      */}
      <div className="relative w-full max-w-[220px] mx-auto aspect-square">
        <svg
          viewBox="0 0 200 200"
          className="-rotate-90 w-full h-full"
          aria-hidden
        >
          <circle
            cx={100} cy={100} r={radius}
            fill="none" strokeWidth={5}
            className="stroke-neutral-100 dark:stroke-neutral-800"
          />
          {hasTarget && (
            <circle
              cx={100} cy={100} r={radius}
              fill="none" strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-1000 ${
                reachedTarget
                  ? 'stroke-green-400'
                  : 'stroke-violet-500'
              }`}
            />
          )}
        </svg>

        {/* Overlay text — absolute-centers inside the SVG container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-mono text-4xl sm:text-5xl font-bold tabular-nums tracking-tight transition-colors ${
              isActive
                ? reachedTarget ? 'text-green-500 dark:text-green-400' : 'text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-400 dark:text-neutral-500'
            }`}
          >
            {formatTime(elapsed)}
          </span>

          {isActive && hasTarget && (
            <span className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
              {reachedTarget ? `+${formatTime(overtime)} overtime` : `of ${targetDuration}m`}
            </span>
          )}
        </div>
      </div>

      {isActive && reachedTarget && (
        <div className="flex items-center gap-1.5 animate-bounce-in rounded-full bg-green-500/15 px-4 py-1.5 text-[12px] font-semibold text-green-600 dark:text-green-400">
          <Target size={12} strokeWidth={2.5} />
          Target reached — bonus XP accumulating
        </div>
      )}
    </div>
  );
}

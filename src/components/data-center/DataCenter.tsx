'use client';

import { useState, useEffect } from 'react';
import { StudyHoursChart } from './StudyHoursChart';
import { ProductiveHoursChart } from './ProductiveHoursChart';
import { StreakCalendar } from './StreakCalendar';
import { AchievementsCabinet } from './AchievementsCabinet';
import type { AnalyticsData, Achievement } from '@/types';

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{value}</p>
      {sub && <p className="mt-0.5 text-[12px] text-neutral-400 dark:text-neutral-500">{sub}</p>}
    </div>
  );
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function DataCenter() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then((r) => r.json()),
      fetch('/api/achievements').then((r) => r.json()),
    ])
      .then(([a, achs]) => {
        setAnalytics(a);
        setAchievements(achs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-card border border-border" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-card border border-border" />
      </div>
    );
  }

  if (!analytics) return null;

  // Get max streak from daily study data
  let currentStreak = 0;
  const sortedDays = [...analytics.dailyStudy].sort((a, b) => a.date.localeCompare(b.date));
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  const dateSet = new Set(sortedDays.map((d) => d.date));
  for (let i = 0; i <= 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (dateSet.has(ds)) { streak++; } else { break; }
  }
  currentStreak = streak;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-[18px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Data Center</h1>
        <p className="text-[13px] text-neutral-400 dark:text-neutral-500">Your study stats at a glance</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Time" value={formatHours(analytics.totalMinutes)} sub="all sessions" />
        <StatCard label="Sessions" value={analytics.totalSessions.toString()} sub="completed" />
        <StatCard label="Total XP" value={analytics.totalXp.toLocaleString()} sub="accumulated" />
        <StatCard label="Streak" value={`${currentStreak}d`} sub="days in a row" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-4 text-[13px] font-semibold tracking-tight text-neutral-800 dark:text-neutral-200">Hours per Subject</h2>
          <StudyHoursChart data={analytics.hoursPerSubject} />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-4 text-[13px] font-semibold tracking-tight text-neutral-800 dark:text-neutral-200">Most Productive Hours</h2>
          <ProductiveHoursChart data={analytics.hourlyDistribution} />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-4 text-[13px] font-semibold tracking-tight text-neutral-800 dark:text-neutral-200">Study Activity</h2>
        <StreakCalendar data={analytics.dailyStudy} />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-4 text-[13px] font-semibold tracking-tight text-neutral-800 dark:text-neutral-200">Achievements</h2>
        <AchievementsCabinet achievements={achievements} />
      </div>
    </div>
  );
}

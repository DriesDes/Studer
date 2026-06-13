'use client';

import { useMemo } from 'react';
import type { DailyStudy } from '@/types';

interface Props {
  data: DailyStudy[];
}

function getWeeksGrid(data: DailyStudy[]): { date: string; minutes: number }[][] {
  const minuteMap = new Map(data.map((d) => [d.date, d.minutes]));

  // Build the last 52 weeks (364 days) + padding to start on Sunday
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 363);

  // Align to the nearest Sunday before or on startDate
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const weeks: { date: string; minutes: number }[][] = [];
  let currentWeek: { date: string; minutes: number }[] = [];

  const cursor = new Date(startDate);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (6 - today.getDay())); // end of this week

  while (cursor <= endDate) {
    const iso = cursor.toISOString().split('T')[0];
    currentWeek.push({ date: iso, minutes: minuteMap.get(iso) ?? 0 });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  if (currentWeek.length > 0) weeks.push(currentWeek);
  return weeks;
}

function getColor(minutes: number): string {
  if (minutes === 0) return 'bg-muted';
  if (minutes < 30) return 'bg-indigo-900/60';
  if (minutes < 60) return 'bg-indigo-700/80';
  if (minutes < 120) return 'bg-indigo-500';
  return 'bg-indigo-400';
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function StreakCalendar({ data }: Props) {
  const weeks = useMemo(() => getWeeksGrid(data), [data]);
  const today = new Date().toISOString().split('T')[0];

  // Build month labels: find the first week index each month appears
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const month = new Date(week[0].date).getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ label: MONTH_LABELS[month], col: wi });
      lastMonth = month;
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1.5 min-w-max">
        {/* Month labels */}
        <div className="flex gap-1 pl-6">
          {weeks.map((_, wi) => {
            const ml = monthLabels.find((m) => m.col === wi);
            return (
              <div key={wi} className="w-3 text-[10px] text-muted-foreground">
                {ml ? ml.label : ''}
              </div>
            );
          })}
        </div>

        {/* Grid rows (days of week) */}
        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pr-1.5 justify-around">
            {DAY_LABELS.map((d, i) => (
              <div key={i} className={`text-[10px] text-muted-foreground w-4 ${i % 2 === 0 ? 'opacity-0' : ''}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={
                    day.minutes > 0
                      ? `${day.date}: ${Math.floor(day.minutes / 60)}h ${day.minutes % 60}m`
                      : day.date
                  }
                  className={`
                    h-3 w-3 rounded-sm transition-colors
                    ${getColor(day.minutes)}
                    ${day.date === today ? 'ring-1 ring-indigo-400 ring-offset-1 ring-offset-card' : ''}
                    ${day.date > today ? 'opacity-0 pointer-events-none' : ''}
                  `}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 pl-6 mt-1">
          <span className="text-[10px] text-muted-foreground">Less</span>
          {['bg-muted', 'bg-indigo-900/60', 'bg-indigo-700/80', 'bg-indigo-500', 'bg-indigo-400'].map((c) => (
            <div key={c} className={`h-3 w-3 rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
}

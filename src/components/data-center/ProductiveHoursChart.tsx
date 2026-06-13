'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { HourlyDistribution } from '@/types';

interface Props {
  data: HourlyDistribution[];
}

function formatHour(h: number): string {
  if (h === 0) return '12a';
  if (h < 12) return `${h}a`;
  if (h === 12) return '12p';
  return `${h - 12}p`;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as HourlyDistribution;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-foreground">{d.hour}:00 – {d.hour + 1}:00</p>
      <p className="text-muted-foreground">{d.sessions} session{d.sessions !== 1 ? 's' : ''}</p>
      <p className="text-muted-foreground">{Math.round(d.minutes)}m studied</p>
    </div>
  );
};

export function ProductiveHoursChart({ data }: Props) {
  const hasData = data.some((d) => d.sessions > 0);

  if (!hasData) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No session data yet
      </div>
    );
  }

  // Show only hours 6–23 for cleaner display
  const filtered = data.filter((d) => d.hour >= 6);
  const max = Math.max(...filtered.map((d) => d.sessions), 1);

  const chartData = filtered.map((d) => ({
    ...d,
    label: formatHour(d.hour),
    intensity: d.sessions / max,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={1}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
        <Bar dataKey="sessions" radius={[4, 4, 0, 0]} fill="#6366f1" maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

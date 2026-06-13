import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { AnalyticsData, HoursPerSubject, HourlyDistribution, DailyStudy } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sessions = await prisma.studySession.findMany({
    where: { status: 'COMPLETED', endTime: { not: null } },
    include: { subject: true },
    orderBy: { startTime: 'asc' },
  });

  // ── Hours per subject ─────────────────────────────────────────────────────
  const subjectMap = new Map<string, HoursPerSubject>();
  let unspecifiedMinutes = 0;

  for (const s of sessions) {
    const minutes = s.endTime
      ? (s.endTime.getTime() - s.startTime.getTime()) / 60000
      : 0;
    if (!s.subjectId || !s.subject) {
      unspecifiedMinutes += minutes;
    } else {
      const existing = subjectMap.get(s.subjectId);
      if (existing) {
        existing.totalMinutes += minutes;
      } else {
        subjectMap.set(s.subjectId, {
          subjectId: s.subjectId,
          subjectName: s.subject.name,
          color: s.subject.color,
          totalMinutes: minutes,
        });
      }
    }
  }

  if (unspecifiedMinutes > 0) {
    subjectMap.set('unspecified', {
      subjectId: 'unspecified',
      subjectName: 'Unspecified',
      color: '#6b7280',
      totalMinutes: unspecifiedMinutes,
    });
  }

  const hoursPerSubject: HoursPerSubject[] = Array.from(subjectMap.values()).map((s) => ({
    ...s,
    totalMinutes: Math.round(s.totalMinutes),
  }));

  // ── Hourly distribution ───────────────────────────────────────────────────
  const hourBuckets: HourlyDistribution[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    sessions: 0,
    minutes: 0,
  }));

  for (const s of sessions) {
    const hour = s.startTime.getHours();
    const minutes = s.endTime
      ? (s.endTime.getTime() - s.startTime.getTime()) / 60000
      : 0;
    hourBuckets[hour].sessions += 1;
    hourBuckets[hour].minutes += minutes;
  }

  // ── Daily study (last 365 days) ───────────────────────────────────────────
  const dailyMap = new Map<string, DailyStudy>();

  for (const s of sessions) {
    const date = s.startTime.toISOString().split('T')[0];
    const minutes = s.endTime
      ? (s.endTime.getTime() - s.startTime.getTime()) / 60000
      : 0;
    const existing = dailyMap.get(date);
    if (existing) {
      existing.minutes += minutes;
      existing.sessions += 1;
    } else {
      dailyMap.set(date, { date, minutes, sessions: 1 });
    }
  }

  const dailyStudy: DailyStudy[] = Array.from(dailyMap.values()).map((d) => ({
    ...d,
    minutes: Math.round(d.minutes),
  }));

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalMinutes = Math.round(sessions.reduce((acc, s) => {
    return acc + (s.endTime ? (s.endTime.getTime() - s.startTime.getTime()) / 60000 : 0);
  }, 0));

  const totalXpRow = await prisma.studySession.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { xpEarned: true },
  });

  const data: AnalyticsData = {
    hoursPerSubject,
    hourlyDistribution: hourBuckets,
    dailyStudy,
    totalSessions: sessions.length,
    totalMinutes,
    totalXp: totalXpRow._sum.xpEarned ?? 0,
  };

  return NextResponse.json(data);
}

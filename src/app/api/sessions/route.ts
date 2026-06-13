import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sessions = await prisma.studySession.findMany({
    where: { status: { in: ['COMPLETED', 'ABANDONED'] } },
    orderBy: { startTime: 'desc' },
    take: 30,
    include: {
      subject: { select: { id: true, name: true, color: true } },
    },
  });
  return NextResponse.json(sessions);
}

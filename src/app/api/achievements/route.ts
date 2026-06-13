import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const achievements = await prisma.achievement.findMany({
    orderBy: [{ unlockedAt: 'asc' }, { slug: 'asc' }],
  });
  return NextResponse.json(achievements);
}

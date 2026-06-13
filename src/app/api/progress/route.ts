import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  let progress = await prisma.userProgress.findFirst();
  if (!progress) {
    progress = await prisma.userProgress.create({
      data: { currentXp: 0, currentLevel: 1, currentStreak: 0, lastActiveDate: new Date() },
    });
  }
  return NextResponse.json(progress);
}

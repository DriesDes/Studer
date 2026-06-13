import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const subjects = await prisma.subject.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { chapters: true } },
      chapters: { select: { completed: true } },
    },
  });
  return NextResponse.json(subjects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const subject = await prisma.subject.create({
    data: {
      name: body.name.trim(),
      color: body.color ?? '#6366f1',
    },
  });
  return NextResponse.json(subject, { status: 201 });
}

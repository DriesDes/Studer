import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const chapters = await prisma.chapter.findMany({
    where: { subjectId: params.id },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(chapters);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  // Bulk import from AI-parsed JSON
  if (Array.isArray(body)) {
    // Delete existing chapters first, then import
    await prisma.chapter.deleteMany({ where: { subjectId: params.id } });
    const chapters = await prisma.chapter.createMany({
      data: body.map((c: { title: string; order: number }) => ({
        subjectId: params.id,
        title: c.title,
        order: c.order,
        completed: false,
      })),
    });
    return NextResponse.json({ count: chapters.count }, { status: 201 });
  }

  // Single chapter
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  const maxOrder = await prisma.chapter.aggregate({
    where: { subjectId: params.id },
    _max: { order: true },
  });
  const chapter = await prisma.chapter.create({
    data: {
      subjectId: params.id,
      title: body.title.trim(),
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });
  return NextResponse.json(chapter, { status: 201 });
}

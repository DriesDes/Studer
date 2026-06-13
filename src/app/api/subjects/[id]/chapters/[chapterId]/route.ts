import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  const body = await req.json();
  const chapter = await prisma.chapter.update({
    where: { id: params.chapterId },
    data: {
      ...(body.completed !== undefined && { completed: body.completed }),
      ...(body.title && { title: body.title }),
    },
  });
  return NextResponse.json(chapter);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  await prisma.chapter.delete({ where: { id: params.chapterId } });
  return NextResponse.json({ ok: true });
}

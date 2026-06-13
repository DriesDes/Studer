import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const subject = await prisma.subject.findUnique({
    where: { id: params.id },
    include: { chapters: { orderBy: { order: 'asc' } } },
  });
  if (!subject) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(subject);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const subject = await prisma.subject.update({
    where: { id: params.id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.color && { color: body.color }),
    },
  });
  return NextResponse.json(subject);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.subject.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

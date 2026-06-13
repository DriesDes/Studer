import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const session = await prisma.studySession.update({
    where: { id: params.id },
    data: { subjectId: body.subjectId || null },
    include: { subject: { select: { id: true, name: true, color: true } } },
  });
  return NextResponse.json(session);
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const session = searchParams.get('session');

  try {
    const papers = await prisma.pastPaper.findMany({
      where: {
        year: year ? parseInt(year) : undefined,
        session: session || undefined,
      },
      orderBy: [
        { year: 'desc' },
        { session: 'asc' },
        { unitCode: 'asc' },
      ],
    });

    return NextResponse.json({ papers });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch papers' }, { status: 500 });
  }
} 
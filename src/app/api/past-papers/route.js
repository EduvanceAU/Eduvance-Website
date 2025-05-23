import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map frontend session names to database session names
const sessionMap = {
  'January': 'January',
  'June': 'June',
  'November': 'November'
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const session = searchParams.get('session');

  if (!year || !session) {
    return NextResponse.json(
      { error: 'Year and session are required' },
      { status: 400 }
    );
  }

  try {
    const mappedSession = sessionMap[session];
    if (!mappedSession) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 400 }
      );
    }

    const papers = await prisma.pastPaper.findMany({
      where: {
        year: parseInt(year),
        session: mappedSession,
      },
      orderBy: [
        { unitCode: 'asc' },
      ],
    });

    if (!papers.length) {
      return NextResponse.json(
        { papers: [], message: 'No papers found for the specified criteria' },
        { status: 200 }
      );
    }

    return NextResponse.json({ papers });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 
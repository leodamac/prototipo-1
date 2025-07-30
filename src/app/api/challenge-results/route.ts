import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const challengeSessions = await prisma.challengeSession.findMany({
      where: {
        comments: {
          not: null,
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
    return NextResponse.json(challengeSessions);
  } catch (error) {
    console.error('Error fetching challenge sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

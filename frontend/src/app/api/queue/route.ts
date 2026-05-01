import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tesisList = await prisma.tesis.findMany({
      where: {
        estado: {
          in: ['EN_COLA', 'PROCESANDO']
        },
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000) // solo los de los últimos 15 minutos
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ success: true, data: tesisList });
  } catch (error: any) {
    console.error("Queue API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

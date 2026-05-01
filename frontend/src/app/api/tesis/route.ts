import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tesis = await prisma.tesis.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        revision: true
      }
    });

    return NextResponse.json({ success: true, data: tesis });
  } catch (error: any) {
    console.error("GET Tesis API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

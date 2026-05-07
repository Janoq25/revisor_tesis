import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    // Verificar sesión del usuario
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const tesis = await prisma.tesis.findMany({
      where: { usuarioId: user.id },
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

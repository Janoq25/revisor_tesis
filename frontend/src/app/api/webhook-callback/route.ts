import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tesisId, estado, observaciones, puntuacionGeneral, tiempoProcesamiento, reportePdfUrl } = body;

    if (!tesisId) {
      return NextResponse.json({ success: false, error: "Missing tesisId" }, { status: 400 });
    }

    // Determinar estado final de revisión
    const finalEstado = estado === "Aprobado" ? "COMPLETADO" : (estado === "Error" ? "ERROR" : "COMPLETADO");

    const punt = typeof puntuacionGeneral === "number" ? puntuacionGeneral : parseFloat(String(puntuacionGeneral ?? "0"));
    const tiempo = typeof tiempoProcesamiento === "number" ? tiempoProcesamiento : parseInt(String(tiempoProcesamiento ?? "0"), 10);

    // 1. Update Tesis state
    await prisma.tesis.update({
      where: { id: tesisId },
      data: { estado: finalEstado }
    });

    // 2. Guardar revisión siempre, incluso si hay error, para ver los detalles
    await prisma.revision.upsert({
      where: { tesisId },
      create: {
        tesisId,
        estadoGeneral: String(estado ?? ""),
        puntuacionGeneral: Number.isFinite(punt) ? punt : 0,
        tiempoProcesamiento: Number.isFinite(tiempo) ? tiempo : 0,
        reportePdfUrl,
        observaciones: observaciones ?? [],
      },
      update: {
        estadoGeneral: String(estado ?? ""),
        puntuacionGeneral: Number.isFinite(punt) ? punt : 0,
        tiempoProcesamiento: Number.isFinite(tiempo) ? tiempo : 0,
        reportePdfUrl,
        observaciones: observaciones ?? [],
      },
    });

    return NextResponse.json({ success: true, message: "Callback processed successfully" });

  } catch (error: any) {
    console.error("Webhook Callback Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

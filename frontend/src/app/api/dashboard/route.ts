import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const revisiones = await prisma.revision.findMany();
    const tesis = await prisma.tesis.findMany();

    // 1. KPI Cards
    const totalRevisadas = revisiones.length;
    const aprobadas = revisiones.filter(r => r.estadoGeneral === 'Aprobado').length;
    const observadas = revisiones.filter(r => r.estadoGeneral === 'Observado').length;
    const rechazadas = revisiones.filter(r => r.estadoGeneral === 'Rechazado').length;
    
    const tasaAprobacion = totalRevisadas > 0 ? Math.round((aprobadas / totalRevisadas) * 100) : 0;
    
    // Calcular promedio de tiempo (en segundos)
    const tiempoTotal = revisiones.reduce((acc, curr) => acc + curr.tiempoProcesamiento, 0);
    const tiempoPromedio = totalRevisadas > 0 ? Math.round(tiempoTotal / totalRevisadas) : 0;

    // Calcular observaciones totales para el promedio
    let observacionesTotales = 0;
    revisiones.forEach(r => {
      const obsList = r.observaciones as any[];
      if (Array.isArray(obsList)) {
        // Contamos como observación todo lo que no esté "OK"
        const malas = obsList.filter(o => o.estado !== 'OK').length;
        observacionesTotales += malas;
      }
    });
    const observacionesPromedio = totalRevisadas > 0 ? (observacionesTotales / totalRevisadas).toFixed(1) : 0;

    // 2. Approval Data (Donut Chart)
    const approvalData = [
      { name: 'Aprobadas', value: aprobadas, color: '#10b981' },
      { name: 'Observadas', value: observadas, color: '#f59e0b' },
      { name: 'Rechazadas', value: rechazadas, color: '#ef4444' },
    ];

    // 3. Sections Data (Bar Chart)
    // Agrupar observaciones negativas por sección
    const seccionesCount: Record<string, number> = {};
    revisiones.forEach(r => {
      const obsList = r.observaciones as any[];
      if (Array.isArray(obsList)) {
        obsList.forEach(o => {
          if (o.estado !== 'OK' && o.seccion) {
            seccionesCount[o.seccion] = (seccionesCount[o.seccion] || 0) + 1;
          }
        });
      }
    });
    
    const sectionsData = Object.keys(seccionesCount).map(seccion => ({
      name: seccion,
      observaciones: seccionesCount[seccion]
    })).sort((a, b) => b.observaciones - a.observaciones).slice(0, 7); // Tomar top 7

    // 4. Performance over time (Line Chart)
    // Agrupar por mes/semana. Por simplicidad, devolveremos un mock si no hay suficientes datos
    // En producción se agruparía createdAt por semana.
    
    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalRevisadas,
          tasaAprobacion: `${tasaAprobacion}%`,
          observacionesPromedio,
          tiempoPromedio: `${tiempoPromedio}s`
        },
        approvalData,
        sectionsData
      }
    });

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

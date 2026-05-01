import React from 'react';
import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const revisiones = await prisma.revision.findMany({
    include: { tesis: true },
    orderBy: { createdAt: 'asc' } // chronological for performance chart
  });

  // Calculate KPIs
  const totalRevisadas = revisiones.length;
  let aprobadas = 0;
  let observadas = 0;
  let rechazadas = 0;
  let totalTiempo = 0;
  let totalPuntuacion = 0;
  let totalObservacionesIncompletas = 0;

  // For charts
  const sectionCounts: Record<string, number> = {};
  const performanceByWeek: Record<string, { sum: number; count: number }> = {};

  revisiones.forEach((rev) => {
    // 1. Approval Data
    const estado = rev.estadoGeneral?.toLowerCase() || '';
    if (estado === 'aprobado' || estado === 'completado') aprobadas++;
    else if (estado === 'rechazado' || estado === 'error') rechazadas++;
    else observadas++;

    // 2. Metrics
    totalTiempo += rev.tiempoProcesamiento || 0;
    totalPuntuacion += rev.puntuacionGeneral || 0;

    // 3. Sections Data
    let obsArray: any[] = [];
    if (rev.observaciones) {
      try {
        obsArray = typeof rev.observaciones === 'string' ? JSON.parse(rev.observaciones) : rev.observaciones;
        if (!Array.isArray(obsArray)) obsArray = [obsArray];
      } catch (e) {}
    }

    obsArray.forEach(obs => {
      // count as 'observacion' if it has error/incompleto etc.
      const estadoObs = obs.estado?.toLowerCase() || '';
      if (estadoObs !== 'ok') {
        totalObservacionesIncompletas++;
        const seccion = obs.seccion || 'General';
        sectionCounts[seccion] = (sectionCounts[seccion] || 0) + 1;
      }
    });

    // 4. Performance Data (group by ISO week or simple date format)
    // For simplicity, let's group by "YYYY-MM-DD" or just day since we might not have weeks of data
    const date = rev.createdAt;
    const label = `${date.getDate()}/${date.getMonth() + 1}`; // e.g. "28/4"
    if (!performanceByWeek[label]) {
      performanceByWeek[label] = { sum: 0, count: 0 };
    }
    performanceByWeek[label].sum += rev.puntuacionGeneral || 0;
    performanceByWeek[label].count += 1;
  });

  const tasaAprobacion = totalRevisadas > 0 ? Math.round((aprobadas / totalRevisadas) * 100) : 0;
  const observacionesPromedio = totalRevisadas > 0 ? (totalObservacionesIncompletas / totalRevisadas).toFixed(1) : "0";
  const tiempoPromedio = totalRevisadas > 0 ? Math.round(totalTiempo / totalRevisadas) : 0;

  const approvalData = [
    { name: 'Aprobadas', value: aprobadas, color: '#10b981' },
    { name: 'Observadas', value: observadas, color: '#f59e0b' },
    { name: 'Rechazadas', value: rechazadas, color: '#ef4444' },
  ].filter(d => d.value > 0); // Hide empty sections

  const sectionsData = Object.entries(sectionCounts)
    .map(([name, count]) => ({ name, observaciones: count }))
    .sort((a, b) => b.observaciones - a.observaciones)
    .slice(0, 6); // Top 6 sections

  const performanceData = Object.entries(performanceByWeek).map(([label, data]) => ({
    label,
    promedio: Math.round(data.sum / data.count)
  }));

  const dashboardData = {
    kpis: {
      totalRevisadas,
      tasaAprobacion: tasaAprobacion.toString(),
      observacionesPromedio: observacionesPromedio.toString(),
      tiempoPromedio: tiempoPromedio.toString(),
    },
    approvalData,
    sectionsData,
    performanceData
  };

  return <DashboardClient data={dashboardData} />;
}

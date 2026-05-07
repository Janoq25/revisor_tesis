import { prisma } from "@/lib/prisma";

export async function getDashboardData(userId: string) {
  const tesisList = await prisma.tesis.findMany({
    where: { usuarioId: userId },
    include: { revision: true }
  });

  const revisiones = tesisList
    .map(t => t.revision)
    .filter((r): r is typeof r & { __typename?: any } => r !== null);

  const totalRevisadas = revisiones.length;
  const aprobadas = revisiones.filter(r => r.estadoGeneral === 'Aprobado').length;
  const observadas = revisiones.filter(r => r.estadoGeneral === 'Observado').length;
  const rechazadas = revisiones.filter(r => r.estadoGeneral === 'Rechazado').length;

  const tasaAprobacion = totalRevisadas > 0 ? Math.round((aprobadas / totalRevisadas) * 100) : 0;

  const tiempoTotal = revisiones.reduce((acc, curr) => acc + curr.tiempoProcesamiento, 0);
  const tiempoPromedio = totalRevisadas > 0 ? Math.round(tiempoTotal / totalRevisadas) : 0;

  let observacionesTotales = 0;
  revisiones.forEach(r => {
    const obsList = r.observaciones as any[];
    if (Array.isArray(obsList)) {
      const malas = obsList.filter(o => o.estado !== 'OK').length;
      observacionesTotales += malas;
    }
  });
  const observacionesPromedio = totalRevisadas > 0 ? (observacionesTotales / totalRevisadas).toFixed(1) : '0';

  const approvalData = [
    { name: 'Aprobadas', value: aprobadas, color: '#10b981' },
    { name: 'Observadas', value: observadas, color: '#f59e0b' },
    { name: 'Rechazadas', value: rechazadas, color: '#ef4444' },
  ];

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
  })).sort((a, b) => b.observaciones - a.observaciones).slice(0, 7);

  const now = new Date();
  const weeks: { label: string; promedio: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const label = weekStart.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

    const weekRevisions = revisiones.filter(r => {
      const d = new Date(r.createdAt);
      return d >= weekStart && d < weekEnd;
    });

    const avg = weekRevisions.length > 0
      ? Math.round(weekRevisions.reduce((acc, r) => acc + r.puntuacionGeneral, 0) / weekRevisions.length)
      : 0;

    weeks.push({ label, promedio: avg });
  }

  return {
    kpis: {
      totalRevisadas,
      tasaAprobacion: `${tasaAprobacion}%`,
      observacionesPromedio,
      tiempoPromedio: `${tiempoPromedio}s`
    },
    approvalData,
    sectionsData,
    performanceData: weeks,
  };
}

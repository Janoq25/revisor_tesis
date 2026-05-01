import React from 'react';
import { prisma } from '@/lib/prisma';
import ReportesClient from './ReportesClient';

export const dynamic = 'force-dynamic'; // Para que siempre obtenga los datos más recientes

export default async function ReportesPage() {
  // Fetch real data from the database
  const tesisRecords = await prisma.tesis.findMany({
    include: { revision: true },
    orderBy: { createdAt: 'desc' },
  });

  // Map the database records to the format expected by the client
  const reportes = tesisRecords.map((t) => ({
    id: t.id,
    titulo: t.titulo,
    autor: t.autor,
    // Si la tesis está en error, mostrarlo aunque no haya revisión. Si hay revisión, mostrar el estado general.
    estado: t.revision?.estadoGeneral || (t.estado === 'ERROR' ? 'Error' : t.estado),
    puntuacion: t.revision?.puntuacionGeneral || 0,
    fecha: t.createdAt.toISOString().split('T')[0],
  }));

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ color: "var(--foreground)", marginBottom: "0.5rem" }}>
          Reportes de Revisión
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1.125rem" }}>
          Historial completo de todas las tesis procesadas por el sistema IA.
        </p>
      </header>

      <ReportesClient reportes={reportes} />
    </div>
  );
}

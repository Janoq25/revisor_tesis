import React from 'react';
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';
import ReportesClient from '../reportes/ReportesClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ReportesPage() {
  // Obtener el usuario autenticado
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch only the user's tesis
  const tesisRecords = await prisma.tesis.findMany({
    where: { usuarioId: user.id },
    include: { revision: true },
    orderBy: { createdAt: 'desc' },
  });

  // Map the database records to the format expected by the client
  const reportes = tesisRecords.map((t) => ({
    id: t.id,
    titulo: t.titulo,
    autor: t.autor,
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
          Historial completo de todas tus tesis procesadas por el sistema IA.
        </p>
      </header>

      <ReportesClient reportes={reportes} />
    </div>
  );
}

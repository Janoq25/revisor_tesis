import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase-server';
import DetalleClient from './DetalleClient';

export default async function DetalleReportePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Obtener el usuario autenticado
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }
  
  const tesis = await prisma.tesis.findUnique({
    where: { id },
    include: { revision: true }
  });

  if (!tesis) {
    return notFound();
  }

  // Verificar que la tesis pertenece al usuario autenticado
  if (tesis.usuarioId !== user.id) {
    return notFound();
  }

  // Parse observaciones
  let observaciones = [];
  if (tesis.revision?.observaciones) {
    try {
      observaciones = typeof tesis.revision.observaciones === 'string' 
        ? JSON.parse(tesis.revision.observaciones) 
        : tesis.revision.observaciones;
      
      if (!Array.isArray(observaciones)) {
        observaciones = [observaciones];
      }
    } catch (e) {
      console.error("Failed to parse observaciones", e);
    }
  }

  const puntuacion = tesis.revision?.puntuacionGeneral || 0;
  
  // Transform DB data to expected format
  const reporteData = {
    id: tesis.id,
    tesis: {
      titulo: tesis.titulo,
      autor: tesis.autor,
      fecha: tesis.createdAt.toISOString().split('T')[0],
      archivo: tesis.archivoNombre || 'Archivo no especificado',
      tiempoProcesamiento: tesis.revision?.tiempoProcesamiento || 0
    },
    evaluacion: {
      estado: tesis.revision?.estadoGeneral || (tesis.estado === 'ERROR' ? 'Error' : tesis.estado),
      puntuacion: puntuacion,
      porcentajeCumplimiento: `${puntuacion}%`,
      escalaVigesimal: `${Math.round(puntuacion / 5)}/20`,
      calificacion: puntuacion >= 65 ? "Buena" : puntuacion >= 50 ? "Regular" : "Observada"
    },
    observaciones
  };

  return <DetalleClient reporte={reporteData} />;
}

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DetalleClient from './DetalleClient';

export default async function DetalleReportePage({ params }: { params: Promise<{ id: string }> }) {
  // En Next.js 15+ params es una promesa. Si es Next.js 14, params es sincrono, pero hacer await params.id es seguro en ambos
  const { id } = await params;
  
  const tesis = await prisma.tesis.findUnique({
    where: { id },
    include: { revision: true }
  });

  if (!tesis) {
    return notFound();
  }

  // Parse observaciones
  let observaciones = [];
  if (tesis.revision?.observaciones) {
    try {
      // Prisma returns Json, which could be an object, string, or array.
      observaciones = typeof tesis.revision.observaciones === 'string' 
        ? JSON.parse(tesis.revision.observaciones) 
        : tesis.revision.observaciones;
      
      // Asegurarse de que sea un array
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

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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

    const tesis = await prisma.tesis.findUnique({
      where: { id },
      include: { revision: true }
    });

    if (!tesis) {
      return NextResponse.json({ error: 'Tesis no encontrada' }, { status: 404 });
    }

    // Verificar que la tesis pertenece al usuario autenticado
    if (tesis.usuarioId !== user.id) {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    // Prepare data
    const puntuacion = tesis.revision?.puntuacionGeneral || 0;
    const estado = tesis.revision?.estadoGeneral || tesis.estado;
    const escalaVigesimal = `${Math.round(puntuacion / 5)}/20`;

    let observaciones = [];
    if (tesis.revision?.observaciones) {
      try {
        observaciones = typeof tesis.revision.observaciones === 'string' 
          ? JSON.parse(tesis.revision.observaciones) 
          : tesis.revision.observaciones;
        if (!Array.isArray(observaciones)) observaciones = [observaciones];
      } catch (e) {}
    }

    // Generate HTML
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte de Revisión - ${tesis.titulo}</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 40px; color: #333; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo-placeholder { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .title { font-size: 28px; font-weight: bold; margin: 0 0 10px 0; }
        .subtitle { font-size: 18px; color: #666; margin: 0; }
        
        .summary-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; display: table; width: 100%; box-sizing: border-box; }
        .summary-item { display: table-cell; width: 50%; padding: 10px; vertical-align: top; }
        .summary-label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block; margin-bottom: 5px; }
        .summary-value { font-size: 16px; font-weight: 500; margin: 0; }
        
        .score-section { text-align: center; margin-bottom: 40px; }
        .score-circle { display: inline-block; width: 120px; height: 120px; border-radius: 50%; background-color: ${puntuacion >= 65 ? '#dcfce7' : '#fef9c3'}; border: 4px solid ${puntuacion >= 65 ? '#22c55e' : '#eab308'}; line-height: 120px; font-size: 36px; font-weight: bold; color: ${puntuacion >= 65 ? '#166534' : '#854d0e'}; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; margin-top: 15px; font-size: 14px; background-color: #1e293b; color: white; }
        
        h2 { border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; margin-top: 40px; color: #0f172a; }
        
        .observation { margin-bottom: 25px; padding: 15px; border-left: 4px solid #cbd5e1; background-color: #f8fafc; page-break-inside: avoid; }
        .obs-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .obs-section { font-weight: bold; font-size: 16px; color: #0f172a; }
        .obs-status { font-size: 12px; font-weight: bold; padding: 3px 8px; border-radius: 4px; background-color: #e2e8f0; color: #475569; }
        .obs-comment { margin: 0 0 10px 0; color: #334155; }
        .obs-suggestion { background-color: #eff6ff; padding: 10px; border-radius: 4px; font-size: 14px; margin: 0; border-left: 2px solid #3b82f6; }
        .suggestion-label { font-weight: bold; color: #1d4ed8; display: block; margin-bottom: 5px; font-size: 12px; text-transform: uppercase; }
        
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-placeholder">UNIVERSIDAD NACIONAL DE TRUJILLO</div>
        <h1 class="title">Reporte de Revisión Académica</h1>
        <p class="subtitle">Evaluación Asistida por IA - Escuela de Ingeniería de Sistemas</p>
      </div>

      <div class="summary-box">
        <div class="summary-item">
          <span class="summary-label">Título del Proyecto</span>
          <p class="summary-value">${tesis.titulo}</p>
          <br>
          <span class="summary-label">Autor</span>
          <p class="summary-value">${tesis.autor}</p>
        </div>
        <div class="summary-item">
          <span class="summary-label">Fecha de Evaluación</span>
          <p class="summary-value">${tesis.createdAt.toLocaleDateString('es-PE')} ${tesis.createdAt.toLocaleTimeString('es-PE')}</p>
          <br>
          <span class="summary-label">Archivo Analizado</span>
          <p class="summary-value">${tesis.archivoNombre || 'Documento Original'}</p>
        </div>
      </div>

      <div class="score-section">
        <div class="score-circle">${puntuacion}/100</div>
        <br>
        <div class="status-badge">${estado}</div>
        <p style="margin-top: 10px; color: #475569;">Nota Vigesimal Referencial: <strong>${escalaVigesimal}</strong></p>
      </div>

      <h2>Resultados del Análisis por Sección</h2>
      
      ${observaciones.length > 0 ? observaciones.map((obs: any) => `
        <div class="observation">
          <div class="obs-header">
            <span class="obs-section">${obs.seccion || 'General'}</span>
            <span class="obs-status">${obs.estado || 'Revisado'}</span>
          </div>
          <p class="obs-comment">${obs.comentario || 'Sin comentarios adicionales.'}</p>
          ${obs.sugerencia && obs.sugerencia.trim() !== '' ? `
            <div class="obs-suggestion">
              <span class="suggestion-label">Sugerencia de Mejora</span>
              ${obs.sugerencia}
            </div>
          ` : ''}
        </div>
      `).join('') : '<p>No se encontraron observaciones detalladas para esta revisión.</p>'}

      <div class="footer">
        <p>Este reporte ha sido generado automáticamente por el Sistema de Revisión de Tesis de la UNT.</p>
        <p>Documento de referencia: EsquemaPT.docx | ID de Revisión: ${tesis.id}</p>
      </div>
    </body>
    </html>
    `;

    // Send to Gotenberg
    // En Node.js environment (Next.js backend)
    const formData = new FormData();
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    formData.append('files', htmlBlob, 'index.html');

    const gotenbergUrl = 'http://localhost:3001/forms/chromium/convert/html';
    
    console.log("Requesting PDF from Gotenberg at", gotenbergUrl);
    const pdfResponse = await fetch(gotenbergUrl, {
      method: 'POST',
      body: formData,
    });

    if (!pdfResponse.ok) {
      const errText = await pdfResponse.text();
      console.error("Gotenberg Error:", errText);
      throw new Error(`Error en Gotenberg: ${pdfResponse.status} ${errText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Return the PDF to the client
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Reporte_Revision_${tesis.autor.replace(/\s+/g, '_')}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: 'Error generando el PDF', details: error.message }, { status: 500 });
  }
}

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, CheckCircle, AlertTriangle, XOctagon, FileText, Calendar, Clock, LayoutList } from 'lucide-react';

type Observacion = {
  seccion: string;
  estado: string;
  comentario: string;
  sugerencia?: string;
};

type ReporteData = {
  id: string;
  tesis: {
    titulo: string;
    autor: string;
    fecha: string;
    archivo: string;
    tiempoProcesamiento: number;
  };
  evaluacion: {
    estado: string;
    puntuacion: number;
    porcentajeCumplimiento: string;
    escalaVigesimal: string;
    calificacion: string;
  };
  observaciones: Observacion[];
};

function StatusBadge({ estado }: { estado: string }) {
  const estadoLower = estado?.toLowerCase() || '';
  if (estadoLower === 'ok' || estadoLower === 'aprobado' || estadoLower === 'completado') {
    return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14} /> {estado}</span>;
  }
  if (estadoLower === 'incompleto' || estadoLower === 'con errores' || estadoLower === 'observado' || estadoLower === 'procesando') {
    return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={14} /> {estado}</span>;
  }
  if (estadoLower === 'ausente' || estadoLower === 'rechazado' || estadoLower === 'error') {
    return <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><XOctagon size={14} /> {estado}</span>;
  }
  return <span className="badge badge-default">{estado}</span>;
}

export default function DetalleClient({ reporte }: { reporte: ReporteData }) {
  const [activeTab, setActiveTab] = useState('resumen');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    // Usamos window.open para desencadenar la descarga en una nueva pestaña
    window.open(`/api/reportes/${reporte.id}/pdf`, '_blank');
    setTimeout(() => setIsDownloading(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "2rem" }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/reportes" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>
          <ArrowLeft size={20} />
          <span>Volver a Reportes</span>
        </Link>
        <button 
          className="btn btn-primary" 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
        >
          {isDownloading ? (
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               Generando PDF...
             </span>
          ) : (
            <>
              <Download size={18} />
              Descargar PDF Formal
            </>
          )}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>
        {/* Left Column: Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Detalles del Documento</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Título</span>
                <p style={{ fontWeight: 500, lineHeight: 1.4, marginTop: '0.25rem' }}>{reporte.tesis.titulo}</p>
              </div>
              
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Autor</span>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {reporte.tesis.autor.charAt(0).toUpperCase()}
                  </span>
                  {reporte.tesis.autor}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha de Carga</span>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    <Calendar size={14} color="#94a3b8" />
                    {reporte.tesis.fecha}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>T. Procesamiento</span>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    <Clock size={14} color="#94a3b8" />
                    {reporte.tesis.tiempoProcesamiento}s
                  </p>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Archivo Original</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.875rem' }}>
                  <FileText size={16} color="var(--accent)" />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reporte.tesis.archivo}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '1rem' }}>Veredicto de la IA</h3>
            
            <div style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
              <StatusBadge estado={reporte.evaluacion.estado} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '0.25rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '4rem', fontWeight: 'bold', lineHeight: 1, color: reporte.evaluacion.puntuacion >= 65 ? 'var(--success)' : 'var(--warning)' }}>
                {reporte.evaluacion.puntuacion}
              </span>
              <span style={{ fontSize: '1.5rem', color: '#94a3b8', paddingBottom: '0.5rem' }}>/100</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Nota Vigesimal</span>
                <p style={{ fontWeight: 'bold' }}>{reporte.evaluacion.escalaVigesimal}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Calificación</span>
                <p style={{ fontWeight: 'bold' }}>{reporte.evaluacion.calificacion}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Observations */}
        <div className="glass-card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1rem' }}>
            <button 
              onClick={() => setActiveTab('resumen')}
              style={{ 
                padding: '1.25rem 1.5rem', 
                background: 'none', 
                border: 'none', 
                color: activeTab === 'resumen' ? 'var(--primary)' : '#94a3b8',
                fontWeight: activeTab === 'resumen' ? 600 : 400,
                borderBottom: `2px solid ${activeTab === 'resumen' ? 'var(--primary)' : 'transparent'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <LayoutList size={18} />
              Lista de Verificación
            </button>
            <button 
              onClick={() => setActiveTab('pdf')}
              style={{ 
                padding: '1.25rem 1.5rem', 
                background: 'none', 
                border: 'none', 
                color: activeTab === 'pdf' ? 'var(--primary)' : '#94a3b8',
                fontWeight: activeTab === 'pdf' ? 600 : 400,
                borderBottom: `2px solid ${activeTab === 'pdf' ? 'var(--primary)' : 'transparent'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FileText size={18} />
              Reporte Original
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
            {activeTab === 'resumen' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Resultados del Análisis por Sección</h3>
                <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                  El sistema ha evaluado el documento contrastándolo con el <strong>EsquemaPT.docx</strong> oficial de la UNT. A continuación se detallan las observaciones encontradas:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reporte.observaciones && reporte.observaciones.length > 0 ? (
                    reporte.observaciones.map((obs, idx) => (
                      <div key={idx} style={{ 
                        padding: '1.5rem', 
                        backgroundColor: 'rgba(255,255,255,0.02)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ fontSize: '1.125rem', margin: 0 }}>{obs.seccion || 'Observación'}</h4>
                          <StatusBadge estado={obs.estado} />
                        </div>
                        
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comentario del Revisor IA</span>
                          <p style={{ marginTop: '0.25rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                            {obs.comentario}
                          </p>
                        </div>

                        {obs.sugerencia && obs.sugerencia.trim() !== '' && (
                          <div style={{ 
                            marginTop: '0.5rem', 
                            padding: '1rem', 
                            backgroundColor: 'rgba(59, 130, 246, 0.05)', 
                            borderLeft: '4px solid var(--primary)',
                            borderRadius: '4px'
                          }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Sugerencia de Mejora</span>
                            <p style={{ marginTop: '0.25rem', color: '#e2e8f0', fontSize: '0.875rem', lineHeight: 1.5 }}>
                              {obs.sugerencia}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No hay observaciones detalladas para esta revisión.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', gap: '1rem' }}>
                <FileText size={64} opacity={0.5} />
                <p>El reporte PDF original generado por n8n estará disponible aquí.</p>
                <button className="btn btn-outline" style={{ marginTop: '1rem' }}>
                  Ver JSON de respuesta en crudo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

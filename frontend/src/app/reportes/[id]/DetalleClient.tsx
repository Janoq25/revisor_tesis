"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, CheckCircle, AlertTriangle, XOctagon, FileText, Calendar, Clock, LayoutList, Loader2 } from 'lucide-react';

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
    return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={12} />{estado}</span>;
  }
  if (['incompleto', 'con errores', 'observado', 'procesando'].includes(estadoLower)) {
    return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><AlertTriangle size={12} />{estado}</span>;
  }
  if (['ausente', 'rechazado', 'error'].includes(estadoLower)) {
    return <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><XOctagon size={12} />{estado}</span>;
  }
  return <span className="badge badge-default">{estado}</span>;
}

function ObservacionCard({ obs, idx }: { obs: Observacion; idx: number }) {
  const estadoLower = obs.estado?.toLowerCase() || '';
  const isOk = estadoLower === 'ok' || estadoLower === 'aprobado';
  const isError = estadoLower === 'ausente' || estadoLower === 'error' || estadoLower === 'rechazado';
  const accentColor = isOk ? '#1abc9c' : isError ? '#ef4444' : '#f59e0b';

  return (
    <div style={{
      padding: '1.25rem',
      backgroundColor: 'white',
      border: '1px solid var(--border)',
      borderLeft: `4px solid ${accentColor}`,
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'}
    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>{obs.seccion || `Observación ${idx + 1}`}</h4>
        <StatusBadge estado={obs.estado} />
      </div>

      <div>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Comentario del Revisor IA
        </span>
        <p style={{ marginTop: '0.35rem', color: '#475569', lineHeight: 1.6, fontSize: '0.875rem' }}>
          {obs.comentario}
        </p>
      </div>

      {obs.sugerencia && obs.sugerencia.trim() !== '' && (
        <div style={{
          padding: '0.875rem 1rem',
          backgroundColor: 'rgba(26, 188, 156, 0.06)',
          border: '1px solid rgba(26, 188, 156, 0.25)',
          borderLeft: '4px solid var(--primary)',
          borderRadius: '8px',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Sugerencia de Mejora
          </span>
          <p style={{ marginTop: '0.35rem', color: '#475569', fontSize: '0.85rem', lineHeight: 1.6 }}>
            {obs.sugerencia}
          </p>
        </div>
      )}
    </div>
  );
}

export default function DetalleClient({ reporte }: { reporte: ReporteData }) {
  const [activeTab, setActiveTab] = useState('resumen');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    window.open(`/api/reportes/${reporte.id}/pdf`, '_blank');
    setTimeout(() => setIsDownloading(false), 2000);
  };

  const scoreColor = reporte.evaluacion.puntuacion >= 65 ? '#1abc9c' : reporte.evaluacion.puntuacion >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "2rem" }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href="/reportes" style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--text-muted)', textDecoration: 'none',
          fontSize: '0.875rem', fontWeight: 500,
          transition: 'color 0.2s',
        }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={18} />
          Volver a Reportes
        </Link>
        <button
          className="btn btn-primary"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isDownloading ? 0.75 : 1 }}
        >
          {isDownloading
            ? <><Loader2 size={16} className="animate-spin" />Generando PDF...</>
            : <><Download size={16} />Descargar PDF</>
          }
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Document Info Card */}
          <div className="clean-card">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              Detalles del Documento
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Título</span>
                <p style={{ fontWeight: 600, lineHeight: 1.5, marginTop: '0.3rem', color: '#1e293b', fontSize: '0.875rem' }}>{reporte.tesis.titulo}</p>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Autor</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.3rem' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--primary-gradient)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: 'white'
                  }}>
                    {reporte.tesis.autor.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 500 }}>{reporte.tesis.autor}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Fecha</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.3rem' }}>
                    <Calendar size={13} color="#94a3b8" />
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>{reporte.tesis.fecha}</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Tiempo</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.3rem' }}>
                    <Clock size={13} color="#94a3b8" />
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>{reporte.tesis.tiempoProcesamiento}s</span>
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Archivo</span>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem',
                  padding: '0.5rem 0.75rem', backgroundColor: '#F8FAFC',
                  border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem'
                }}>
                  <FileText size={14} color="var(--primary)" />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#475569' }}>{reporte.tesis.archivo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Score Card */}
          <div className="clean-card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1.25rem' }}>Veredicto de la IA</h3>

            <div style={{ marginBottom: '1.25rem' }}>
              <StatusBadge estado={reporte.evaluacion.estado} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1, color: scoreColor, fontFamily: 'var(--font-poppins), sans-serif' }}>
                {reporte.evaluacion.puntuacion}
              </span>
              <span style={{ fontSize: '1.5rem', color: '#94a3b8', fontWeight: 400 }}>/100</span>
            </div>

            {/* Score bar full width */}
            <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, reporte.evaluacion.puntuacion))}%`,
                background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}99)`,
                borderRadius: '4px',
                transition: 'width 1s ease',
              }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'left' }}>
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nota</span>
                <p style={{ fontWeight: 700, color: '#1e293b', margin: '0.2rem 0 0', fontSize: '1.1rem' }}>{reporte.evaluacion.escalaVigesimal}</p>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoría</span>
                <p style={{ fontWeight: 700, color: '#1e293b', margin: '0.2rem 0 0', fontSize: '0.95rem' }}>{reporte.evaluacion.calificacion}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="clean-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.5rem', gap: '0.5rem' }}>
            {[
              { key: 'resumen', label: 'Lista de Verificación', icon: LayoutList },
              { key: 'pdf', label: 'Reporte Original', icon: FileText },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '1.1rem 0.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === key ? 'var(--primary)' : 'transparent'}`,
                  color: activeTab === key ? 'var(--primary)' : '#94a3b8',
                  fontWeight: activeTab === key ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  marginBottom: '-1px',
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '1.75rem', maxHeight: '75vh', overflowY: 'auto' }}>
            {activeTab === 'resumen' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>Resultados por Sección</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
                    Evaluación contrastada con el <strong style={{ color: '#475569' }}>EsquemaPT.docx</strong> oficial de la UNT.
                  </p>
                </div>

                {reporte.observaciones && reporte.observaciones.length > 0 ? (
                  reporte.observaciones.map((obs, idx) => (
                    <ObservacionCard key={idx} obs={obs} idx={idx} />
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <CheckCircle size={40} color="#e2e8f0" style={{ marginBottom: '0.75rem' }} />
                    <p style={{ margin: 0 }}>No hay observaciones para esta revisión.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#94a3b8', gap: '1rem', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(26,188,156,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={32} color="var(--primary)" />
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>El reporte PDF generado por n8n estará disponible aquí.</p>
                <button className="btn btn-outline" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  Ver JSON en crudo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

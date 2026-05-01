"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, CheckCircle, AlertTriangle, XOctagon, FileText, Calendar, Clock, LayoutList } from 'lucide-react';

// Mock data (será reemplazado por la API)
const mockReporte = {
  id: '1',
  tesis: {
    titulo: 'Sistema web para control de inventarios usando Arquitectura Limpia',
    autor: 'Juan Pérez',
    fecha: '2026-04-28',
    archivo: 'tesis_juan_perez.pdf',
    tiempoProcesamiento: 45 // segundos
  },
  evaluacion: {
    estado: 'Observado',
    puntuacion: 65,
    porcentajeCumplimiento: "65%",
    escalaVigesimal: "13/20",
    calificacion: "Buena"
  },
  observaciones: [
    {
      seccion: "Carátula",
      estado: "OK",
      comentario: "Cumple con todos los requisitos formales.",
      sugerencia: ""
    },
    {
      seccion: "Introducción",
      estado: "Con errores",
      comentario: "La realidad problemática no está descrita de lo general a lo específico.",
      sugerencia: "Reestructurar los primeros tres párrafos para comenzar por el contexto global antes de llegar a la empresa específica."
    },
    {
      seccion: "Marco Teórico",
      estado: "Incompleto",
      comentario: "Falta detallar al menos 3 metodologías alternativas.",
      sugerencia: "Agregar subsecciones comparando Scrum, RUP y Kanban antes de justificar la elección."
    },
    {
      seccion: "Referencias",
      estado: "Con errores",
      comentario: "Hay 20 referencias, el mínimo exigido es 25. Varias no cumplen con APA 7.",
      sugerencia: "Añadir 5 referencias recientes (últimos 5 años) y corregir el formato de las citas web."
    }
  ]
};

function StatusBadge({ estado }: { estado: string }) {
  switch (estado) {
    case 'OK':
    case 'Aprobado':
      return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14} /> {estado}</span>;
    case 'Incompleto':
    case 'Con errores':
    case 'Observado':
      return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={14} /> {estado}</span>;
    case 'Ausente':
    case 'Rechazado':
      return <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><XOctagon size={14} /> {estado}</span>;
    default:
      return <span className="badge badge-default">{estado}</span>;
  }
}

export default function DetalleReportePage() {
  const params = useParams();
  const id = params.id;
  const [activeTab, setActiveTab] = useState('resumen');

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "2rem" }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/reportes" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>
          <ArrowLeft size={20} />
          <span>Volver a Reportes</span>
        </Link>
        <button className="btn btn-primary">
          <Download size={18} />
          Descargar PDF Formal
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
                <p style={{ fontWeight: 500, lineHeight: 1.4, marginTop: '0.25rem' }}>{mockReporte.tesis.titulo}</p>
              </div>
              
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Autor</span>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {mockReporte.tesis.autor.charAt(0)}
                  </div>
                  {mockReporte.tesis.autor}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha de Carga</span>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    <Calendar size={14} color="#94a3b8" />
                    {mockReporte.tesis.fecha}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>T. Procesamiento</span>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    <Clock size={14} color="#94a3b8" />
                    {mockReporte.tesis.tiempoProcesamiento}s
                  </p>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Archivo Original</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.875rem' }}>
                  <FileText size={16} color="var(--accent)" />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mockReporte.tesis.archivo}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '1rem' }}>Veredicto de la IA</h3>
            
            <div style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
              <StatusBadge estado={mockReporte.evaluacion.estado} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '0.25rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '4rem', fontWeight: 'bold', lineHeight: 1, color: mockReporte.evaluacion.puntuacion >= 65 ? 'var(--success)' : 'var(--warning)' }}>
                {mockReporte.evaluacion.puntuacion}
              </span>
              <span style={{ fontSize: '1.5rem', color: '#94a3b8', paddingBottom: '0.5rem' }}>/100</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Nota Vigesimal</span>
                <p style={{ fontWeight: 'bold' }}>{mockReporte.evaluacion.escalaVigesimal}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Calificación</span>
                <p style={{ fontWeight: 'bold' }}>{mockReporte.evaluacion.calificacion}</p>
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
                  {mockReporte.observaciones.map((obs, idx) => (
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
                        <h4 style={{ fontSize: '1.125rem', margin: 0 }}>{obs.seccion}</h4>
                        <StatusBadge estado={obs.estado} />
                      </div>
                      
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comentario del Revisor IA</span>
                        <p style={{ marginTop: '0.25rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                          {obs.comentario}
                        </p>
                      </div>

                      {obs.sugerencia && (
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
                  ))}
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

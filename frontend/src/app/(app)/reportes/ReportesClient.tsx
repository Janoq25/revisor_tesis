"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, FileText, CheckCircle, AlertTriangle, XOctagon, Eye, Download } from 'lucide-react';

type Reporte = {
  id: string;
  titulo: string;
  autor: string;
  estado: string;
  puntuacion: number;
  fecha: string;
};

function StatusBadge({ estado }: { estado: string }) {
  const estadoLower = estado.toLowerCase();
  if (estadoLower === 'aprobado' || estadoLower === 'completado') {
    return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={12} />{estado}</span>;
  }
  if (estadoLower === 'observado' || estadoLower === 'procesando') {
    return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><AlertTriangle size={12} />{estado}</span>;
  }
  if (estadoLower === 'rechazado' || estadoLower === 'error') {
    return <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><XOctagon size={12} />{estado}</span>;
  }
  return <span className="badge badge-default">{estado}</span>;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 65 ? '#1abc9c' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ flex: 1, height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', maxWidth: '80px' }}>
        <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, score))}%`, backgroundColor: color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: color, minWidth: '32px' }}>{score}</span>
    </div>
  );
}

export default function ReportesClient({ reportes }: { reportes: Reporte[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReportes = reportes.filter(r =>
    r.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.autor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="clean-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          backgroundColor: '#F8FAFC',
          border: '1px solid var(--border)',
          borderRadius: '9999px',
          padding: '0.5rem 1.25rem',
          width: '300px',
          transition: 'border-color 0.2s',
        }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <Search size={16} color="#94a3b8" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar tesis o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent', border: 'none', color: '#334155',
              outline: 'none', width: '100%', fontSize: '0.875rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}>Filtrar</button>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.45rem 1rem' }}>
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
              {['Título de Tesis', 'Autor', 'Fecha', 'Puntuación', 'Estado', ''].map((h, i) => (
                <th key={i} style={{
                  padding: '0.875rem 1.25rem',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em',
                  textAlign: i === 5 ? 'right' : 'left',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredReportes.map((reporte, idx) => (
              <tr
                key={reporte.id}
                style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s', cursor: 'default' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                      background: 'rgba(26, 188, 156, 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <FileText size={16} color="var(--primary)" />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>
                      {reporte.titulo}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#64748b' }}>
                  {reporte.autor}
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  {reporte.fecha}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <ScoreBar score={reporte.puntuacion} />
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <StatusBadge estado={reporte.estado} />
                </td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <Link
                    href={`/reportes/${reporte.id}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.4rem 1rem', borderRadius: '9999px',
                      border: '1px solid var(--border)', background: 'white',
                      color: '#334155', fontSize: '0.8rem', fontWeight: 500,
                      textDecoration: 'none', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.color = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = '#334155';
                    }}
                  >
                    <Eye size={14} /> Ver detalle
                  </Link>
                </td>
              </tr>
            ))}

            {filteredReportes.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                  No se encontraron reportes que coincidan con tu búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

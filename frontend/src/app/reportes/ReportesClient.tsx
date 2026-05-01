"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, FileText, CheckCircle, AlertTriangle, XOctagon, Eye } from 'lucide-react';

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
    return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14} /> {estado}</span>;
  }
  if (estadoLower === 'observado' || estadoLower === 'procesando') {
    return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={14} /> {estado}</span>;
  }
  if (estadoLower === 'rechazado' || estadoLower === 'error') {
    return <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><XOctagon size={14} /> {estado}</span>;
  }
  return <span className="badge badge-default">{estado}</span>;
}

export default function ReportesClient({ reportes }: { reportes: Reporte[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredReportes = reportes.filter(r => 
    r.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.autor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-card">
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          width: '300px'
        }}>
          <Search size={18} color="#94a3b8" style={{ marginRight: '0.5rem' }} />
          <input 
            type="text" 
            placeholder="Buscar tesis o autor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" style={{ padding: '0.5rem' }}>Filtrar</button>
          <button className="btn btn-outline" style={{ padding: '0.5rem' }}>Exportar CSV</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: '#94a3b8', fontSize: '0.875rem' }}>
              <th style={{ padding: '1rem' }}>Título de Tesis</th>
              <th style={{ padding: '1rem' }}>Autor</th>
              <th style={{ padding: '1rem' }}>Fecha</th>
              <th style={{ padding: '1rem' }}>Puntuación</th>
              <th style={{ padding: '1rem' }}>Estado</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReportes.map((reporte) => (
              <tr key={reporte.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s', ':hover': { backgroundColor: 'rgba(255,255,255,0.02)' } } as any}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={16} color="var(--primary)" />
                    {reporte.titulo}
                  </div>
                </td>
                <td style={{ padding: '1rem', color: '#cbd5e1' }}>{reporte.autor}</td>
                <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>{reporte.fecha}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '60px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${Math.min(100, Math.max(0, reporte.puntuacion))}%`,
                        backgroundColor: reporte.puntuacion >= 65 ? 'var(--success)' : reporte.puntuacion >= 50 ? 'var(--warning)' : 'var(--error)'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{reporte.puntuacion}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <StatusBadge estado={reporte.estado} />
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <Link href={`/reportes/${reporte.id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                    <Eye size={14} style={{ marginRight: '0.25rem' }} /> Ver Detalle
                  </Link>
                </td>
              </tr>
            ))}
            
            {filteredReportes.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
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

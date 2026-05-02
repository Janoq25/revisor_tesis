"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertTriangle, XOctagon, Clock, UploadCloud } from 'lucide-react';

type TesisQueueItem = {
  id: string;
  titulo: string;
  autor: string;
  estado: string;
  createdAt: string;
};

function getStatusBadge(estado: string) {
  switch (estado) {
    case 'EN_COLA':
      return <span className="badge badge-warning">En Cola</span>;
    case 'PROCESANDO':
      return <span className="badge badge-info">Procesando</span>;
    case 'COMPLETADO':
      return <span className="badge badge-success">Completado</span>;
    case 'ERROR':
      return <span className="badge badge-error">Error</span>;
    default:
      return <span className="badge badge-default">{estado}</span>;
  }
}

export function QueueTable({ refreshTrigger }: { refreshTrigger: number }) {
  const [queue, setQueue] = useState<TesisQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue');
      const json = await res.json();
      if (json.success) setQueue(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  return (
    <div className="clean-card" style={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>Cola de Procesamiento</h3>
        {loading ? (
          <span className="badge badge-default" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Loader2 size={12} className="animate-spin" /> Actualizando
          </span>
        ) : (
          <span className="badge badge-success">Activo</span>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {queue.length === 0 && !loading ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
            color: "var(--text-muted)",
            textAlign: "center",
            gap: "0.5rem"
          }}>
            <UploadCloud size={36} color="#cbd5e1" />
            <p style={{ fontSize: '0.875rem', margin: 0 }}>No hay tesis en cola</p>
            <p style={{ fontSize: '0.8rem', margin: 0, color: '#94a3b8' }}>Sube un documento para comenzar.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {queue.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '0.875rem 1rem',
                  backgroundColor: '#FAFAFA',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: item.estado === 'PROCESANDO' ? '0 2px 12px rgba(26, 188, 156, 0.12)' : 'none',
                  borderLeft: item.estado === 'PROCESANDO' ? '3px solid var(--primary)' : '1px solid var(--border)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'; e.currentTarget.style.backgroundColor = 'white'; }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = item.estado === 'PROCESANDO' ? '0 2px 12px rgba(26,188,156,0.12)' : 'none';
                  e.currentTarget.style.backgroundColor = '#FAFAFA';
                }}
              >
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                    {item.titulo}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                    {item.autor}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, paddingLeft: '1rem' }}>
                  {getStatusBadge(item.estado)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

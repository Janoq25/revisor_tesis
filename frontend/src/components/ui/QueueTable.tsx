"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertTriangle, XOctagon } from 'lucide-react';

type TesisQueueItem = {
  id: string;
  titulo: string;
  autor: string;
  estado: string;
  createdAt: string;
};

export function QueueTable({ refreshTrigger }: { refreshTrigger: number }) {
  const [queue, setQueue] = useState<TesisQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue');
      const json = await res.json();
      if (json.success) {
        setQueue(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Auto refresh every 5 seconds
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  function getStatusIcon(estado: string) {
    switch (estado) {
      case 'EN_COLA': return <Loader2 size={16} className="animate-spin text-warning" />;
      case 'PROCESANDO': return <Loader2 size={16} className="animate-spin text-primary" />;
      case 'COMPLETADO': return <CheckCircle size={16} className="text-success" />;
      case 'ERROR': return <XOctagon size={16} className="text-error" />;
      default: return <AlertTriangle size={16} className="text-warning" />;
    }
  }

  return (
    <div className="glass-card" style={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: 0 }}>Cola de Procesamiento</h3>
        {loading ? (
          <span className="badge badge-default"><Loader2 size={12} className="animate-spin" style={{ display: 'inline', marginRight: '4px' }} /> Actualizando...</span>
        ) : (
          <span className="badge badge-success">Actualizado</span>
        )}
      </div>
      
      <div style={{ flex: 1, overflowY: "auto" }}>
        {queue.length === 0 && !loading ? (
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center",
            height: "100%",
            color: "#94a3b8",
            textAlign: "center",
            padding: "2rem"
          }}>
            <p>Las tesis subidas aparecerán aquí.</p>
            <p style={{ fontSize: "0.875rem", opacity: 0.7, marginTop: "0.5rem" }}>
              Sube un documento para comenzar.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {queue.map(item => (
              <div key={item.id} style={{
                padding: '1rem',
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.titulo}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    {item.autor}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, paddingLeft: '1rem' }}>
                  {getStatusIcon(item.estado)}
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{item.estado}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

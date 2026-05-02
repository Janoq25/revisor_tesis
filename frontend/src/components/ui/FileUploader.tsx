"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';

interface FileUploaderProps {
  onUploadSuccess?: () => void;
}

export function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{current: number, total: number, status: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsUploading(true);
    setError(null);
    setSuccess(false);
    setProgress({ current: 0, total: acceptedFiles.length, status: 'Iniciando...' });

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const isLast = i === acceptedFiles.length - 1;

        setProgress({ current: i + 1, total: acceptedFiles.length, status: `Subiendo: ${file.name}` });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('autor', 'Tesista Anónimo');

        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || `Error al subir ${file.name}`);

        if (!isLast) {
          setProgress({
            current: i + 1,
            total: acceptedFiles.length,
            status: `Esperando para el siguiente archivo (evitando límite de tokens)...`
          });
          // Esperamos 45 segundos entre archivos para evitar el Rate Limit de tokens
          await sleep(45000);
        }
      }

      setSuccess(true);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  });

  return (
    <div className="clean-card">
      <h3 style={{ marginBottom: "1.25rem", fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>
        Subir Documento
      </h3>

      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? 'var(--primary)' : '#cbd5e1'}`,
          borderRadius: '16px',
          padding: '3rem 2rem',
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive ? 'rgba(26, 188, 156, 0.05)' : '#F8FAFC',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          opacity: isUploading ? 0.6 : 1
        }}
      >
        <input {...getInputProps()} />

        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: isDragActive ? 'var(--primary-gradient)' : 'rgba(26, 188, 156, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}>
          <UploadCloud size={32} color={isDragActive ? 'white' : 'var(--primary)'} />
        </div>

        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.35rem', color: '#1e293b', fontFamily: "var(--font-poppins), sans-serif", fontWeight: 600 }}>
            {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra tu tesis aquí'}
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            o <span style={{ color: 'var(--primary)', fontWeight: 500, cursor: 'pointer' }}>navega tus archivos</span>
          </p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.75rem', color: '#94a3b8', margin: '0.75rem 0 0' }}>
            PDF, DOCX, TXT · Máx. 50 MB
          </p>
        </div>
      </div>

      {progress && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(26, 188, 156, 0.05)',
          border: '1px solid rgba(26, 188, 156, 0.2)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
              Archivo {progress.current} de {progress.total}
            </span>
            {progress.status.includes('Esperando') ? <Clock size={16} color="var(--primary)" /> : <Loader2 size={16} className="animate-spin" color="var(--primary)" />}
          </div>
          <p style={{ fontSize: '0.875rem', margin: 0, color: '#475569', fontWeight: 500 }}>
            {progress.status}
          </p>
          <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              width: `${(progress.current / progress.total) * 100}%`,
              height: '100%',
              background: 'var(--primary)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '1rem', padding: '0.875rem 1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#d93025' }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.875rem' }}>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ marginTop: '1rem', padding: '0.875rem 1rem', background: 'rgba(16, 185, 129, 0.07)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e8e3e' }}>
          <CheckCircle size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>¡Todos los archivos subidos! La IA los procesará secuencialmente.</span>
        </div>
      )}
    </div>
  );
}

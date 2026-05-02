"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onUploadSuccess?: () => void;
}

export function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    setError(null);
    setSuccess(false);
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('autor', 'Tesista Anónimo');
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Error al subir ${file.name}`);
        return data;
      });
      await Promise.all(uploadPromises);
      setSuccess(true);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
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
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'rgba(26, 188, 156, 0.05)' : '#F8FAFC',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
        onMouseEnter={(e) => {
          if (!isDragActive) {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.backgroundColor = 'rgba(26, 188, 156, 0.03)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragActive) {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.backgroundColor = '#F8FAFC';
          }
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

      {uploading && (
        <div style={{ marginTop: '1rem', padding: '0.875rem 1rem', background: 'rgba(26, 188, 156, 0.07)', border: '1px solid rgba(26, 188, 156, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
          <Loader2 size={18} className="animate-spin" />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Subiendo y encolando para revisión...</span>
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
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>¡Archivo subido! La IA comenzará la revisión en breve.</span>
        </div>
      )}
    </div>
  );
}

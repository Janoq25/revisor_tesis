"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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
      // Create FormData to send the file
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('autor', 'Tesista Anónimo'); // Placeholder para autor

      // Post to our API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir el archivo');
      }

      setSuccess(true);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  return (
    <div className="glass-card" style={{ marginBottom: "2rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>Subir Proyecto de Tesis</h3>
      
      <div 
        {...getRootProps()} 
        style={{
          border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '12px',
          padding: '3rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <input {...getInputProps()} />
        
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          backgroundColor: isDragActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}>
          <UploadCloud size={32} color={isDragActive ? 'white' : 'var(--primary)'} />
        </div>
        
        <div>
          <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo aquí'}
          </h4>
          <p style={{ fontSize: '0.875rem' }}>o haz clic para explorar tus archivos</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.7 }}>
            Soporta: PDF, DOCX, TXT
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {uploading && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
          <Loader2 size={20} className="animate-spin" />
          <span>Subiendo archivo y encolando para revisión...</span>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--error)' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--success)' }}>
          <CheckCircle size={20} />
          <span>Archivo subido con éxito. El sistema de IA ha comenzado la revisión.</span>
        </div>
      )}
    </div>
  );
}

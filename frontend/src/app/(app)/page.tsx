"use client";

import { useState } from "react";
import { FileUploader } from "@/components/ui/FileUploader";
import { QueueTable } from "@/components/ui/QueueTable";

export default function Home() {
  const [refreshQueue, setRefreshQueue] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger a refresh of the queue table
    setRefreshQueue(prev => prev + 1);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ 
          fontFamily: "var(--font-poppins), sans-serif", 
          fontSize: "2rem",
          color: "#1e293b",
          marginBottom: "0.5rem",
          fontWeight: 700,
        }}>
          Subir Tesis
        </h1>
        <p style={{ 
          color: "var(--text-muted)", 
          fontSize: "1rem", 
          maxWidth: "600px",
          lineHeight: "1.6"
        }}>
          Sube los documentos de tesis para su revisión automática con IA. Recibirás un reporte detallado con observaciones y sugerencias.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <FileUploader onUploadSuccess={handleUploadSuccess} />
          
          <div className="clean-card">
            <h3 style={{ 
              marginBottom: "1.25rem", 
              fontSize: "1rem",
              fontWeight: 600,
              color: "#1e293b",
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem",
            }}>
              <span style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center", 
                width: "28px", 
                height: "28px", 
                borderRadius: "50%", 
                background: "var(--primary-gradient)",
                color: "white",
                fontSize: "0.75rem",
                flexShrink: 0,
              }}>✓</span>
              Esquema de Evaluación Activo
            </h3>
            
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {[
                { title: "Estructura Formal", desc: "Revisión de portada, índice, abstract y capítulos.", color: "#1abc9c" },
                { title: "Normas APA 7", desc: "Validación de citas, referencias y formato bibliográfico.", color: "#1dc4e9" },
                { title: "Árbol de Problemas", desc: "Coherencia entre problema, objetivos e hipótesis.", color: "#a78bfa" },
              ].map((schema, idx) => (
                <div key={idx} style={{
                  padding: "0.875rem 1rem",
                  borderRadius: "12px",
                  background: "#F8FAFC",
                  border: "1px solid var(--border)",
                  borderLeft: `4px solid ${schema.color}`,
                  transition: "all 0.2s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'; e.currentTarget.style.background = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#F8FAFC'; }}>
                  <div style={{ color: "#1e293b", fontFamily: "var(--font-poppins), sans-serif", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.2rem" }}>
                    {schema.title}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {schema.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <QueueTable refreshTrigger={refreshQueue} />
        </div>
      </div>
    </div>
  );
}

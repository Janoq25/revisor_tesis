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
        <h1 style={{ color: "var(--foreground)", marginBottom: "0.5rem" }}>
          Upload Space
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1.125rem", maxWidth: "600px" }}>
          Sube los proyectos de tesis para su revisión automática. El sistema extraerá el contenido, lo evaluará usando IA y generará un reporte detallado.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div>
          <FileUploader onUploadSuccess={handleUploadSuccess} />
          
          <div className="glass-card" style={{ marginTop: "2rem" }}>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center", 
                width: "24px", 
                height: "24px", 
                borderRadius: "50%", 
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                color: "var(--primary)",
                fontSize: "0.875rem"
              }}>ℹ</span>
              Esquema de Evaluación Activo
            </h3>
            <p style={{ fontSize: "0.875rem", marginBottom: "0.75rem" }}>
              El sistema utilizará el esquema predeterminado: <strong>UNT Ingeniería de Sistemas</strong>.
            </p>
            <ul style={{ fontSize: "0.875rem", paddingLeft: "1.25rem", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>Estructura formal completa</li>
              <li>Referencias APA 7</li>
              <li>Árbol de Problemas y Objetivos</li>
            </ul>
          </div>
        </div>

        <div>
          <QueueTable refreshTrigger={refreshQueue} />
        </div>
      </div>
    </div>
  );
}

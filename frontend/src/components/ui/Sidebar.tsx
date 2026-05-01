"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, LayoutDashboard, FileText, Settings, BookOpen } from "lucide-react";
import React from "react";

const navItems = [
  { name: "Upload", href: "/", icon: Upload },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Reportes", href: "/reportes", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: "260px",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      backgroundColor: "var(--secondary)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem",
      zIndex: 10
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "3rem" }}>
        <div style={{ 
          background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
          padding: "0.5rem",
          borderRadius: "8px",
          color: "white"
        }}>
          <BookOpen size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.25rem", margin: 0, color: "white" }}>Tesis AI</h2>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Revisor Automático</span>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                color: isActive ? "white" : "#94a3b8",
                backgroundColor: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
                textDecoration: "none",
                fontWeight: isActive ? 500 : 400,
                transition: "all 0.2s ease"
              }}
            >
              <item.icon size={20} color={isActive ? "var(--primary)" : "#94a3b8"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
        <Link 
          href="/configuracion"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            color: "#94a3b8",
            textDecoration: "none",
            transition: "all 0.2s ease"
          }}
        >
          <Settings size={20} />
          Configuración
        </Link>
      </div>
    </aside>
  );
}

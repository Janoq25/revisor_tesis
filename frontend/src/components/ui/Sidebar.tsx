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
      background: "var(--primary)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      padding: "2rem 1.5rem",
      zIndex: 10,
      boxShadow: "4px 0 20px rgba(26, 188, 156, 0.15)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "3rem" }}>
        <div style={{ 
          background: "rgba(255, 255, 255, 0.2)",
          padding: "0.5rem",
          borderRadius: "12px",
          color: "white",
        }}>
          <BookOpen size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.5rem", margin: 0, color: "white", fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}>Tesis AI</h2>
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
                padding: "0.8rem 1.2rem",
                borderRadius: "9999px",
                color: "white",
                backgroundColor: isActive ? "rgba(255, 255, 255, 0.2)" : "transparent",
                textDecoration: "none",
                fontWeight: isActive ? 600 : 500,
                fontFamily: "var(--font-inter), sans-serif",
                transition: "all 0.3s ease",
              }}
            >
              <item.icon size={20} color="white" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--primary)",
          fontFamily: "var(--font-poppins), sans-serif",
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}>
          N
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "white", fontSize: "0.9rem", fontFamily: "var(--font-poppins), sans-serif", fontWeight: 600 }}>Neuromancer</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", fontFamily: "var(--font-inter), sans-serif" }}>Admin</div>
        </div>
        <Settings size={20} color="white" style={{ cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = 'rotate(90deg)'} onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0)'} />
      </div>
    </aside>
  );
}

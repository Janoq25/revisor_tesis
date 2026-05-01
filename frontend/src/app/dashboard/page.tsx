"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, CheckCircle, AlertTriangle, XOctagon, Clock } from 'lucide-react';

// Mock data (será reemplazado por la API luego)
const approvalData = [
  { name: 'Aprobadas', value: 45, color: '#10b981' },
  { name: 'Observadas', value: 30, color: '#f59e0b' },
  { name: 'Rechazadas', value: 10, color: '#ef4444' },
];

const sectionsData = [
  { name: 'Introducción', observaciones: 15 },
  { name: 'Marco Teórico', observaciones: 42 },
  { name: 'Metodología', observaciones: 35 },
  { name: 'Resultados', observaciones: 18 },
  { name: 'Conclusiones', observaciones: 24 },
  { name: 'Referencias', observaciones: 56 },
];

const performanceData = [
  { semana: 'Sem 1', promedio: 65 },
  { semana: 'Sem 2', promedio: 68 },
  { semana: 'Sem 3', promedio: 72 },
  { semana: 'Sem 4', promedio: 70 },
  { semana: 'Sem 5', promedio: 75 },
  { semana: 'Sem 6', promedio: 78 },
];

function KpiCard({ title, value, icon: Icon, colorClass, trend }: any) {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>{title}</h4>
        <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)' }} className={colorClass}>
          <Icon size={20} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>{value}</span>
        {trend && (
          <span style={{ fontSize: '0.875rem', color: trend > 0 ? 'var(--success)' : 'var(--error)' }}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch for recharts

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: "var(--foreground)", marginBottom: "0.5rem" }}>
            Dashboard Analítico
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.125rem" }}>
            Visión general del rendimiento y estadísticas de las revisiones de tesis.
          </p>
        </div>
        <div className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <Activity size={16} />
          <span>Sistema Operativo</span>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <KpiCard title="Total Revisadas" value="85" icon={FileText} trend={12} colorClass="text-primary" />
        <KpiCard title="Tasa de Aprobación" value="53%" icon={CheckCircle} trend={5} colorClass="text-success" />
        <KpiCard title="Observaciones Promedio" value="14.2" icon={AlertTriangle} trend={-2} colorClass="text-warning" />
        <KpiCard title="Tiempo de Proc." value="45s" icon={Clock} colorClass="text-accent" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Donut Chart */}
        <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Estado de Revisiones</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={approvalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {approvalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Frecuencia de Observaciones por Sección</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionsData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} angle={-25} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
                <Bar dataKey="observaciones" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="glass-card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Evolución del Rendimiento Promedio</h3>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="semana" stroke="#94a3b8" />
              <YAxis domain={[0, 100]} stroke="#94a3b8" />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="promedio" stroke="var(--accent)" strokeWidth={3} dot={{ r: 5, fill: 'var(--accent)' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Para usar FileText que no está importado arriba
import { FileText } from 'lucide-react';

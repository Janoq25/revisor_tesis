"use client";

import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Activity, CheckCircle, AlertTriangle, Clock, FileText, TrendingUp, TrendingDown } from 'lucide-react';

export type DashboardData = {
  kpis: {
    totalRevisadas: number;
    tasaAprobacion: string;
    observacionesPromedio: string;
    tiempoPromedio: string;
  };
  approvalData: { name: string; value: number; color: string }[];
  sectionsData: { name: string; observaciones: number }[];
  performanceData?: { label: string; promedio: number }[];
};

const CHART_COLORS = ['#1abc9c', '#1dc4e9', '#a78bfa', '#f59e0b'];

function KpiCard({ title, value, icon: Icon, trend, color }: any) {
  const isPositive = trend > 0;
  return (
    <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>{title}</p>
          <span style={{ fontSize: '2.25rem', fontWeight: 700, color: '#1e293b', lineHeight: 1, fontFamily: 'var(--font-poppins), sans-serif' }}>{value}</span>
        </div>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {isPositive
            ? <TrendingUp size={14} color="#1e8e3e" />
            : <TrendingDown size={14} color="#d93025" />}
          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: isPositive ? '#1e8e3e' : '#d93025' }}>
            {isPositive ? '+' : ''}{trend}% este mes
          </span>
        </div>
      )}
    </div>
  );
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      fontFamily: 'var(--font-inter), sans-serif',
      fontSize: '0.85rem',
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-poppins), sans-serif", fontSize: "2rem", color: "#1e293b", marginBottom: "0.35rem", fontWeight: 700 }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0 }}>
            Visión general del rendimiento y estadísticas de revisiones.
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1.25rem', borderRadius: '9999px',
          background: 'rgba(26, 188, 156, 0.1)',
          border: '1px solid rgba(26, 188, 156, 0.3)',
          color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600
        }}>
          <Activity size={16} />
          <span>Sistema Activo</span>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <KpiCard title="Tesis Revisadas" value={data.kpis.totalRevisadas} icon={FileText} trend={12} color="#1abc9c" />
        <KpiCard title="Tasa de Aprobación" value={`${data.kpis.tasaAprobacion}%`} icon={CheckCircle} trend={2.5} color="#1dc4e9" />
        <KpiCard title="Obs. Promedio" value={data.kpis.observacionesPromedio} icon={AlertTriangle} trend={-5} color="#f59e0b" />
        <KpiCard title="Tiempo de Proc." value={`${data.kpis.tiempoPromedio}s`} icon={Clock} trend={-15} color="#a78bfa" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Donut Chart */}
        <div className="clean-card" style={{ height: '380px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Estado de Revisiones</h3>
          <div style={{ flex: 1, minHeight: 0, minWidth: 0, position: 'relative' }}>
            {data.approvalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.approvalData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                    {data.approvalData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip {...tooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.8rem', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sin datos aún</div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="clean-card" style={{ height: '380px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Observaciones por Sección</h3>
          <div style={{ flex: 1, minHeight: 0, minWidth: 0, position: 'relative' }}>
            {data.sectionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.sectionsData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'var(--font-inter)' }} angle={-20} textAnchor="end" height={55} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <RechartsTooltip {...tooltipStyle} cursor={{ fill: 'rgba(26,188,156,0.05)' }} />
                  <Bar dataKey="observaciones" fill="url(#tealGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1de9b6" />
                      <stop offset="100%" stopColor="#1dc4e9" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sin observaciones</div>
            )}
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="clean-card" style={{ height: '320px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Evolución del Rendimiento Promedio</h3>
        <div style={{ flex: 1, minHeight: 0, minWidth: 0, position: 'relative' }}>
          {(data.performanceData?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.performanceData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <RechartsTooltip {...tooltipStyle} />
                <Line
                  type="monotone" dataKey="promedio" stroke="#1abc9c" strokeWidth={3}
                  dot={{ r: 5, fill: 'white', stroke: '#1abc9c', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: '#1abc9c', stroke: 'white', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Aún no hay datos históricos</div>
          )}
        </div>
      </div>
    </div>
  );
}

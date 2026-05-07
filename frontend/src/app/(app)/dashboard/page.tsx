import React from 'react';
import DashboardClient from '../dashboard/DashboardClient';
import { createClient } from '@/lib/supabase-server';
import { getDashboardData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No autorizado');
    }

    const dashboardData = await getDashboardData(user.id);

    return <DashboardClient data={dashboardData} />;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);

    return <DashboardClient data={{
      kpis: {
        totalRevisadas: 0,
        tasaAprobacion: '0',
        observacionesPromedio: '0',
        tiempoPromedio: '0',
      },
      approvalData: [],
      sectionsData: [],
      performanceData: [],
    }} />;
  }
}

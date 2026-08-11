// src/components/sections/Dashboard.jsx
import React, { useState, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { useDashboardData } from './dashboard/useDashboardData';
import { buildMonthlyRevenueConfig, buildServiceDistributionConfig } from './dashboard/dashboardChartConfigs';
import DashboardHero from './dashboard/DashboardHero';
import DashboardStatsGrid from './dashboard/DashboardStatsGrid';
import RecentTripsTable from './dashboard/RecentTripsTable';
import Loading from '../ui/Loading';

// Dashboard est la vue par defaut d'Admin (reste eager), mais chart.js/auto
// (~207 kB) qu'utilise DashboardChartsSection via ChartCard est isole dans
// son propre chunk : le reste du dashboard (hero, stats, tableau) s'affiche
// immediatement, seule la zone graphiques a un court etat de chargement.
const DashboardChartsSection = lazy(() => import('./dashboard/DashboardChartsSection'));

const Dashboard = ({ showToast }) => {
  const { t, i18n } = useTranslation();
  const [timeRange] = useState('month');
  const { user } = useAuth();

  const { dashboardData, trips, evolutionData, repartitionData } = useDashboardData({ showToast, t });

  // Génération dynamique des configurations de graphiques
  const monthlyRevenueConfig = React.useMemo(
    () => buildMonthlyRevenueConfig(evolutionData, t, i18n),
    [evolutionData, t, i18n.language]
  );

  const serviceDistributionConfig = React.useMemo(
    () => buildServiceDistributionConfig(repartitionData),
    [repartitionData]
  );

  return (
    <div className="space-y-6 pb-8">
      <DashboardHero user={user} t={t} i18n={i18n} />

      <DashboardStatsGrid dashboardData={dashboardData} t={t} />

      <Suspense fallback={<Loading className="min-h-[380px]" size="sm" text="Chargement des graphiques..." />}>
        <DashboardChartsSection
          t={t}
          timeRange={timeRange}
          monthlyRevenueConfig={monthlyRevenueConfig}
          serviceDistributionConfig={serviceDistributionConfig}
        />
      </Suspense>

      <RecentTripsTable trips={trips} t={t} i18n={i18n} />
    </div>
  );
};

export default Dashboard;

import { motion } from 'framer-motion';
import { Users, Car, Route, Wallet } from 'lucide-react';
import StatCard from '../../layout/StatCard';

const DashboardStatsGrid = ({ dashboardData, t }) => {
  const stats = [
    {
      title: t('dashboard.registered_passengers') || 'Passagers Inscrits',
      value: dashboardData?.passagersTotal?.toLocaleString() || '0',
      icon: Users,
      color: 'green',
      trend: 'up',
      percentage: 12,
      progress: 78,
      description: t('dashboard.active_passengers_desc') || `Comptes passagers actifs`,
      iconBg: 'from-emerald-500/20 to-emerald-600/10'
    },
    {
      title: t('dashboard.active_drivers') || 'Chauffeurs Actifs',
      value: dashboardData?.chauffeursActifs?.toLocaleString() || '0',
      icon: Car,
      color: 'blue',
      trend: 'up',
      percentage: 8,
      progress: 65,
      description: t('dashboard.online_drivers_desc') || `Chauffeurs en ligne/validés`,
      iconBg: 'from-blue-500/20 to-blue-600/10'
    },
    {
      title: t('dashboard.trips_completed') || 'Trajets Effectués',
      value: dashboardData?.trajetsEffectues?.toLocaleString() || '0',
      icon: Route,
      color: 'purple',
      trend: 'up',
      percentage: 15,
      progress: 45,
      description: t('dashboard.full_history_desc') || `Historique complet`,
      iconBg: 'from-purple-500/20 to-purple-600/10'
    },
    {
      title: t('dashboard.total_revenue') || 'Revenus Totaux',
      compactValue: true,
      rawValue: dashboardData?.revenusTotal || 0,
      unit: t('common.currency_symbol') || 'GNF',
      icon: Wallet,
      color: 'amber',
      trend: 'up',
      percentage: 5,
      progress: 85,
      description: t('dashboard.collected_revenue_desc') || `Revenus encaissés`,
      iconBg: 'from-amber-500/20 to-amber-600/10'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStatsGrid;

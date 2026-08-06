import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import ChartCard from '../../ui/ChartCard';

const DashboardChartsSection = ({ t, timeRange, monthlyRevenueConfig, serviceDistributionConfig }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <ChartCard
        title={t('dashboard.monthly_revenue') || 'Revenus Mensuels'}
        subtitle={`${t('dashboard.evolution_on') || 'Évolution sur'} ${timeRange === 'month' ? (t('dashboard.the_month') || 'le mois') : (t('dashboard.the_year') || "l'année")}`}
        chartConfig={monthlyRevenueConfig}
        height="320px"
        action={
          <button className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        }
      />
      <ChartCard
        title={t('dashboard.service_distribution') || 'Répartition des Services'}
        subtitle={t('dashboard.by_vehicle_and_zone') || 'Par type de véhicule et zone'}
        chartConfig={serviceDistributionConfig}
        height="320px"
      />
    </motion.div>
  );
};

export default DashboardChartsSection;

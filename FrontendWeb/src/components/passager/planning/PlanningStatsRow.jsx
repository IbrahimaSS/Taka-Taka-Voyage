import { useTranslation } from 'react-i18next';
import { BarChart3, CheckCircle, Clock } from 'lucide-react';
import StatCard from './StatCard';

const PlanningStatsRow = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard label={t('planning.total_trips')} value={stats.totalTrajets} icon={BarChart3} colorClass="bg-gradient-to-r from-blue-500 to-blue-600" />
      <StatCard label={t('planning.confirmed')} value={stats.confirmes} icon={CheckCircle} colorClass="bg-gradient-to-r from-emerald-500 to-emerald-600" />
      <StatCard label={t('planning.pending')} value={stats.enAttente} icon={Clock} colorClass="bg-gradient-to-r from-amber-500 to-orange-600" />
    </div>
  );
};

export default PlanningStatsRow;

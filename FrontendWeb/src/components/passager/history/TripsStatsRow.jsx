import { useTranslation } from 'react-i18next';
import { BarChart3, Navigation, Award } from 'lucide-react';
import StatCard from './StatCard';

const TripsStatsRow = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        label={t('history.total')}
        value={stats.total}
        icon={BarChart3}
        colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"
      />
      <StatCard
        label={t('history.total_distance')}
        value={`${stats.totalDistance.toFixed(1)} km`}
        icon={Navigation}
        colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"
      />
      <StatCard
        label={t('history.average_rating')}
        value={stats.averageRating.toFixed(1)}
        icon={Award}
        colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"
      />
    </div>
  );
};

export default TripsStatsRow;

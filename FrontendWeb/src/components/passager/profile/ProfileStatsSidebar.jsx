import { useTranslation } from 'react-i18next';
import { Radar, CreditCard, Star, Clock } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';
import Progress from '../../admin/ui/Progress';

const formatTime = (minutes) => {
  if (!minutes) return "0min";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  return `${hours}h ${mins > 0 ? `${mins}min` : ''}`;
};

const ProfileStatsSidebar = ({ realStats }) => {
  const { t } = useTranslation();

  const stats = [
    {
      label: t('profile.stats.trips'),
      value: realStats.trips,
      icon: Radar,
      color: 'green',
      progress: Math.min(100, (realStats.trips / 50) * 100) // Objectif 50 trajets
    },
    {
      label: t('profile.stats.spending'),
      value: `${(realStats.spending || 0).toLocaleString()} GNF`,
      icon: CreditCard,
      color: 'blue',
      progress: Math.min(100, (realStats.spending / 1000000) * 100) // Objectif 1M GNF
    },
    {
      label: t('profile.stats.average_rating'),
      value: realStats.averageRating?.toFixed(1) || '5.0',
      icon: Star,
      color: 'yellow',
      progress: (realStats.averageRating || 5) * 20
    },
    {
      label: t('profile.stats.total_time'),
      value: formatTime(realStats.totalTime),
      icon: Clock,
      color: 'purple',
      progress: Math.min(100, (realStats.totalTime / 3000) * 100) // Objectif 50h
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.stats.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/40`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
                <Progress
                  value={stat.progress}
                  className={`progress-fill dark:bg-gray-700`}
                  showLabel={false}
                  animated={true}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileStatsSidebar;

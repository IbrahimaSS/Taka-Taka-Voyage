import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';
import Progress from '../../admin/ui/Progress';

const GlobalStatsCard = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader><CardTitle>{t('evaluations.global_stats')}</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-6">
          <div className="text-5xl font-bold text-green-700 dark:text-green-500 mb-2">{stats.average}</div>
          <div className="flex mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-8 h-8 ${i < Math.floor(stats.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('evaluations.based_on', { count: stats.total })}</p>
        </div>
        <div className="space-y-4">
          {stats.repartition.map((stat) => (
            <div key={stat.stars} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {stat.stars === 1
                    ? t('evaluations.stars_single', { count: 1 })
                    : t('evaluations.stars', { count: stat.stars })}
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{stat.count}</span>
              </div>
              <Progress value={stat.percentage} color={stat.stars >= 4 ? 'green' : stat.stars === 3 ? 'yellow' : 'red'} showLabel={false} size="sm" className="dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalStatsCard;

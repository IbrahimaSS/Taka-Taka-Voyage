import { useTranslation } from 'react-i18next';
import { Search, RotateCcw } from 'lucide-react';
import Card, { CardContent } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';

const TripsEmptyState = ({ onResetFilters }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="text-center py-20">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('history.no_trips')}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('history.no_trips_desc')}</p>
        <Button
          variant="primary"
          onClick={onResetFilters}
          icon={RotateCcw}
        >
          {t('history.reset_filters')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TripsEmptyState;

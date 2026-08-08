import { useTranslation } from 'react-i18next';
import { RotateCcw } from 'lucide-react';
import { CardHeader, CardTitle } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';
import ExportDropdown from '../../admin/ui/ExportDropdown';

const TripsHistoryHeader = ({ filteredTrips, onResetFilters }) => {
  const { t } = useTranslation();

  return (
    <CardHeader align="start" className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <div>
          <CardTitle size="xl" className="text-gray-900 dark:text-white">{t('history.title')}</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('history.subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <ExportDropdown
            data={filteredTrips}
            columns={[
              { accessor: 'date', header: t('history.table.date') },
              { accessor: 'driver.name', header: t('history.table.driver') },
              { accessor: 'departure', header: t('history.table.pickup') },
              { accessor: 'destination', header: t('history.table.destination') },
              { accessor: 'price', header: t('history.table.price') },
              { accessor: 'status', header: t('history.table.status') },
              { accessor: 'rating', header: t('history.details.rating_given') }
            ]}
            fileName="historique_takataka"
            title={t('history.title')}
          />
          <Button
            variant="secondary"
            onClick={onResetFilters}
            icon={RotateCcw}
            fullWidth
            className="sm:w-auto"
          >
            {t('history.refresh')}
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default TripsHistoryHeader;

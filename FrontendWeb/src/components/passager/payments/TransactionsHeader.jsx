import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { CardHeader, CardTitle } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';
import ExportDropdown from '../../admin/ui/ExportDropdown';

const TransactionsHeader = ({ filteredTransactions, onClearFilters }) => {
  const { t } = useTranslation();

  return (
    <CardHeader align="start" className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <div>
          <CardTitle size="xl" className="text-gray-900 dark:text-white">{t('transactions.title')}</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('transactions.subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <ExportDropdown
            data={filteredTransactions}
            columns={[
              { accessor: 'date', header: t('transactions.table.date') },
              { accessor: 'type', header: t('transactions.table.type') },
              { accessor: 'amount', header: t('transactions.table.amount') },
              { accessor: 'method', header: t('transactions.table.method') },
              { accessor: 'status', header: t('transactions.table.status') },
              { accessor: 'reference', header: t('transactions.table.reference') }
            ]}
            fileName="transactions_takataka"
            title={t('transactions.title')}
          />
          <Button
            variant="secondary"
            onClick={onClearFilters}
            icon={RefreshCw}
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

export default TransactionsHeader;

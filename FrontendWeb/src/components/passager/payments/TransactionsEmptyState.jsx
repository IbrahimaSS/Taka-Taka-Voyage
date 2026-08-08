import { useTranslation } from 'react-i18next';
import { CreditCard, RefreshCw } from 'lucide-react';
import Card, { CardContent } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';

const TransactionsEmptyState = ({ onClearFilters }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="text-center py-20">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <CreditCard className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('transactions.messages.no_transactions')}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('transactions.messages.no_transactions_desc')}</p>
        <Button
          variant="primary"
          onClick={onClearFilters}
          icon={RefreshCw}
        >
          {t('transactions.messages.reset_filters')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TransactionsEmptyState;

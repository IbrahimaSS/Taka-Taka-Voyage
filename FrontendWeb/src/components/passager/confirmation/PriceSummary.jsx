import { useTranslation } from 'react-i18next';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';

const PriceSummary = ({ basePrice, serviceFee, totalPrice }) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
      <CardHeader>
        <CardTitle size="md">{t('confirmation.price_summary')}</CardTitle>
        <p className="text-gray-600 dark:text-gray-400">{t('confirmation.price_summary_desc')}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('confirmation.base_price')}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {basePrice.toLocaleString()} GNF
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('confirmation.service_fee')}</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              + {serviceFee.toLocaleString()} GNF
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-lg">
            <span className="text-gray-900 dark:text-gray-100">{t('confirmation.total')}</span>
            <span className="text-green-700 dark:text-green-500">
              {totalPrice.toLocaleString()} GNF
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceSummary;

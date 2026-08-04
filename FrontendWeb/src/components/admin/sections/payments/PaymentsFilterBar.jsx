import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import Card from '../../ui/Card';

const PaymentsFilterBar = ({
  search,
  onSearchChange,
  paymentFilter,
  onPaymentFilterChange,
  methodFilter,
  onMethodFilterChange,
  typeFilter,
  onTypeFilterChange,
  dateRange,
  onDateRangeChange
}) => {
  const { t } = useTranslation();

  return (
    <Card hoverable={false}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder={t('payments.search_placeholder')}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition text-sm md:text-base"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <select
          className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm md:text-base"
          value={paymentFilter}
          onChange={(e) => onPaymentFilterChange(e.target.value)}>
          <option value="all">{t('common.all_status', 'Tous les statuts')}</option>
          <option value="paid">{t('history.status.completed')}</option>
          <option value="pending">{t('history.status.pending')}</option>
          <option value="failed">{t('history.status.cancelled')}</option>
          <option value="refunded">{t('payments.refunded_payments')}</option>
        </select>

        <select
          className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm md:text-base"
          value={methodFilter}
          onChange={(e) => onMethodFilterChange(e.target.value)}>
          <option value="all">{t('payments.all_methods')}</option>
          <option value="cash">{t('payments.cash')}</option>
          <option value="orange">{t('payments.orange_money')}</option>
          <option value="mtn">{t('payments.mobile_money')}</option>
          <option value="card">{t('payments.card')}</option>
        </select>

        <select
          className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm md:text-base"
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}>
          <option value="all">{t('common.all_types', 'Tous les types')}</option>
          <option value="MOTO_TAXI">{t('services.moto_taxi', 'Moto-taxi')}</option>
          <option value="TAXI_PARTAGE">{t('services.taxi_partage', 'Taxi partagé')}</option>
          <option value="VOITURE_PRIVEE">{t('services.voiture_privee', 'Voiture privée')}</option>
        </select>



        <div className="col-span-2 grid grid-cols-2 gap-4 ">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">{t('common.from', 'Du')}</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">{t('common.to', 'Au')}</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 transition"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PaymentsFilterBar;

import { useTranslation } from 'react-i18next';
import { BarChart3, ArrowUpRight, Clock, Wallet } from 'lucide-react';
import StatCard from './StatCard';

const TransactionsStatsRow = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        label={t('transactions.stats.total_transactions')}
        value={stats.total}
        icon={BarChart3}
        colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"
      />
      <StatCard
        label={t('transactions.stats.income')}
        value={`${stats.totalIncome.toLocaleString()} GNF`}
        icon={ArrowUpRight}
        colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"
      />
      <StatCard
        label={t('transactions.stats.pending')}
        value={stats.pendingTransactions}
        icon={Clock}
        colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"
      />
      <StatCard
        label={t('transactions.stats.expenses')}
        value={`${stats.totalExpenses.toLocaleString()} GNF`}
        icon={Wallet}
        colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"
      />
    </div>
  );
};

export default TransactionsStatsRow;

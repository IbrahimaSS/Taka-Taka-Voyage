import { useTranslation } from 'react-i18next';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Badge from '../../admin/ui/Badge';

const TransactionStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const config = {
    completed: {
      variant: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400',
      icon: CheckCircle,
      label: t('transactions.status.completed')
    },
    pending: {
      variant: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400',
      icon: Clock,
      label: t('transactions.status.pending')
    },
    failed: {
      variant: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-700 dark:text-red-400',
      icon: AlertCircle,
      label: t('transactions.status.failed')
    }
  };

  const { variant, icon: Icon, label } = config[status] || config.pending;

  return (
    <Badge size="sm" className={`bg-${variant} inline-flex items-center`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
};

export default TransactionStatusBadge;

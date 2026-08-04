import { CheckCircle, Hourglass, XCircle, RefreshCw } from 'lucide-react';
import Badge from '../../ui/Badge';
import MethodIcon from './MethodIcon';

// Helper pour afficher le badge de méthode
export const getMethodBadge = (method, t) => {
  const config = {
    'cash': { label: t('payments.cash'), color: 'green' },
    'orange': { label: t('payments.orange_money'), color: 'orange' },
    'mtn': { label: t('payments.mobile_money'), color: 'blue' },
    'card': { label: t('payments.card'), color: 'gray' },
  };

  const { label, color } = config[method] || config.cash;
  return (
    <Badge className={`text-${color}-500 flex items-center gap-1`}>
      <MethodIcon method={method} className="w-3 h-3" />
      {label}
    </Badge>
  );
};

// Helper pour afficher le badge de statut
export const getStatusBadge = (status, t) => {
  const config = {
    'paid': { label: t('history.status.completed'), color: 'green', icon: CheckCircle },
    'pending': { label: t('history.status.pending'), color: 'yellow', icon: Hourglass },
    'failed': { label: t('history.status.cancelled'), color: 'red', icon: XCircle },
    'refunded': { label: t('payments.refunded_payments'), color: 'gray', icon: RefreshCw }
  };

  const { label, color, icon: Icon } = config[status] || config.pending;
  return (
    <Badge className={`text-${color}-500 `}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
};

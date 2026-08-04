import { useTranslation } from 'react-i18next';
import { CheckCircle, Hourglass, XCircle, RefreshCw, User, Car, DollarSign } from 'lucide-react';
import Badge from '../../ui/Badge';
import MethodIcon from './MethodIcon';

// Composant pour la vue mobile
const MobilePaymentCard = ({ payment, isSelected, onSelect, onAction }) => {
  const { t } = useTranslation();
  const getMethodBadge = (method) => {
    const config = {
      'cash': { label: t('payments.cash'), variant: 'success', icon: 'cash' },
      'orange': { label: t('payments.orange_money'), variant: 'warning', icon: 'orange' },
      'mtn': { label: t('payments.mobile_money'), variant: 'primary', icon: 'mtn' },
      'card': { label: t('payments.card'), variant: 'secondary', icon: 'card' },
    };

    const { label, variant, icon } = config[method] || config.cash;
    return (
      <Badge variant={variant} size="sm" className="flex items-center gap-1">
        <MethodIcon method={icon} className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      'paid': { label: t('history.status.completed'), variant: 'success', icon: CheckCircle },
      'pending': { label: t('history.status.pending'), variant: 'warning', icon: Hourglass },
      'failed': { label: t('history.status.cancelled'), variant: 'danger', icon: XCircle },
      'refunded': { label: t('payments.refunded_payments'), variant: 'secondary', icon: RefreshCw }
    };

    const { label, variant } = config[status] || config.pending;
    return (
      <Badge variant={variant} size="sm">
        {label}
      </Badge>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border ${isSelected ? 'border-green-400 bg-green-50' : 'border-gray-200 dark:border-gray-900'} p-4 mb-3`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            className="mt-1 rounded border-gray-300 dark:border-gray-700 text-green-500 focus:ring-green-400"
            checked={isSelected}
            onChange={(e) => onSelect(payment.id, e.target.checked)}
          />
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{payment.id}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{payment.passenger.name} → {payment.driver.name}</p>
            <div className="flex items-center mt-2 space-x-2">
              {getMethodBadge(payment.method)}
              {getStatusBadge(payment.status)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-800 dark:text-gray-100">{payment.amount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{payment.date}</p>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-900 pt-3">
        <div className="flex items-center">
          <User className="w-3 h-3 mr-1" />
          {payment.passenger.name}
        </div>
        <div className="flex items-center">
          <Car className="w-3 h-3 mr-1" />
          {payment.driver.name}
        </div>
        <div className="flex items-center">
          <DollarSign className="w-3 h-3 mr-1" />
          {payment.commission}
        </div>
      </div>
    </div>
  );
};

export default MobilePaymentCard;

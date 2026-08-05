import { CheckCircle, Clock, Car, CreditCard, DollarSign } from 'lucide-react';
import Badge from '../../ui/Badge';

// Helper pour afficher le statut
export const renderStatus = (status, t) => {
  if (status === 'PAYE') {
    return (
      <Badge variant="success">
        <CheckCircle className="w-3 h-3 mr-1" />
        {t('history.status.completed')}
      </Badge>
    );
  }
  // Style doux pour "À payer" — fond clair, texte coloré
  return (
    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
      <Clock className="w-3 h-3 mr-1" />
      {t('commissions.to_pay')}
    </span>
  );
};

// Helper pour afficher le service
export const renderService = (service, t) => {
  const config = {
    MOTO: { label: t('commissions.moto_taxi'), color: 'green', icon: Car },
    TAXI: { label: t('commissions.taxi'), color: 'blue', icon: Car },
    VOITURE: { label: t('commissions.private_car'), color: 'purple', icon: Car },
    BUS: { label: t('commissions.bus'), color: 'orange', icon: Car }
  };
  const { label, color: c, icon: Icon } = config[service] || config.MOTO;
  return (
    <Badge className={`text-${c} bg-${c}-200 dark:bg-gray-900/40`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
};

// Helper pour afficher la méthode de paiement
export const renderPaymentMethod = (method, t) => {
  const config = {
    ORANGE_MONEY: { label: t('payments.orange_money'), color: 'orange', icon: CreditCard },
    MTN_MONEY: { label: t('payments.mobile_money'), color: 'yellow', icon: CreditCard },
    CASH: { label: t('payments.cash'), color: 'gray', icon: DollarSign }
  };
  const { label, color: c, icon: Icon } = config[method] || config.ORANGE_MONEY;
  return (
    <Badge variant="secondary" className={`bg-${c}-100 text-${c}-800`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
};

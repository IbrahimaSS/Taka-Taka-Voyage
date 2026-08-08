import { useTranslation } from 'react-i18next';

const TransactionTypeBadge = ({ type, amount }) => {
  const { t } = useTranslation();
  const isIncome = amount > 0;

  const config = {
    'Paiement trajet': {
      label: t('transactions.types.trip_payment'),
      color: 'text-rose-600',
      bgColor: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20'
    },
    'Remboursement': {
      label: t('transactions.types.refund'),
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20'
    },
    'Cashback': {
      label: t('transactions.types.cashback'),
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20'
    },
    'Recharge': {
      label: t('transactions.types.topup'),
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
    }
  };

  const typeConfig = config[type] || {
    label: type === 'Autre' ? t('transactions.types.other') : type,
    color: isIncome ? 'text-emerald-600' : 'text-rose-600',
    bgColor: isIncome ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20' : 'bg-gradient-to-r from-rose-500/20 to-pink-500/20'
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
      {typeConfig.label}
    </span>
  );
};

export default TransactionTypeBadge;

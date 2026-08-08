import { useTranslation } from 'react-i18next';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Badge from '../../admin/ui/Badge';

const TripStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const config = {
    ACCEPTEE: {
      variant: 'bg-green-500/20 text-green-700',
      icon: CheckCircle,
      label: t('planning.confirmed')
    },
    EN_ATTENTE: {
      variant: 'bg-amber-500/20 text-amber-700',
      icon: Clock,
      label: t('planning.pending')
    },
    ANNULEE: {
      variant: 'bg-red-500/20 text-red-700',
      icon: AlertCircle,
      label: t('planning.cancelled')
    },
    ANNULEE_AVEC_FRAIS: {
      variant: 'bg-orange-500/20 text-orange-700',
      icon: AlertCircle,
      label: t('planning.cancelled') + ' (frais)'
    },
    TERMINEE: {
      variant: 'bg-blue-500/20 text-blue-700',
      icon: CheckCircle,
      label: 'Terminé'
    }
  };

  const current = config[status] || config.EN_ATTENTE;
  const Icon = current.icon;

  return (
    <Badge size="sm" className={`inline-flex items-center ${current.variant}`}>
      <Icon className="w-3 h-3 mr-1" />
      {current.label}
    </Badge>
  );
};

export default TripStatusBadge;

import { useTranslation } from 'react-i18next';
import { CheckCircle, X, Clock, Navigation } from 'lucide-react';
import Badge from '../../admin/ui/Badge';

const TripStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const config = {
    completed: {
      variant: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400',
      icon: CheckCircle,
      label: t('history.status.completed')
    },
    cancelled: {
      variant: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-700 dark:text-red-400',
      icon: X,
      label: t('history.status.cancelled')
    },
    pending: {
      variant: 'warning',
      icon: Clock,
      label: t('history.status.pending')
    },
    in_progress: {
      variant: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400',
      icon: Navigation,
      label: t('history.status.in_progress')
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

export default TripStatusBadge;

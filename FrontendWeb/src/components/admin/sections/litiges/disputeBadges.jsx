import clsx from 'clsx';
import {
  AlertTriangle, Hourglass, CheckCircle, XCircle, Clock,
  CreditCard, User, MapPin, Shield, FileText
} from 'lucide-react';
import Badge from '../../ui/Badge';

// Helper pour afficher le statut
export const renderStatus = (status, t) => {
  const config = {
    open: { label: t('disputes.status.open', 'Ouvert'), bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-400', icon: AlertTriangle },
    in_progress: { label: t('disputes.in_review', 'En cours'), bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', icon: Hourglass },
    resolved: { label: t('common.resolved', 'Résolu'), bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: CheckCircle },
    rejected: { label: t('common.rejected', 'Rejeté'), bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: XCircle },
    pending: { label: t('trips.status.pending', 'En attente'), bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-300', icon: Clock }
  };

  const { label, icon: Icon, bg, text } = config[status] || config.pending;
  return (
    <Badge className={clsx(bg, text, "border-none shadow-none font-semibold")}>
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {label}
    </Badge>
  );
};

// Helper pour afficher la priorité
export const renderPriority = (priority) => {
  const config = {
    low: { label: 'Basse', variant: 'secondary' },
    medium: { label: 'Moyenne', variant: 'warning' },
    high: { label: 'Haute', variant: 'danger' },
    critical: { label: 'Critique', variant: 'danger' }
  };

  const { label, variant } = config[priority] || config.medium;
  return <Badge variant={variant}>{label}</Badge>;
};

// Helper pour afficher le type
export const renderType = (type, t) => {
  const config = {
    paiement: { label: t('nav.paiements', 'Paiement'), icon: CreditCard, color: 'blue' },
    comportement: { label: t('disputes.behavior', 'Comportement'), icon: User, color: 'purple' },
    trajet: { label: t('trips.trajet', 'Trajet'), icon: MapPin, color: 'emerald' },
    accident: { label: t('disputes.accident', 'Accident'), icon: AlertTriangle, color: 'red' },
    agression: { label: t('disputes.agression', 'Agression'), icon: Shield, color: 'red' },
    urgence_medicale: { label: t('disputes.medical', 'Urgence Médicale'), icon: AlertTriangle, color: 'red' },
    danger: { label: t('disputes.danger', 'Danger'), icon: AlertTriangle, color: 'orange' },
    autre: { label: t('common.other', 'Autre'), icon: FileText, color: 'gray' }
  };

  const fallback = { label: type || 'Inconnu', icon: FileText, color: 'gray' };
  const { label, icon: Icon, color } = config[type] || fallback;
  return (
    <Badge className='bg-gray-200 dark:bg-gray-800'>
      <Icon className={`w-3 h-3 mr-1 text-${color}-500`} />
      {label}
    </Badge>
  );
};

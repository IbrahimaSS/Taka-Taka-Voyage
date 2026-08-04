import { CheckCircle, PlayCircle, Clock, XCircle, DollarSign, Phone, Smartphone, Zap, CreditCard } from 'lucide-react';
import Badge from '../../ui/Badge';

export const getStatusBadge = (status, t) => {
  const config = {
    completed: { label: t('trips.status.completed'), color: 'emerald', icon: CheckCircle },
    'in-progress': { label: t('trips.status.in_progress'), color: 'blue', icon: PlayCircle },
    pending: { label: t('trips.status.pending'), color: 'amber', icon: Clock },
    cancelled: { label: t('trips.status.cancelled'), color: 'rose', icon: XCircle }
  };

  const { label, color, icon: Icon } = config[status] || config.pending;
  return (
    <Badge className={`bg-${color}-50 text-${color}-700 border border-${color}-200`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
};

export const getPaymentBadge = (method, t) => {
  const getMethod = (m) => {
    if (!m) return 'cash';
    const lower = m.toLowerCase();
    if (lower.includes('orange')) return 'orange';
    if (lower.includes('mtn')) return 'mtn';
    if (lower.includes('wave')) return 'wave';
    if (lower.includes('carte') || lower.includes('card')) return 'card';
    if (lower.includes('mobile') || lower.includes('money')) return 'orange'; // Fallback visuel (Orange par défaut)
    if (lower.includes('portefeuille') || lower.includes('wallet')) return 'card';
    return 'cash';
  };

  const m = getMethod(method);

  const config = {
    'cash': { label: t('payments.cash') || 'Espèces', color: 'emerald', icon: DollarSign },
    'orange': { label: t('payments.orange_money') || 'Orange Money', color: 'orange', icon: Phone },
    'mtn': { label: t('payments.mobile_money') || 'MTN Money', color: 'blue', icon: Smartphone },
    'wave': { label: t('payments.wave') || 'Wave', color: 'purple', icon: Zap },
    'card': { label: t('payments.card') || 'Carte', color: 'gray', icon: CreditCard },
  };

  const { label, color, icon: Icon } = config[m] || config.cash;
  return (
    <Badge className={`bg-${color}-50 text-${color}-700 border border-${color}-200`} size="sm">
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
};

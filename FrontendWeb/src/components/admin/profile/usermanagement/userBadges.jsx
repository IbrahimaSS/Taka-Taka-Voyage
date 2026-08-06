import { ShieldOff, ShieldCheck } from 'lucide-react';
import Badge from '../../ui/Badge';

export const getRoleBadge = (role) => {
  const config = {
    'Administrateur': { variant: 'admin', icon: '👑' },
    'Superviseur': { variant: 'supervisor', icon: '⭐' },
    'Agent': { variant: 'agent', icon: '👤' },
    'Analyste': { variant: 'info', icon: '📊' }
  };

  const roleConfig = config[role] || { variant: 'default', icon: '👤' };

  return (
    <Badge variant={roleConfig.variant} size="sm">
      {roleConfig.icon} {role}
    </Badge>
  );
};

export const getStatusBadge = (status) => {
  const config = {
    'active': { variant: 'success', label: 'Actif', icon: ShieldCheck },
    'inactive': { variant: 'danger', label: 'Bloqué', icon: ShieldOff },
    'pending': { variant: 'warning', label: 'En attente', icon: null }
  };

  const statusConfig = config[status] || { variant: 'default', label: status, icon: null };
  const StatusIcon = statusConfig.icon;

  return (
    <Badge variant={statusConfig.variant} size="sm" className="flex items-center gap-1">
      {StatusIcon && <StatusIcon className="w-3 h-3" />}
      {statusConfig.label}
    </Badge>
  );
};

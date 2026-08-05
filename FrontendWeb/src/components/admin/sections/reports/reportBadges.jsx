import { DollarSign, Users, MapPin, Activity, Shield, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import Badge from '../../ui/Badge';

// Composant pour le badge de statut
export const StatusBadge = ({ status }) => {
  const config = {
    generated: {
      label: 'Généré',
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    },
    pending: {
      label: 'En attente',
      icon: Clock,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    },
    failed: {
      label: 'Échoué',
      icon: XCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    },
    processing: {
      label: 'En cours',
      icon: RefreshCw,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500'
    }
  };

  const { label, icon: Icon, bgColor, textColor, iconColor } = config[status] || config.pending;

  return (
    <Badge className={`flex items-center gap-1 ${bgColor} ${textColor} px-2 py-1 text-xs sm:text-sm`}>
      {/* <Icon className={`w-3 h-3 ${iconColor}`} /> */}
      <span className="font-medium">{label}</span>
    </Badge>
  );
};

// Composant pour le badge de type
export const TypeBadge = ({ type }) => {
  const config = {
    financial: {
      label: 'Financier',
      icon: DollarSign,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    },
    users: {
      label: 'Utilisateurs',
      icon: Users,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500'
    },
    geographic: {
      label: 'Géographique',
      icon: MapPin,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      iconColor: 'text-purple-500'
    },
    performance: {
      label: 'Performance',
      icon: Activity,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    },
    security: {
      label: 'Sécurité',
      icon: Shield,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    }
  };

  const { label, icon: Icon, bgColor, textColor, iconColor } = config[type] || config.financial;

  return (
    <Badge className={`flex items-center gap-1 ${bgColor} ${textColor} px-2 py-1 text-xs sm:text-sm`}>
      {/* <Icon className={`w-3 h-3 ${iconColor}`} /> */}
      <span className="font-medium">{label}</span>
    </Badge>
  );
};

// Composant pour le badge de format
export const FormatBadge = ({ format }) => {
  const config = {
    pdf: {
      label: 'PDF',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    },
    csv: {
      label: 'CSV',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    },
    word: {
      label: 'Word',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    }
  };

  const { label, bgColor, textColor } = config[format] || config.pdf;

  return (
    <Badge className={`${bgColor} ${textColor} px-2 py-1 text-xs sm:text-sm`}>
      <span className="font-medium">{label}</span>
    </Badge>
  );
};

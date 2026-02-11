import { useState } from 'react';
import { Check, X, AlertCircle, Info, Star, Clock, User, Shield, Car, Bell, MessageSquare, ShoppingCart, DollarSign } from 'lucide-react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  rounded = 'full',
  className = '',
  removable = false,
  onRemove,
  onClick,
  pulse = false,
  shadow = false,
  border = false,
  ...props
}) {
  
  // Classes de taille
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-sm',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  // Classes de bordure arrondie
  const roundedClasses = {
    full: 'rounded-full',
    lg: 'rounded-lg',
    md: 'rounded-md',
    sm: 'rounded-sm',
  };

  // Variantes de style
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
    primary: 'bg-gradient-to-r from-blue-500/15 to-blue-600/15 text-blue-600 border-blue-500/30 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-300 dark:border-blue-700/50',
    secondary: 'bg-gradient-to-r from-green-500/15 to-green-600/15 text-green-600 border-green-500/30 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-300 dark:border-green-700/50',
    success: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
    error: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-300 dark:border-red-700',
    warning: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-300 dark:border-amber-700',
    info: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-300 dark:border-blue-700',
    outline: 'bg-transparent text-gray-700 border-gray-300 dark:text-gray-300 dark:border-gray-600',
    gradient: 'bg-gradient-to-r from-blue-500 to-green-500 text-white border-transparent',
  };

  // Icônes par variante
  const variantIcons = {
    success: <Check className="w-3 h-3" />,
    error: <X className="w-3 h-3" />,
    warning: <AlertCircle className="w-3 h-3" />,
    info: <Info className="w-3 h-3" />,
  };

  // Animation de pulsation
  const pulseClass = pulse ? 'animate-pulse' : '';
  
  // Ombre
  const shadowClass = shadow ? 'shadow-md' : '';
  
  // Bordure
  const borderClass = border ? 'border' : '';

  // Utilise l'icône de variante si aucune icône n'est fournie
  const displayIcon = icon || variantIcons[variant];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        ${variantClasses[variant]}
        ${borderClass}
        ${shadowClass}
        ${pulseClass}
        transition-all duration-200 hover:scale-105
        ${className}
      `}
      {...props}
    >
      {/* Icône à gauche */}
      {displayIcon && iconPosition === 'left' && (
        <span className={`${variant === 'gradient' ? 'text-white/90' : ''}`}>
          {displayIcon}
        </span>
      )}

      {/* Contenu */}
      <span className="font-medium">{children}</span>

      {/* Icône à droite */}
      {displayIcon && iconPosition === 'right' && (
        <span className={`${variant === 'gradient' ? 'text-white/90' : ''}`}>
          {displayIcon}
        </span>
      )}

      {/* Bouton de suppression */}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className={`
            ml-1 -mr-1 p-0.5 rounded-full
            ${variant === 'gradient' 
              ? 'text-white/80 hover:bg-white/20 hover:text-white' 
              : 'text-gray-400 hover:bg-gray-600 hover:text-white'
            }
            transition-colors
          `}
          aria-label="Supprimer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

// Badge avec statut (pour chauffeur en ligne/hors ligne)
export function StatusBadge({ status = 'online' }) {
  const statusConfig = {
    online: {
      label: 'En ligne',
      variant: 'success',
      icon: <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />,
    },
    offline: {
      label: 'Hors ligne',
      variant: 'error',
      icon: <div className="w-2 h-2 rounded-full bg-gray-400" />,
    },
    busy: {
      label: 'Occupé',
      variant: 'warning',
      icon: <div className="w-2 h-2 rounded-full bg-amber-500" />,
    },
    away: {
      label: 'Absent',
      variant: 'info',
      icon: <div className="w-2 h-2 rounded-full bg-blue-500" />,
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      size="sm"
      icon={config.icon}
      iconPosition="left"
      className="gap-2"
    >
      {config.label}
    </Badge>
  );
}

// Badge de compteur (pour notifications, etc.)
export function CountBadge({ count = 0, max = 99, variant = 'error' }) {
  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge
      variant={variant}
      size="xs"
      rounded="full"
      className={`min-w-[1.5rem] justify-center ${count > 0 ? 'scale-100' : 'scale-0'} transition-transform`}
      pulse={count > 0}
    >
      {displayCount}
    </Badge>
  );
}

// Badge avec icône seulement
export function IconBadge({ icon, variant = 'default', size = 'md' }) {
  return (
    <Badge
      variant={variant}
      size={size}
      rounded="full"
      className="p-1.5 !px-1.5"
    >
      {icon}
    </Badge>
  );
}

// Exemple de page de démonstration
export function BadgeShowcase() {
  const [badges, setBadges] = useState([
    { id: 1, text: 'Nouveau', variant: 'primary' },
    { id: 2, text: 'Promo', variant: 'gradient' },
    { id: 3, text: 'Bientôt', variant: 'warning' },
    { id: 4, text: 'Terminé', variant: 'success' },
  ]);

  const badgeVariants = ['default', 'primary', 'secondary', 'success', 'error', 'warning', 'info', 'outline', 'gradient'];
  const badgeSizes = ['xs', 'sm', 'md', 'lg'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent mb-4">
            Design System - Badges
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Collection de badges modulables avec différentes variantes, tailles et fonctionnalités
          </p>
        </div>

        {/* Section 1: les variantes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Variantes de couleurs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            {badgeVariants.map((variant) => (
              <div key={variant} className="flex flex-col items-center gap-3">
                <Badge variant={variant} className="capitalize">
                  {variant}
                </Badge>
                <span className="text-xs text-gray-500 font-mono">{variant}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: tailles */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tailles disponibles</h2>
          <div className="space-y-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            {badgeSizes.map((size) => (
              <div key={size} className="flex items-center gap-4">
                <div className="w-32">
                  <span className="text-sm font-medium text-gray-700 capitalize">{size}</span>
                </div>
                <Badge variant="primary" size={size}>
                  Badge {size}
                </Badge>
                <Badge variant="success" size={size} icon={<Check />}>
                  Avec icône
                </Badge>
                <Badge variant="gradient" size={size} removable>
                  Supprimable
                </Badge>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: de statut (pour chauffeur) */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Badges de statut</h2>
          <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <StatusBadge status="online" />
                <p className="text-sm text-gray-600">Chauffeur disponible et actif</p>
              </div>
              <div className="space-y-4">
                <StatusBadge status="offline" />
                <p className="text-sm text-gray-600">Chauffeur indisponible</p>
              </div>
              <div className="space-y-4">
                <StatusBadge status="busy" />
                <p className="text-sm text-gray-600">Chauffeur en cours de trajet</p>
              </div>
              <div className="space-y-4">
                <StatusBadge status="away" />
                <p className="text-sm text-gray-600">Chauffeur momentanément absent</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: avec icônes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Badges avec icônes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-4">
              <h3 className="font-semibold text-gray-700">Icônes Lucide</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="info" icon={<Info />}>
                  Information
                </Badge>
                <Badge variant="warning" icon={<AlertCircle />}>
                  Attention
                </Badge>
                <Badge variant="success" icon={<Check />}>
                  Validé
                </Badge>
                <Badge variant="primary" icon={<Star />}>
                  Premium
                </Badge>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-4">
              <h3 className="font-semibold text-gray-700">Icônes à droite</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="primary" icon={<Clock />} iconPosition="right">
                  En attente
                </Badge>
                <Badge variant="success" icon={<User />} iconPosition="right">
                  Connecté
                </Badge>
                <Badge variant="gradient" icon={<Shield />} iconPosition="right">
                  Vérifié
                </Badge>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-4">
              <h3 className="font-semibold text-gray-700">Icônes seulement</h3>
              <div className="flex flex-wrap gap-3">
                <IconBadge icon={<User />} variant="outline" />
                <IconBadge icon={<Star className="text-amber-500" />} variant="warning" />
                <IconBadge icon={<Shield className="text-blue-500" />} variant="primary" />
                <IconBadge icon={<Check className="text-emerald-600" />} variant="success" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: de compteur */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Badges de compteur</h2>
          <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="w-6 h-6 text-gray-700" />
                  <CountBadge count={3} variant="error" />
                </div>
                <span className="text-sm text-gray-600">Notifications</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <MessageSquare className="w-6 h-6 text-gray-700" />
                  <CountBadge count={12} variant="primary" />
                </div>
                <span className="text-sm text-gray-600">Messages</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 text-gray-700" />
                  <CountBadge count={99} variant="gradient" />
                </div>
                <span className="text-sm text-gray-600">Panier</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <AlertCircle className="w-6 h-6 text-gray-700" />
                  <CountBadge count={150} max={99} variant="warning" />
                </div>
                <span className="text-sm text-gray-600">Alertes (max 99+)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: interactifs */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Badges interactifs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-4">
              <h3 className="font-semibold text-gray-700">Supprimables</h3>
              <p className="text-sm text-gray-600 mb-4">Cliquez sur × pour supprimer</p>
              <div className="flex flex-wrap gap-3">
                {badges.map((badge) => (
                  <Badge
                    key={badge.id}
                    variant={badge.variant}
                    removable
                    onRemove={() => setBadges(badges.filter(b => b.id !== badge.id))}
                  >
                    {badge.text}
                  </Badge>
                ))}
              </div>
              {badges.length === 0 && (
                <p className="text-sm text-gray-500 italic">Tous les badges ont été supprimés</p>
              )}
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-4">
              <h3 className="font-semibold text-gray-700">Effets spéciaux</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="gradient" pulse shadow>
                  Pulsation
                </Badge>
                <Badge variant="primary" shadow border>
                  Ombre & Bordure
                </Badge>
                <Badge variant="success" rounded="lg">
                  Coins arrondis
                </Badge>
                <Badge variant="outline" className="hover:bg-blue-500/10 transition-colors">
                  Hover effect
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: d'utilisation */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Exemple dans un contexte réel</h2>
          <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Tableau de bord chauffeur</h3>
                  <p className="text-sm text-gray-600">Statut et informations du jour</p>
                </div>
                <StatusBadge status="online" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trajets aujourd'hui</span>
                    <Badge variant="primary">8</Badge>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenus</span>
                    <Badge variant="success" icon={<DollarSign className="w-3 h-3" />}>
                      €156.50
                    </Badge>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Note moyenne</span>
                    <Badge variant="warning" icon={<Star className="w-3 h-3" />}>
                      4.8
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" icon={<Car className="w-3 h-3" />}>
                  Véhicule Model 3
                </Badge>
                <Badge variant="outline" icon={<Shield className="w-3 h-3" />}>
                  Assurance valide
                </Badge>
                <Badge variant="outline" icon={<Check className="w-3 h-3" />}>
                  Documents à jour
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Code d'utilisation */}
        <section className="bg-gray-900 text-gray-100 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Exemple d'utilisation</h3>
          <pre className="text-sm overflow-x-auto">
            {`// Badge simple
<Badge variant="primary">Nouveau</Badge>

// Badge avec icône
<Badge variant="success" icon={<Check />}>Validé</Badge>

// Badge de statut chauffeur
<StatusBadge status="online" />

// Badge de compteur
<div className="relative">
  <Bell className="w-6 h-6" />
  <CountBadge count={3} />
</div>

// Badge supprimable
<Badge variant="gradient" removable onRemove={() => console.log('removed')}>
  Supprimable
</Badge>`}
          </pre>
        </section>
      </div>
    </div>
  );
}
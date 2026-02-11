import { useState, useEffect } from 'react';

export function StatusToggle({
  status = 'offline',
  onChange,
  size = 'md',
  className = '',
  showText = true
}) {
  const [isOnline, setIsOnline] = useState(status === 'online');

  // Synchronise avec la prop status
  useEffect(() => {
    setIsOnline(status === 'online');
  }, [status]);

  const handleToggle = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    if (onChange) onChange(newStatus ? 'online' : 'offline');
  };

  // Configuration des tailles
  const sizeConfig = {
    sm: {
      toggle: 'w-10 h-5',
      thumb: 'w-4 h-4',
      text: 'text-xs',
      spacing: 'ml-2'
    },
    md: {
      toggle: 'w-12 h-6',
      thumb: 'w-5 h-5',
      text: 'text-sm',
      spacing: 'ml-3'
    },
    lg: {
      toggle: 'w-14 h-7',
      thumb: 'w-6 h-6',
      text: 'text-base',
      spacing: 'ml-3'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div
      className={`
        inline-flex items-center
        cursor-pointer
        select-none
        ${className}
      `}
      onClick={handleToggle}
      role="switch"
      aria-checked={isOnline}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      {/* Conteneur de l'interrupteur */}
      <div className="relative">
        {/* Piste de l'interrupteur */}
        <div
          className={`
            ${config.toggle}
            rounded-full
            transition-all duration-300
            ${isOnline
              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              : 'bg-gray-300'
            }
            shadow-inner
          `}
        >
          {/* Bouton de l'interrupteur */}
          <div
            className={`
              absolute top-1/2 -translate-y-1/2
              ${config.thumb}
              rounded-full
              bg-white
              shadow-md
              transition-all duration-300
              ${isOnline
                ? 'left-full -translate-x-full -ml-0.5'
                : 'left-0 ml-0.5'
              }
            `}
          />
        </div>
      </div>

      {/* Texte (optionnel) */}
      {showText && (
        <span
          className={`
            ${config.text}
            ${config.spacing}
            font-medium
            transition-colors duration-300
            ${isOnline
              ? 'text-emerald-600'
              : 'text-gray-500'
            }
          `}
        >
          {isOnline ? 'Disponible' : 'Indisponible'}
        </span>
      )}
    </div>
  );
}

// Version compacte (sans texte) pour les petits espaces
export function CompactStatusToggle({
  status = 'offline',
  onChange,
  size = 'md'
}) {
  return (
    <StatusToggle
      status={status}
      onChange={onChange}
      size={size}
      showText={false}
    />
  );
}

// Version avec badge personnalisé (utilise ton composant Badge existant)
export function BadgeStatusToggle({
  status = 'offline',
  onChange,
  BadgeComponent
}) {
  const [isOnline, setIsOnline] = useState(status === 'online');

  useEffect(() => {
    setIsOnline(status === 'online');
  }, [status]);

  const handleToggle = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    if (onChange) onChange(newStatus ? 'online' : 'offline');
  };

  return (
    <div onClick={handleToggle} className="cursor-pointer">
      <BadgeComponent
        variant={isOnline ? 'success' : 'error'}
        className="transition-all duration-200 hover:scale-105"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className={`
              w-10 h-5 rounded-full
              transition-all duration-300
              ${isOnline
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                : 'bg-gray-300'
              }
            `}>
              <div className={`
                absolute top-1/2 -translate-y-1/2
                w-4 h-4 bg-white rounded-full
                transition-all duration-300
                ${isOnline ? 'left-full -translate-x-full ml-0.5' : 'left-0 ml-0.5'}
              `} />
            </div>
          </div>
          <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
        </div>
      </BadgeComponent>
    </div>
  );
}
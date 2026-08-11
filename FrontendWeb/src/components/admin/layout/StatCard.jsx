// src/components/layout/StatCard.jsx - DESIGN MODERNE ET FLUIDE
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';
import { formatCompactNumber, formatFullNumber } from '../../../utils/formatNumber';

// Reduit progressivement la taille de police selon la longueur de la valeur
// pour toujours l'afficher en entier sur une ligne (pas de "..." qui coupe
// un montant/chiffre), plutot qu'une taille fixe qui force la troncature.
const getValueFontSize = (value, compact) => {
  const length = (typeof value === 'string' || typeof value === 'number') ? String(value).length : 0;
  const tiers = compact
    ? ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm']
    : ['text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-base'];
  if (length <= 6) return tiers[0];
  if (length <= 10) return tiers[1];
  if (length <= 14) return tiers[2];
  if (length <= 18) return tiers[3];
  return tiers[4];
};

// Infobulle portee via createPortal (document.body) pour ne jamais etre
// rognee par le overflow-hidden de la carte, quelle que soit sa position
// dans la grille. Affichee au survol (desktop) et au tap (mobile, pas de
// hover tactile).
const ValueTooltip = ({ anchorRef, visible, children }) => {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!visible || !anchorRef.current) return undefined;
    const update = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({ top: rect.top, left: rect.left + rect.width / 2 });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [visible, anchorRef]);

  if (!visible || !coords) return null;

  return createPortal(
    <div
      className="fixed z-[9999] -translate-x-1/2 -translate-y-full -mt-2 px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-gray-700 text-white text-xs font-bold shadow-xl pointer-events-none whitespace-nowrap"
      style={{ top: coords.top, left: coords.left }}
    >
      {children}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-gray-700" />
    </div>,
    document.body
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  loading = false,
  onClick,
  animated = true,
  compact = false,
  highlight = false,
  sparkle = false,
  trend,
  percentage,
  progress,
  description,
  subtitle,
  // Mode compact optionnel : affiche rawValue au format "1,5 M" au lieu du
  // nombre complet, avec une infobulle montrant la valeur exacte au survol/
  // tap. N'affecte rien tant que compactValue n'est pas explicitement passe
  // a true par l'appelant (comportement par defaut inchange).
  compactValue = false,
  rawValue,
  unit = ''
}) => {
  const caption = description || subtitle;
  const hasProgress = typeof progress === 'number';
  const hasTrend = typeof percentage === 'number' && percentage > 0;
  const TrendIcon = trend === 'down' ? TrendingDown : trend === 'up' ? TrendingUp : null;
  const trendColor = trend === 'down'
    ? 'text-rose-600 dark:text-rose-400'
    : trend === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-gray-500 dark:text-gray-400';
  // Configuration des couleurs
  const colorConfig = {

    personalise: {
      bg: 'bg-gradient-to-br from-primary-500 to-secondary-600',
      iconBg: 'bg-gradient-to-br from-primary-500 to-secondary-600',
      text: 'text-white',
      progress: 'from-primary-400 to-secondary-500',
      trend: 'text-white',
      glow: 'shadow-primary-500/30'
    }
  }

  const config = colorConfig.personalise;

  const isCompactMode = compactValue && typeof rawValue === 'number' && !Number.isNaN(rawValue);
  const displayValue = isCompactMode
    ? `${formatCompactNumber(rawValue)}${unit ? ` ${unit}` : ''}`
    : value;
  const fullValueText = isCompactMode
    ? `${formatFullNumber(rawValue)}${unit ? ` ${unit}` : ''}`
    : (typeof value === 'string' || typeof value === 'number' ? String(value) : '');

  const valueRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!showTooltip) return undefined;
    const onDocDown = (e) => {
      if (valueRef.current && !valueRef.current.contains(e.target)) setShowTooltip(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [showTooltip]);

  // Composant avec ou sans animation
  const CardComponent = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    whileHover: {
      y: -4,
      scale: 1.02,
      transition: { type: "spring", stiffness: 300, damping: 15 }
    },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.3, ease: "easeOut" }
  } : {};

  // Skeleton loading state
  if (loading) {
    return (
      <div className="stat-card h-full p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <CardComponent
      {...animationProps}
      className={clsx(
        'stat-card h-full dark:border-gray-900 group relative overflow-hidden cursor-pointer transition-all duration-300',
        highlight && 'ring-2 ring-primary-500/20',
        onClick && 'hover:shadow-lg',
        compact ? 'p-4' : 'p-6'
      )}
      onClick={onClick}
    >
      {/* Effet de glow sur hover */}
      {sparkle && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      )}

      {/* Décorations */}
      {highlight && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-t-lg"></div>
      )}

      <div className="relative z-10 ">
        {/* En-tête avec titre et icône */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2 truncate">
              {title}
            </p>
            <p
              ref={valueRef}
              title={fullValueText || undefined}
              onMouseEnter={() => isCompactMode && setShowTooltip(true)}
              onMouseLeave={() => isCompactMode && setShowTooltip(false)}
              onClick={(e) => {
                if (!isCompactMode) return;
                e.stopPropagation();
                setShowTooltip((v) => !v);
              }}
              className={clsx(
                'font-bold text-gray-800 truncate transition-all duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-50 dark:text-gray-100',
                isCompactMode && 'cursor-help',
                getValueFontSize(displayValue, compact)
              )}>
              {displayValue}
            </p>
            {isCompactMode && (
              <ValueTooltip anchorRef={valueRef} visible={showTooltip}>
                {fullValueText}
              </ValueTooltip>
            )}
          </div>

          {/* Icône avec animation */}
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-md shrink-0',
              config.iconBg
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
        </div>

        {/* Description / sous-titre */}
        {caption && (
          <p className={clsx(
            'text-xs text-gray-500 dark:text-gray-400 line-clamp-1',
            (hasProgress || hasTrend) ? 'mb-3' : ''
          )}>
            {caption}
          </p>
        )}

        {/* Barre de progression */}
        {hasProgress && (
          <div className={clsx('h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden', hasTrend ? 'mb-2' : '')}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={clsx('h-full rounded-full bg-gradient-to-r', config.progress)}
            />
          </div>
        )}

        {/* Tendance et pourcentage */}
        {hasTrend && (
          <div className={clsx('flex items-center gap-1 text-xs font-semibold', trendColor)}>
            {TrendIcon && <TrendIcon className="w-3.5 h-3.5" />}
            <span>{percentage}%</span>
          </div>
        )}



        {/* Effet de particules (optionnel pour les cartes importantes) */}
        {sparkle && (
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkles className="w-8 h-8 text-primary-300/50" />
          </div>
        )}
      </div>

      {/* Border hover effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-200/50 rounded-xl transition-all duration-300 pointer-events-none"></div>
    </CardComponent>
  );
};

// Variantes de StatCard pour différents cas d'usage
export const StatCardSimple = (props) => <StatCard {...props} compact />;
export const StatCardHighlight = (props) => <StatCard {...props} highlight sparkle />;
export const StatCardInteractive = (props) => <StatCard {...props} animated onClick={props.onClick} />;

export default StatCard;

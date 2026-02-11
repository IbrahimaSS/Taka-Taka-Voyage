// src/components/layout/StatCard.jsx - DESIGN MODERNE ET FLUIDE
import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ChevronRight, Sparkles, Activity, Zap, Award, Target
} from 'lucide-react';
import clsx from 'clsx';

const StatCard = ({
  title,
  value,
  icon: Icon,
  loading = false,
  onClick,
  animated = true,
  compact = false,
  highlight = false,
  sparkle = false
}) => {
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
      <div className="stat-card p-6">
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
        'stat-card dark:border-gray-900 group relative overflow-hidden cursor-pointer transition-all duration-300',
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
        <div className="flex  items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
              {title}

            </p>
            <p className={clsx(
              'font-bold text-gray-800  transition-all duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-50 dark:text-gray-100',
              compact ? 'text-2xl' : 'text-3xl'
            )}>
              {value}
            </p>
          </div>

          {/* Icône avec animation */}
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-md',
              config.iconBg
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
        </div>



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
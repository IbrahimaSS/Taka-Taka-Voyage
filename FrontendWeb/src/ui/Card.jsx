import React from 'react';
import { cn } from '../utils/cn';

/**
 * Simple Card (Accueil/Auth/Chauffeur)
 *
 * Props kept for backward compatibility:
 * - hover (default true)
 * - gradient (default true)
 * - padding (default true)
 */
const Card = ({
  children,
  className = '',
  hover = true,
  gradient = true,
  padding = true,
}) => {
  const base = 'rounded-2xl border backdrop-blur-sm shadow-sm';

  const color = gradient
    ? 'bg-gradient-to-br from-primary-500/5 via-white to-secondary-500/5 border-slate-200/60 '
        + 'dark:from-slate-800/40 dark:via-slate-900/70 dark:to-slate-900/60 dark:border-slate-800/60'
    : 'bg-white border-slate-200/60 dark:bg-slate-900 dark:border-slate-800/60';

  const hoverCls = hover
    ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-md '
        + 'hover:border-primary-500/30 dark:hover:border-primary-400/40'
    : '';

  return (
    <div
      className={cn(base, color, padding && 'p-6', hoverCls, className)}
    >
      {children}
    </div>
  );
};

export default Card;

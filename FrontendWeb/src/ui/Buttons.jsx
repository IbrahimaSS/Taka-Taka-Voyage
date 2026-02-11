import React from 'react';
import { cn } from '../utils/cn';

/**
 * Button (shared for Accueil/Auth/Chauffeur)
 *
 * Variants kept for backward compatibility:
 * - primary | secondary | accent | outline | ghost | gradientMix
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  disabled = false,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const base =
    'relative inline-flex items-center justify-center gap-2 rounded-xl font-medium ' +
    'select-none shadow-sm transition-all duration-200 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 ' +
    'disabled:opacity-50 disabled:pointer-events-none';

  const sizes = {
    xs: 'h-8 px-3 text-xs',
    sm: 'h-9 px-3.5 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
    xl: 'h-14 px-7 text-base',
  };

  const variants = {
    primary:
      'bg-gradient-to-r from-primary-600 to-secondary-600 text-white ' +
      'hover:brightness-110 active:brightness-95',
    secondary:
      'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-900 ' +
      'dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white',
    accent:
      'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-600',
    outline:
      'bg-transparent border border-slate-200 text-slate-900 hover:bg-slate-50 ' +
      'dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900/40',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 ' +
      'dark:text-slate-200 dark:hover:bg-slate-800/50 dark:hover:text-white shadow-none',
    gradientMix:
      'bg-gradient-to-r from-primary-600 via-indigo-600 to-secondary-600 text-white ' +
      'hover:brightness-110 active:brightness-95',
  };

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cn(
        base,
        sizes[size] || sizes.md,
        variants[variant] || variants.primary,
        fullWidth && 'w-full',
        className
      )}
    >
      {icon && iconPosition === 'left' && <span className={cn('shrink-0', loading && 'opacity-0')}>{icon}</span>}
      <span className={cn('whitespace-nowrap', loading && 'opacity-0')}>{children}</span>
      {icon && iconPosition === 'right' && <span className={cn('shrink-0', loading && 'opacity-0')}>{icon}</span>}

      {loading && (
        <span className="absolute inline-flex items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-300/40 dark:border-t-slate-900" />
        </span>
      )}
    </button>
  );
};

export default Button;

// Optional showcase (not used in production screens; kept for dev)
export const ButtonShowcase = () => (
  <div className="p-8 space-y-6">
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="gradientMix">Gradient</Button>
    </div>
  </div>
);

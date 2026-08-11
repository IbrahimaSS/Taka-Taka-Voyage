// src/components/ui/Badge.jsx
import React from 'react';
import clsx from 'clsx';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors';

  // Style "doux" : seul le texte (et le point) porte la couleur, le fond
  // reste tres clair/neutre - plus lisible et plus moderne qu'un fond plein
  // colore avec du texte blanc.
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    primary: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    secondary: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400',
    success: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    danger: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
    info: 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400',
    outline: 'border-2 border-blue-600 bg-transparent text-blue-700',
    admin: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    supervisor: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
    agent: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  };

  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-blue-500',
    secondary: 'bg-teal-500',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
    outline: 'bg-blue-600',
    admin: 'bg-purple-500',
    supervisor: 'bg-indigo-500',
    agent: 'bg-teal-500',
    slate: 'bg-slate-500',
  };

  const sizes = {
    xs: 'px-2.5 py-0.5 text-xs',
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-1.5 text-sm',
    lg: 'px-5 py-2',
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variants[variant] || variants.default,
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5', dotColors[variant] || dotColors.default)} />
      )}
      {children}
    </span>
  );
};

export default Badge;
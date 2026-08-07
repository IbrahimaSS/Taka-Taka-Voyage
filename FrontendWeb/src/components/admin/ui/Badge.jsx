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

  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100',
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    secondary: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
    info: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white',
    outline: 'border-2 border-blue-600 bg-transparent text-blue-700',
    admin: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white',
    supervisor: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
    agent: 'bg-gradient-to-r from-teal-600 to-teal-700 text-white',
    slate: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200',
  };

  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-blue-200',
    secondary: 'bg-teal-200',
    success: 'bg-green-200',
    danger: 'bg-red-200',
    warning: 'bg-amber-200',
    info: 'bg-blue-100',
    outline: 'bg-blue-600',
    admin: 'bg-purple-200',
    supervisor: 'bg-blue-200',
    agent: 'bg-teal-200',
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
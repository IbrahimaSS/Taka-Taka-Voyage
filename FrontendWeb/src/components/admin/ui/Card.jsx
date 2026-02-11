// src/components/ui/Card.jsx - VERSION MODERNE
import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

// Card composant pour afficher du contenu dans une carte stylisée
const Card = ({
  children,
  className = '',
  hoverable = false,
  padding = 'p-6',
  onClick,
  animate = true
}) => {
  const Component = animate ? motion.div : 'div';
  const props = animate ? {
    whileHover: hoverable ? { y: -4, transition: { duration: 0.2 } } : {},
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <Component
      {...props}
      className={clsx(
        'card',
        hoverable && 'card-hover',
        padding,
        onClick && 'cursor-pointer',
        'bg-white dark:bg-gray-800 dark:border-gray-900 rounded-2xl border border-gray-200 shadow-sm',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

export const CardHeader = ({ children, className = '', align = 'start' }) => (
  <div className={clsx(
    'border-b border-gray-100 dark:border-gray-900 pb-4 mb-4',
    align === 'center' && 'text-center',
    align === 'end' && 'text-right',
    className
  )}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', size = 'lg' }) => {
  const sizes = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-semibold',
    lg: 'text-2xl font-bold',
    xl: 'text-3xl font-bold',
  };

  return (
    <h3 className={clsx(sizes[size], 'text-gray-800 dark:text-gray-100 ', className)}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = '' }) => (
  <p className={clsx('text-gray-500 dark:text-gray-400 text-sm mt-1', className)}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={clsx('space-y-4   dark:bg-gray-800 dark:border-gray-900', className)}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', align = 'end' }) => (
  <div className={clsx(
    'border-t border-gray-100 dark:bg-gray-800 dark:border-gray-900 pt-4 mt-4',
    align === 'center' && 'text-center',
    align === 'start' && 'text-left',
    align === 'end' && 'text-right',
    align === 'between' && 'flex justify-between',
    className
  )}>
    {children}
  </div>
);

export default Card;
// src/components/ui/Bttn.jsx - VERSION MODERNE
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  loading = false, 
  disabled = false, 
  icon: Icon, 
  onClick, 
  className = '', 
  fullWidth = false,
  tooltip,
  ...props 
}) => {
  const baseClasses = 'inline-flex  items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    perso:  'bg-gradient-to-br from-primary-500 to-secondary-600  text-white',
    primary: 'btn-primary hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'btn-secondary hover:shadow-sm',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 focus:ring-red-500/50 shadow-sm hover:shadow-md',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 focus:ring-amber-500/50',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500/50',
    ghost: 'btn-ghost hover:shadow-sm',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:text-primary-700 focus:ring-primary-500/30',
  };

  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2.5 text-base',
    large: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    disabledClass,
    className
  );

  return (
    <motion.button
   
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      title={tooltip}
      aria-label={tooltip}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {!loading && Icon && <Icon className="w-4 h-4 mr-2" />}
      <span className="whitespace-nowrap">{children}</span>
    </motion.button>
  );
};

export default Button;
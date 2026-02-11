import React from 'react';
import { cn } from '../utils/cn';

const Input = React.forwardRef(function Input(
  {
    label,
    hint,
    error,
    icon,
    className,
    containerClassName,
    ...props
  },
  ref
) {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-11 rounded-xl border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none',
            'border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            'dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:focus:border-primary-400 dark:focus:ring-primary-400/20',
            icon && 'pl-10',
            error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-700',
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;

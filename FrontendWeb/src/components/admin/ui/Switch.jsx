// src/components/ui/Switch.jsx
import React from 'react';
import clsx from 'clsx';

const Switch = ({ checked, onChange, disabled = false, size = 'md' }) => {
  const sizes = {
    sm: 'w-11 h-6',
    md: 'w-14 h-7',
    lg: 'w-16 h-8',
  };

  const dotSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  return (
    <button
      type="button"
      className={clsx(
        'relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
        checked ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800',
        disabled && 'opacity-50 cursor-not-allowed',
        sizes[size]
      )}
      onClick={onChange}
      disabled={disabled}
    >
      <span
        className={clsx(
          'inline-block transform rounded-full bg-white dark:bg-gray-900 shadow-lg transition-transform',
          checked ? 'translate-x-7' : 'translate-x-1',
          dotSizes[size]
        )}
      />
    </button>
  );
};

export default Switch;
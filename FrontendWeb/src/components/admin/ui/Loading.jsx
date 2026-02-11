// src/components/ui/Loading.jsx
import React from 'react';

const Loading = ({ text = 'Chargement...', size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizes[size]} relative`}>
        <div className={`${sizes[size]} rounded-full border-4 border-gray-200 dark:border-gray-800`}></div>
        <div className={`${sizes[size]} rounded-full border-4 border-primary-500 border-t-transparent absolute top-0 left-0 animate-spin`}></div>
      </div>
      {text && (
        <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium animate-pulse-subtle">{text}</p>
      )}
    </div>
  );
};

export default Loading;
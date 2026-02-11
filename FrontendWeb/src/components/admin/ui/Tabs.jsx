// src/components/ui/Tabs.jsx
import React from 'react';
import clsx from 'clsx';


// Composant pour les onglets de navigation
const Tabs = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'default'
}) => {
  const variants = {
    default: 'border-gray-200 dark:bg-gray-800 dark:border-gray-800',
    primary: 'border-green-200',
  };

  return (
    <div className={`border-b ${variants[variant]} ${className}`}>
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center px-6 py-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:text-gray-100 font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-green-500 text-green-600'
                : 'border-transparent'
            )}
          >
            {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
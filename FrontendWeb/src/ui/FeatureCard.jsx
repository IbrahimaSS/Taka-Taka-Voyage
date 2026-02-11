import React from 'react';

const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon,
  iconColor = 'green',
  className = '',
  hover =true
}) => {
  const iconColors = {
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    gradient: "bg-gradient-to-r from-primaryGreen-start/20 to-primaryBlue-start/20",
    cyan: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400"
  };

  const iconTextColors = {
    green: "text-green-600 dark:text-green-400",
    blue: "text-blue-600 dark:text-blue-400",
    gradient: "text-transparent bg-clip-text bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start",
    cyan: "text-cyan-600 dark:text-cyan-400"
  };

  return (
    <div className={`
      group relative overflow-hidden rounded-2xl p-6 transition-all duration-300
      bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
      hover:shadow-xl hover:-translate-y-2 hover:border-primaryGreen-start/50
      before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-gray-700/20 before:to-transparent
      before:transition-transform before:duration-700 hover:before:translate-x-full
      ${className}
    `}>
      {Icon && (
        <div className={`
          w-14 h-14 rounded-full flex items-center justify-center mb-4
          ${iconColors[iconColor]}
        `}>
          <Icon className={iconTextColors[iconColor]} size={24} />
        </div>
      )}
      <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  );
};

export default FeatureCard;
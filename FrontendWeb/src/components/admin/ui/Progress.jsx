// src/components/ui/Progress.jsx
import React from 'react';
import clsx from 'clsx';

const Progress = ({
  value = 0,
  max = 100,
  size = 'md',
  color = 'green',
  showLabel = true,
  labelPosition = 'right',
  animated = false,
  striped = false,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  const colors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500',
    gray: 'bg-gray-500'
  };

  const colorGradients = {
    green: 'bg-gradient-to-r from-green-400 to-green-600',
    blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
    red: 'bg-gradient-to-r from-red-400 to-red-600',
    yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    purple: 'bg-gradient-to-r from-purple-400 to-purple-600'
  };

  const getStatusColor = (percent) => {
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-blue-600';
    if (percent >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusText = (percent) => {
    if (percent >= 90) return 'Excellent';
    if (percent >= 70) return 'Bon';
    if (percent >= 50) return 'Moyen';
    if (percent >= 30) return 'Faible';
    return 'Critique';
  };

  return (
    <div className={clsx('space-y-2', className)}>
      {/* Label and percentage */}
      {showLabel && labelPosition === 'top' && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Progression
          </span>
          <div className="flex items-center space-x-2">
            <span className={clsx('text-sm font-bold', getStatusColor(percentage))}>
              {percentage.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getStatusText(percentage)}
            </span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className={clsx('w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            striped && 'bg-stripes',
            animated && 'animate-pulse',
            colorGradients[color] || colors[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Bottom label */}
      {showLabel && labelPosition === 'right' && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {value} / {max}
          </span>
          <span className={clsx('text-sm font-bold', getStatusColor(percentage))}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}

      {/* With steps */}
      {Array.isArray(value) && (
        <div className="flex justify-between mt-2">
          {value.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={clsx(
                'w-2 h-2 rounded-full mb-1',
                step.completed ? colors[color] : 'bg-gray-300'
              )} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{step.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Striped animation CSS
const styles = `
  @keyframes stripes {
    0% { background-position: 1rem 0; }
    100% { background-position: 0 0; }
  }
  .bg-stripes {
    background-image: linear-gradient(
      45deg,
      rgba(255,255,255,0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255,255,255,0.15) 50%,
      rgba(255,255,255,0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 1rem 1rem;
    animation: stripes 1s linear infinite;
  }
`;

// Add styles to head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Progress;
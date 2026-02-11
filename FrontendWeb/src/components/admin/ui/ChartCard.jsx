// src/components/ui/ChartCard.jsx
import React from 'react';
import { useChart } from '../../../hooks/useCharts';

const ChartCard = ({ title, subtitle, chartConfig, height = '300px', className = '' }) => {
  const chartRef = useChart(chartConfig);

  return (
    <div className={`chart-container ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50 transition">
            Mensuel
          </button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            Annuel
          </button>
        </div>
      </div>
      <div style={{ height }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default ChartCard;
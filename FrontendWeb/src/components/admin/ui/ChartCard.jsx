import React, { useMemo } from 'react';
import clsx from 'clsx';
import { BarChart3 } from 'lucide-react';
import { useChart } from '../../../hooks/useCharts';



const ChartCard = ({ title, subtitle, chartConfig, height = '300px', className = '', currentPeriod, onPeriodChange }) => {
  const chartRef = useChart(chartConfig);

  const hasData = useMemo(() => {
    if (!chartConfig?.data?.datasets) return false;
    return chartConfig.data.datasets.some(dataset =>
      dataset.data && dataset.data.length > 0 && dataset.data.some(val => val > 0)
    );
  }, [chartConfig]);


  return (
    <div className={`chart-container ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{subtitle}</p>
        </div>
        {onPeriodChange && (
          <div className="flex space-x-2">
            <button
              onClick={() => onPeriodChange('mensuel')}
              className={clsx(
                "px-4 py-2 text-sm font-medium rounded-lg transition",
                currentPeriod === 'mensuel'
                  ? "bg-green-50 text-green-600 dark:bg-emerald-900/30 dark:text-emerald-200"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200 hover:bg-gray-200"
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => onPeriodChange('annuel')}
              className={clsx(
                "px-4 py-2 text-sm font-medium rounded-lg transition",
                currentPeriod === 'annuel'
                  ? "bg-green-50 text-green-600 dark:bg-emerald-900/30 dark:text-emerald-200"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200 hover:bg-gray-200"
              )}
            >
              Annuel
            </button>
          </div>
        )}
      </div>

      <div style={{ height }} className="relative">
        {hasData ? (
          <canvas ref={chartRef} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-900/20 rounded-xl border-2 border-dashed border-gray-100 dark:border-gray-800">
            <BarChart3 className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Aucune donnée disponible</p>
            <p className="text-xs mt-1 opacity-60">Pour la période : {currentPeriod === 'mensuel' ? 'ce mois-ci' : 'cette année'}</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChartCard;
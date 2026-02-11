// src/hooks/useCharts.js
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export const useChart = (config) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(chartRef.current, {
        ...config,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              titleColor: '#1F2937',
              bodyColor: '#4B5563',
              borderColor: '#E5E7EB',
              borderWidth: 1,
              cornerRadius: 8,
              callbacks: {
                label: (context) => {
                  return new Intl.NumberFormat('fr-FR').format(context.raw) + ' GNF';
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                drawBorder: false,
                color: 'rgba(0, 0, 0, 0.05)',
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
          animation: {
            duration: 2000,
            easing: 'easeOutQuart',
          },
          ...config.options,
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [config]);

  return chartRef;
};

// Configuration des graphiques prédéfinis
export const chartConfigs = {
  monthlyRevenue: {
    type: 'line',
    data: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [{
        label: 'Revenus (GNF)',
        data: [3200000, 4000000, 2400000, 4800000, 3600000, 2800000, 4400000, 3800000, 5200000, 4200000, 5600000, 6000000],
        borderColor: '#10B981',
        backgroundColor: 'rgba(36, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        hoverOffset: 15,
      }],
    },
  },

  revenueDistribution: {
    type: 'doughnut',
    data: {
      labels: ['Moto-taxi', 'Taxi partagé', 'Voiture privée'],
      datasets: [{
        data: [35, 45, 20],
        backgroundColor: ['#10B981', '#1E40AF', '#8B5CF6'],
        borderWidth: 0,
        hoverOffset: 15,
      }],
    },
    options: {
      cutout: '70%',
    },
  },

  activityChart: {
    type: 'line',
    data: {
      labels: Array.from({ length: 30 }, (_, i) => (i + 1).toString()),
      datasets: [{
        label: 'Trajets',
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 300),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      }],
    },
  },
};
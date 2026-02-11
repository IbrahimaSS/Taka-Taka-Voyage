import React from 'react';
import { motion } from 'framer-motion';
import { Car, Star, Wallet, Award, Navigation } from 'lucide-react';
import { usePassenger } from '../../context/PassengerContext';

const QuickStats = () => {
  const { passenger, trips, isLoadingLocation, hasLocationPermission } = usePassenger();

  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const cancelledTrips = trips.filter(t => t.status === 'cancelled').length;

  const stats = [
    {
      label: 'Trajets effectués',
      value: completedTrips,
      icon: Car,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      change: '+2 ce mois',
    },
    {
      label: 'Note moyenne',
      value: passenger.rating,
      icon: Star,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      change: 'Top 10%',
    },
    {
      label: 'GPS',
      value: isLoadingLocation ? '...' : hasLocationPermission ? 'Actif' : 'Inactif',
      icon: Navigation,
      color: isLoadingLocation ? 'text-gray-600 dark:text-gray-400' : hasLocationPermission ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bgColor: isLoadingLocation ? 'bg-gray-100 dark:bg-gray-800/40' : hasLocationPermission ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30',
      change: isLoadingLocation ? 'Chargement...' : hasLocationPermission ? 'Connecté' : 'À activer',
    },
    {
      label: 'Annulations',
      value: cancelledTrips,
      icon: Award,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      change: `${Math.round((cancelledTrips / trips.length) * 100)}%`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="passenger-card p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${stat.label === 'GPS' && !isLoadingLocation && !hasLocationPermission
                  ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                  : 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
                }`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default QuickStats;
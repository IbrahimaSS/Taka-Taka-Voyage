/**
 * AvailabilityToggle.jsx
 * Composant de bascule en ligne/hors ligne pour le chauffeur
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useDriverContext } from '../../context/DriverContext';

const AvailabilityToggle = ({ className = '' }) => {
    const { isOnline, isConnecting, status, toggleOnline, pendingRequestsCount } = useDriverContext();

    // Configuration des styles selon le statut
    const statusConfig = {
        available: {
            bg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700',
            iconBg: 'bg-emerald-100 dark:bg-emerald-800/50',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            text: 'text-emerald-700 dark:text-emerald-300',
            label: 'En ligne',
            indicator: 'bg-emerald-500'
        },
        busy: {
            bg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700',
            iconBg: 'bg-amber-100 dark:bg-amber-800/50',
            iconColor: 'text-amber-600 dark:text-amber-400',
            text: 'text-amber-700 dark:text-amber-300',
            label: 'Occupé',
            indicator: 'bg-amber-500'
        },
        offline: {
            bg: 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600',
            iconBg: 'bg-gray-200 dark:bg-gray-600',
            iconColor: 'text-gray-500 dark:text-gray-400',
            text: 'text-gray-600 dark:text-gray-300',
            label: 'Hors ligne',
            indicator: 'bg-gray-300'
        }
    };

    
    const currentConfig = statusConfig[status] || statusConfig.offline;

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Badge compteur (si nouvelles demandes) */}
            {isOnline && pendingRequestsCount > 0 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative"
                >
                    <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white shadow-lg">
                        {pendingRequestsCount}
                    </span>
                </motion.div>
            )}

            {/* Toggle Switch */}
            <motion.button
                onClick={toggleOnline}
                disabled={isConnecting }
                className={`
          relative flex items-center gap-2 px-3 py-2 rounded-xl
          transition-all duration-300 ease-out
          ${currentConfig.bg} border
          hover:shadow-md
          disabled:opacity-80 disabled:cursor-not-allowed
        `}
                whileTap={{ scale: 0.98 }}
                aria-label={isOnline ? 'Se mettre hors ligne' : 'Se mettre en ligne'}
            >
                {/* Indicateur de pulsation quand en ligne */}
                {isOnline && !isConnecting && (
                    <motion.span
                        className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${currentConfig.indicator}`}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.7, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                )}

                {/* Icône */}
                <div className={`
          p-1.5 rounded-lg transition-colors duration-300
          ${currentConfig.iconBg}
        `}>
                    {isConnecting ? (
                        <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                    ) : isOnline ? (
                        <Wifi className={`w-4 h-4 ${currentConfig.iconColor}`} />
                    ) : (
                        <WifiOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                </div>

                {/* Texte de statut */}
                <div className="flex flex-col items-start">
                    <span className={`
            text-xs font-bold transition-colors duration-300
            ${currentConfig.text}
          `}>
                        {isConnecting ? 'Connexion...' : currentConfig.label}
                    </span>
                </div>

                {/* Switch visuel */}
                <div className={`
          relative w-10 h-5 rounded-full transition-colors duration-300
          ${isOnline ? currentConfig.indicator : 'bg-gray-300 dark:bg-gray-500'}
        `}>
                    <motion.div
                        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                        animate={{
                            left: isOnline ? '22px' : '2px',
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                        }}
                    />
                </div>
            </motion.button>
        </div>
    );
};

export default AvailabilityToggle;

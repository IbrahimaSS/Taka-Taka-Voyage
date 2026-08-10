/**
 * AvailabilityToggle.jsx
 * Composant de bascule en ligne/hors ligne pour le chauffeur
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useDriverContext } from '../../context/DriverContext';
import { useTranslation } from 'react-i18next';

const AvailabilityToggle = ({ className = '' }) => {
    const { t } = useTranslation();
    const { isOnline, isConnecting, status, toggleOnline, tripRequests } = useDriverContext();
    const pendingRequestsCount = tripRequests?.length || 0;

    // Configuration des styles selon le statut
    const statusConfig = {
        available: {
            bg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700',
            iconBg: 'bg-emerald-100 dark:bg-emerald-800/50',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            text: 'text-emerald-700 dark:text-emerald-300',
            label: t('common.online'),
            indicator: 'bg-emerald-500'
        },
        busy: {
            bg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700',
            iconBg: 'bg-amber-100 dark:bg-amber-800/50',
            iconColor: 'text-amber-600 dark:text-amber-400',
            text: 'text-amber-700 dark:text-amber-300',
            label: t('common.busy'),
            indicator: 'bg-amber-500'
        },
        offline: {
            bg: 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600',
            iconBg: 'bg-gray-200 dark:bg-gray-600',
            iconColor: 'text-gray-500 dark:text-gray-400',
            text: 'text-gray-600 dark:text-gray-300',
            label: t('common.offline'),
            indicator: 'bg-gray-300'
        }
    };


    const currentConfig = statusConfig[status] || statusConfig.offline;

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Version compacte (mobile) : icone seule, toujours atteignable au pouce */}
            <div className="relative md:hidden">
                <motion.button
                    onClick={toggleOnline}
                    disabled={isConnecting}
                    className={`
            relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0
            transition-all duration-300 ease-out
            ${currentConfig.bg} border
            disabled:opacity-80 disabled:cursor-not-allowed
          `}
                    whileTap={{ scale: 0.92 }}
                    aria-label={isOnline ? t('common.set_offline') : t('common.set_online')}
                >
                    {isConnecting ? (
                        <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                    ) : isOnline ? (
                        <Wifi className={`w-5 h-5 ${currentConfig.iconColor}`} />
                    ) : (
                        <WifiOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                    {isOnline && !isConnecting && (
                        <motion.span
                            className={`absolute top-1 right-1 h-2.5 w-2.5 rounded-full ${currentConfig.indicator}`}
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    )}
                </motion.button>
                {isOnline && pendingRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-lg pointer-events-none">
                        {pendingRequestsCount}
                    </span>
                )}
            </div>

            {/* Version complete (tablette/desktop) : pill avec libelle et switch */}
            <div className="hidden md:flex items-center gap-3">
                {/* Badge compteur (si nouvelles demandes) */}
                {isOnline && pendingRequestsCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="relative"
                    >
                        <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-lg">
                            {pendingRequestsCount}
                        </span>
                    </motion.div>
                )}

                {/* Toggle Switch */}
                <motion.button
                    onClick={toggleOnline}
                    disabled={isConnecting}
                    className={`
            relative flex items-center gap-2 px-3 py-2 rounded-xl
            transition-all duration-300 ease-out
            ${currentConfig.bg} border
            hover:shadow-md
            disabled:opacity-80 disabled:cursor-not-allowed
          `}
                    whileTap={{ scale: 0.98 }}
                    aria-label={isOnline ? t('common.set_offline') : t('common.set_online')}
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
                            {isConnecting ? t('common.connecting') : currentConfig.label}
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
        </div>
    );
};

export default AvailabilityToggle;

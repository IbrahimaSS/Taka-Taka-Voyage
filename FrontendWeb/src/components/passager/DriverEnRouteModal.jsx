import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, Phone } from 'lucide-react';

const DriverEnRouteModal = ({ driver, onTrack, onContact }) => {
    if (!driver) return null;

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed bottom-24 right-4 z-[9999] pointer-events-none flex justify-end"
        >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-l-4 border-green-500 p-4 w-80 pointer-events-auto backdrop-blur-xl">
                <div className="flex items-center space-x-4">
                    {/* Photo Chauffeur */}
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden border-2 border-blue-500 shadow-md">
                            {driver.photo ? (
                                <img src={driver.photo} alt={driver.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                    {driver.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                    </div>

                    {/* Infos Textuelles */}
                    <div className="flex-1 min-w-0 mr-4">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                            {driver.name}
                        </h4>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate">
                            Est en route vers vous
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {driver.vehicle?.brand} {driver.vehicle?.model} • {driver.vehicle?.plate}
                        </p>
                    </div>
                </div>

                <div className="mt-3 flex justify-end">
                    <button
                        onClick={onTrack}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-blue-600/20 transition-transform active:scale-95 flex items-center space-x-2 text-sm font-bold"
                    >
                        <Navigation className="w-4 h-4" />
                        <span>Suivre sur la carte</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default DriverEnRouteModal;

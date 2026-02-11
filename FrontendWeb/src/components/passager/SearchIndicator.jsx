// =====================================================
// ✅ SearchIndicator.jsx — PATCH FINAL (important)
// Objectif: "Voir sur la carte" utilise bien onTrack
// (sinon tu restes en recherche et tu crois que rien ne change)
// =====================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, X, Phone, Navigation, User } from 'lucide-react';

const SearchIndicator = ({
  status,
  driver,
  tripDetails,
  onGoToHome,
  onCancel,
  onContact,
  onTrack
}) => {
  if (status !== 'searching' && status !== 'driver_found' && status !== 'approaching' && status !== 'arrived') return null;

  const isSearching = status === 'searching';
  const isDriverFound = status === 'driver_found' || status === 'approaching' || status === 'arrived';
  const canTrack = status === 'approaching' || status === 'arrived';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9998] w-[calc(100%-2rem)] max-w-lg"
      >
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {isSearching && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-green-500"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{ width: '50%' }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center"
                    >
                      <Loader className="w-6 h-6 text-white animate-spin" />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-blue-600"
                    />
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">Recherche en cours...</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Recherche du meilleur chauffeur</p>
                  </div>
                </div>

                <button
                  onClick={onCancel}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  title="Annuler la recherche"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {tripDetails && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span className="truncate max-w-[200px]">{tripDetails.pickup}</span>
                  <span className="mx-2">→</span>
                  <span className="truncate max-w-[200px]">{tripDetails.destination}</span>
                </div>
              )}
            </motion.div>
          )}

          {isDriverFound && driver && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-600" />

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                    <User className="w-7 h-7 text-white" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{driver.name}</h4>
                      <span className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                        <span className="text-yellow-500">★</span> {driver.rating ?? "—"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {driver.vehicle?.brand || ""} {driver.vehicle?.model || ""} • {driver.vehicle?.plate || ""}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 font-medium">
                      📞 {driver.phone || "—"} • ✉️ {driver.email || "—"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{driver.eta ?? "—"}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{driver.distance ?? "—"}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                {canTrack && (
                  <button
                    onClick={onTrack}
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-medium flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Suivre sur la carte
                  </button>
                )}

                <button
                  onClick={onContact}
                  className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  title="Appeler le chauffeur"
                >
                  <Phone className="w-5 h-5" />
                </button>

                <button
                  onClick={onCancel}
                  className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  title="Annuler"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchIndicator;

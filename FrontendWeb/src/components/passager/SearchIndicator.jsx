// =====================================================
// ✅ SearchIndicator.jsx — PATCH FINAL (important)
// Objectif: "Voir sur la carte" utilise bien onTrack
// (sinon tu restes en recherche et tu crois que rien ne change)
// =====================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, X, Phone, Navigation, User } from 'lucide-react';
import DriverDetailCard from './DriverDetailCard'; // Import du nouveau composant
import DriverEnRouteModal from './DriverEnRouteModal';

import toast from 'react-hot-toast';

const SearchIndicator = ({
  status,
  driver,
  tripDetails,
  onGoToHome,
  onCancel,
  onContact,
  onTrack
}) => {
  // Status concernés : searching, driver_found, approaching, arrived
  if (!['searching', 'driver_found', 'approaching', 'arrived'].includes(status)) return null;

  const isSearching = status === 'searching';
  // driver_found = Grand Modal (qui s'auto-hide)
  const isDriverFound = status === 'driver_found';
  // approaching = Petit Modal "En Route" (quand le chauffeur clique Rejoindre)
  const isApproaching = status === 'approaching' || status === 'arrived'; // On garde aussi pour arrived

  /* Gestion de la visibilité temporaire (30s) pour driver_found */
  const [isCardVisible, setIsCardVisible] = React.useState(true);

  // Reset visibilité quand le statut change (ex: passe de driver_found à approaching)
  React.useEffect(() => {
    setIsCardVisible(true);
  }, [status]);

  React.useEffect(() => {
    if (isDriverFound) {
      setIsCardVisible(true);
      const timer = setTimeout(() => setIsCardVisible(false), 10000); // 10 secondes
      return () => clearTimeout(timer);
    }
  }, [isDriverFound, driver?.id]);

  /* Notification "Chauffeur en route" */
  React.useEffect(() => {
    if (status === 'approaching') {
      toast.success("Votre chauffeur est en route pour vous récupérer !", {
        duration: 5000,
        icon: '🚗',
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: 'bold',
        },
      });
    }
  }, [status]);

  const handleRestore = () => setIsCardVisible(true);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-6 left-0 right-0 z-[9998] px-4 pointer-events-none flex justify-center"
      >
        <div className="w-full max-w-lg pointer-events-auto">
          {/* CAS 1: RECHERCHE EN COURS */}
          {isSearching && (
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
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
            </div>
          )}

          {/* CAS 2: CHAUFFEUR TROUVÉ (Grand Modal Auto-Hide 10s puis RIEN) */}
          {isDriverFound && driver && (
            <AnimatePresence mode="wait">
              {isCardVisible && (
                <DriverDetailCard
                  key="full-card"
                  driver={driver}
                  onContact={onContact}
                  onCancel={onCancel}
                  onTrack={onTrack || onGoToHome}
                />
              )}
            </AnimatePresence>
          )}

          {/* CAS 3: CHAUFFEUR EN ROUTE (Petit Modal - Après clic Rejoindre) */}
          {(isApproaching || status === 'arrived') && driver && isCardVisible && (
            <DriverEnRouteModal
              driver={driver}
              onTrack={() => {
                setIsCardVisible(false); // Masquer le modal pour voir la carte en dessous
                if (onTrack) onTrack();
              }}
              onContact={onContact}
            />
          )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchIndicator;

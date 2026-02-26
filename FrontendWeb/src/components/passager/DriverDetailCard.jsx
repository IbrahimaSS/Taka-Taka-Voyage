import React from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  X,
  MapPin,
  ShieldCheck,
  Star,
  Navigation,
  Car
} from 'lucide-react';

const DriverDetailCard = ({ driver, onContact, onCancel, onTrack }) => {
  if (!driver) return null;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 50, opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 w-full mb-2"
    >
      {/* En-tête COMPACT avec dégradé */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 relative overflow-hidden flex items-center justify-between">
        <div className="flex items-center space-x-2 relative z-10">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <h3 className="text-white font-bold text-base">Chauffeur : Trouvé</h3>
        </div>

        <button
          onClick={onCancel}
          className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm relative z-10"
          title="Annuler la course"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Déco subtile */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-12 blur-xl"></div>
      </div>

      {/* Contenu principal - Layout Compact */}
      <div className="p-4">
        <div className="flex items-start">
          {/* Avatar Compact */}
          <div className="relative mr-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 p-0.5 shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden">
                {(() => {
                  const avatar = driver.photo;
                  if (avatar && (avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('/'))) {
                    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                    const baseUrl = apiURL.replace(/\/api$/, '');
                    const avatarUrl = (avatar.startsWith('data:') || avatar.startsWith('http'))
                      ? avatar
                      : `${baseUrl}${avatar.startsWith('/') ? avatar : `/${avatar}`}`;

                    return (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    );
                  }
                  return null;
                })()}
                <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl uppercase">
                  {driver.name ? driver.name.split(' ').map(n => n[0]).filter(c => /[a-z0-9]/i.test(c)).join('').slice(0, 2) : '?'}
                </div>
              </div>
            </div>
            {driver.verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white dark:border-gray-900">
                <ShieldCheck className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Infos Chauffeur */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">{driver.name}</h2>
                <div className="flex items-center mt-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{driver.rating || "5.0"}</span>
                  <span className="text-xs text-gray-500 ml-1">({driver.tripsCount || "100+"})</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600 dark:text-green-400">{driver.eta || "Proche"}</p>
                <p className="text-xs text-gray-500">{driver.distance}</p>
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
              <div className="flex items-center">
                <Car className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                <span className="truncate">{driver.vehicle?.brand} {driver.vehicle?.model} • {driver.vehicle?.plate}</span>
              </div>
              {(driver.phone || driver.email) && (
                <div className="flex items-center text-xs text-gray-500 pt-1">
                  {driver.phone && <span className="mr-3 flex items-center"><Phone className="w-3 h-3 mr-1" /> {driver.phone}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions - Boutons moins hauts */}
        <div className="grid grid-cols-5 gap-3 mt-4">
          <button
            onClick={onContact}
            className="col-span-4 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-bold text-base flex items-center justify-center shadow-lg shadow-green-500/20 active:scale-95 transition-all"
          >
            <Phone className="w-4 h-4 mr-2" />
            Appeler
          </button>

          <button
            onClick={onTrack}
            className="col-span-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl flex items-center justify-center transition-colors"
            title="Voir sur la carte"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DriverDetailCard;

import { motion } from 'framer-motion';
import { Navigation, Car, Star } from 'lucide-react';

const TripInfoCard = ({ tripData, currentTime }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-8 mb-8 border border-white/20 dark:border-white/5 shadow-2xl"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Itinéraire */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          Détails du trajet
        </h3>

        <div className="relative pl-8 space-y-8">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-red-500" />

          <div className="relative">
            <div className="absolute -left-[27px] w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-green-500 z-10" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Départ</p>
            <p className="font-bold text-gray-800 dark:text-gray-200 line-clamp-2">{tripData?.departure}</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[27px] w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-red-500 z-10" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Arrivée</p>
            <p className="font-bold text-gray-800 dark:text-gray-200 line-clamp-2">{tripData?.destination}</p>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            <Car className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Chauffeur</p>
            <p className="font-bold text-gray-800 dark:text-gray-200">{tripData?.driver}</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(tripData?.driverRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{tripData?.driverRating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Distance</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{tripData?.distance}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Durée</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{tripData?.duration}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Heure de départ</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {tripData?.startTime || '--:--'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Heure d'arrivée</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {tripData?.endTime || currentTime}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Reçu détaillé */}
    <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Détails du paiement</h3>
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Prix de base</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{(tripData?.pricing?.base || 0).toLocaleString()} GNF</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Frais de service</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{(tripData?.pricing?.serviceFee || 0).toLocaleString()} GNF</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Supplément trafic</span>
            <span className="font-medium text-green-600 dark:text-green-400">{(tripData?.pricing?.trafficSurcharge || 0).toLocaleString()} GNF</span>
          </div>
          <div className="flex justify-between items-center pt-3">
            <span className="text-gray-800 dark:text-gray-100 font-bold">Total</span>
            <span className="text-xl font-bold text-green-700 dark:text-green-500">
              {((tripData?.pricing?.base || 0) + (tripData?.pricing?.serviceFee || 0)).toLocaleString()} GNF
            </span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default TripInfoCard;

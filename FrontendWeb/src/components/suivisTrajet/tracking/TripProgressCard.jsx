import { motion } from 'framer-motion';
import { MapPin, ChevronRight, User, Star, Car, Gauge, Clock } from 'lucide-react';

const TripProgressCard = ({
  isTripEnded,
  tripData,
  progress,
  realTimeMetrics,
  estimatedArrival,
  speed,
  role,
  driverCtx,
  trip,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-6 mb-6 border border-white/20 dark:border-white/5"
  >
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {isTripEnded ? 'Trajet terminé' : 'Trajet en cours'}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
            <span className="text-sm">{tripData.departure.name}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
            <span className="text-sm">{tripData.destination.name}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`px-4 py-2 rounded-full flex items-center ${isTripEnded ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${isTripEnded ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
          <span className="font-medium">{isTripEnded ? 'Terminé' : 'En cours'}</span>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Arrivée estimée</p>
          <p className="text-xl font-bold text-green-700 dark:text-green-500">{estimatedArrival}</p>
        </div>
      </div>
    </div>

    {/* Barre de progression */}
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <span className="text-gray-600 dark:text-gray-300">Progression du trajet</span>
        <span className="font-bold text-green-700 dark:text-green-400">{progress}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-500 to-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
        <span>{realTimeMetrics.distanceTraveled.toFixed(2)} km parcourus</span>
        <span>{realTimeMetrics.distanceRemaining.toFixed(2)} km restants</span>
      </div>
    </div>

    {/* Cartes d'information rapide */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <motion.div
        whileHover={{ y: -4 }}
        className="passenger-card dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700/50"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {role === 'driver' ? (driverCtx?.acceptedTrips?.length > 1 ? 'Passagers à bord' : 'Passager') : 'Chauffeur'}
            </p>
            <p className="font-bold text-gray-800 dark:text-gray-100">
              {role === 'driver'
                ? (driverCtx?.acceptedTrips?.length > 1
                  ? driverCtx.acceptedTrips.map(t => t.passengerName || t.nom).filter(Boolean).join(', ')
                  : (trip?.passengerName || 'Passager'))
                : tripData.driver.name}
            </p>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(tripData.driver.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                />
              ))}
              <span className="text-xs text-gray-600 dark:text-gray-500 ml-1">{tripData.driver.rating}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -4 }}
        className="passenger-card dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700/50"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Véhicule</p>
            <p className="font-bold text-gray-800 dark:text-gray-100">
              {tripData.driver.vehicle.brand} {tripData.driver.vehicle.model}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-500">{tripData.driver.vehicle.plate}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -4 }}
        className="passenger-card dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700/50"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <Gauge className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Vitesse</p>
            <p className="font-bold text-gray-800 dark:text-gray-100">{speed} km/h</p>
            <p className="text-xs text-gray-600 dark:text-gray-500">{speed > 50 ? 'Rapide' : 'Modérée'}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -4 }}
        className="passenger-card dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700/50"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Temps restant</p>
            <p className="font-bold text-gray-800 dark:text-gray-100">{realTimeMetrics.formattedDuration || '-- min'}</p>
            <p className="text-xs text-gray-600 dark:text-gray-500">Arrivée: {estimatedArrival}</p>
          </div>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

export default TripProgressCard;

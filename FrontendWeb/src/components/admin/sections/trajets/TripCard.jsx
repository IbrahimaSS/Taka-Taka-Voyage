import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navigation, MapPin, Calendar, Eye, PlayCircle } from 'lucide-react';
import Badge from '../../ui/Badge';
import Button from '../../ui/Bttn';
import { getStatusBadge } from './tripBadges';
import { getAvatarUrl, getUserAvatarInitials } from './tripHelpers';

// Composant de carte de trajet (vue grille)
const TripCard = ({ trip, onSelect, onFollow }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-900 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
      onClick={() => onSelect(trip)}
    >
      {/* En-tête avec status */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-900">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs">
                {trip.id}
              </Badge>
              {getStatusBadge(trip.status, t)}
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 group-hover:text-emerald-700 transition-colors">
              {trip.route}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{trip.time} • {trip.distance} • {trip.duration}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{trip.amount}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{trip.paymentMethod}</div>
          </div>
        </div>

        {/* Points sur la ligne */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <div className="w-24 h-1 bg-emerald-300 mx-2"></div>
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{trip.efficiency || 0}% efficacité</div>
        </div>
      </div>

      {/* Passager et Chauffeur */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="relative w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 overflow-hidden mr-3">
              <span className="z-0">{getUserAvatarInitials(trip.passenger)}</span>
              {trip.passenger.photoUrl && (
                <img
                  src={getAvatarUrl(trip.passenger.photoUrl)}
                  alt={trip.passenger.name}
                  className="absolute inset-0 w-full h-full object-cover z-10"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{trip.passenger.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Passager</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="relative w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800 overflow-hidden mr-3">
              <span className="z-0">{getUserAvatarInitials(trip.driver)}</span>
              {trip.driver.photoUrl && (
                <img
                  src={getAvatarUrl(trip.driver.photoUrl)}
                  alt={trip.driver.name}
                  className="absolute inset-0 w-full h-full object-cover z-10"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{trip.driver.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Chauffeur</p>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-900 grid grid-cols-2 gap-3">
          <div className="flex items-center text-sm">
            <Navigation className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
            <span className="text-gray-700 dark:text-gray-200">{trip.startLocation.district}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
            <span className="text-gray-700 dark:text-gray-200">{trip.endLocation.district}</span>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-900 bg-gray-50/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            {trip.date}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="small"
              icon={Eye}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(trip);
              }}
            />
            {trip.status === 'in-progress' && (
              <Button
                variant="ghost"
                size="small"
                icon={PlayCircle}
                onClick={(e) => {
                  e.stopPropagation();
                  onFollow(trip);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TripCard;

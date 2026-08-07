import { motion } from 'framer-motion';
import { Car, Users, Fuel, Star, Calendar, Loader2, Crown, Gauge, Truck, Bus, Sparkles } from 'lucide-react';
import { getFullAssetURL } from '../../../utils/urlHelper';
import ReservationLocationModal from '../../home/ReservationLocationModal';

const flotteCategories = [
  { id: 'TOUS', label: 'Tous', icon: Sparkles },
  { id: 'VIP', label: 'VIP', icon: Crown },
  { id: 'SUV', label: 'SUV', icon: Car },
  { id: 'BERLINE', label: 'Berline', icon: Car },
  { id: 'ÉCONOMIQUE', label: 'Économique', icon: Gauge },
  { id: 'PICK-UP 4X4', label: '4x4', icon: Truck },
  { id: 'BUS', label: 'Bus', icon: Bus },
];

const categoryStyles = {
  VIP: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  SUV: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  BERLINE: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
  ÉCONOMIQUE: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  BUS: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
};

const formatPrix = (prix) => new Intl.NumberFormat('fr-GN').format(prix || 0);

const LocationRentalPanel = ({
  vehiculesFiltres, loadingFlotte, activeFlotteCategory, onCategoryChange,
  onReserverVehicule, isModalOpen, onCloseModal, selectedVehicule,
}) => {
  return (
    <div className="space-y-5">
      {/* Filtres catégories */}
      <div className="flex flex-wrap gap-2">
        {flotteCategories.map((cat) => {
          const isActive = activeFlotteCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${isActive
                ? 'text-white bg-gradient-to-r from-emerald-500 to-blue-600 shadow-md'
                : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <Icon size={12} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grille des véhicules */}
      {loadingFlotte ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
          <p className="text-gray-500 animate-pulse">Chargement de la flotte...</p>
        </div>
      ) : vehiculesFiltres.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar-v5">
          {vehiculesFiltres.map((vehicule) => {
            const isDisponible = vehicule.statut === 'DISPONIBLE';
            return (
              <motion.div
                key={vehicule._id || vehicule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-900/80 shadow-sm hover:shadow-xl hover:border-emerald-400/40 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-36 overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={getFullAssetURL(vehicule.photo || (vehicule.photos && vehicule.photos[0]))}
                    alt={`${vehicule.marque} ${vehicule.modele}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Badge Catégorie */}
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${categoryStyles[vehicule.categorie] || 'bg-gray-500/20 text-gray-600 border-gray-500/30'}`}>
                    {vehicule.categorie}
                  </div>
                  {/* Badge Statut */}
                  <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md border ${isDisponible
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    : 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isDisponible ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    {isDisponible ? 'Disponible' : 'Loué'}
                  </div>
                </div>

                {/* Infos */}
                <div className="p-3">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                    {vehicule.marque} {vehicule.modele}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <Users size={10} className="text-emerald-500" />
                      {vehicule.places || vehicule.caracteristiques?.nb_places} pl.
                    </span>
                    <span className="w-px h-2.5 bg-gray-300 dark:bg-gray-600" />
                    <span className="flex items-center gap-0.5">
                      <Fuel size={10} className="text-blue-500" />
                      {vehicule.carburant || vehicule.caracteristiques?.type_carburant || 'Diesel'}
                    </span>
                    <span className="w-px h-2.5 bg-gray-300 dark:bg-gray-600" />
                    <span className="flex items-center gap-0.5">
                      <Star size={10} className="fill-yellow-400 text-yellow-400" />
                      {vehicule.note}
                    </span>
                  </div>

                  {/* Prix + Bouton */}
                  <div className="flex items-end justify-between mt-3">
                    <div>
                      <p className="text-lg font-extrabold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                        {formatPrix(vehicule.prix_jour)}
                        <span className="text-[9px] font-medium text-gray-400 ml-1">GNF/j</span>
                      </p>
                    </div>
                    <button
                      onClick={() => onReserverVehicule(vehicule)}
                      disabled={!isDisponible}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isDisponible
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <Calendar size={12} />
                      Réserver
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-gray-400">
          <Car size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun véhicule dans cette catégorie</p>
        </div>
      )}

      {/* Modal de Réservation Location */}
      <ReservationLocationModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        vehicule={selectedVehicule}
      />
    </div>
  );
};

export default LocationRentalPanel;

import { Car, CheckCircle, XCircle } from 'lucide-react';
import { documentTypes, vehicleTypes } from './useDriverRegistrationForm';

// Classes completes et statiques (pas de template litteral dynamique type
// `border-${accent}-500`) pour rester visibles au scan JIT de Tailwind.
const VEHICLE_ACCENT_CLASSES = {
  blue: {
    selected: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    label: 'text-blue-700 dark:text-blue-400',
  },
  amber: {
    selected: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
    label: 'text-amber-700 dark:text-amber-400',
  },
  indigo: {
    selected: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
    label: 'text-indigo-700 dark:text-indigo-400',
  },
};

// Colonne droite (type de vehicule + formulaire + recapitulatif) - extraite
// de InscriptionChauffeur.jsx (decomposition). UI/UX et responsive revus :
// chaque type de vehicule a sa propre couleur d'accent (au lieu du meme
// bleu partout), rangee horizontale compacte sur mobile / carte centree
// des sm:, icone agrandie pour mieux mettre en valeur les illustrations.
const VehicleInfoForm = ({ driverData, validationErrors, onVehicleChange }) => {
  return (
    <div className="space-y-6">
      <div className="border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Car className="w-5 h-5 text-green-500" />
          Informations du véhicule
        </h3>

        <div className="space-y-6">
          {/* Type de véhicule */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-3 font-medium">
              Type de véhicule
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {vehicleTypes.map((type) => {
                const isSelected = driverData.vehicle.type === type.value;
                const accent = VEHICLE_ACCENT_CLASSES[type.accent];
                return (
                  <button
                    type="button"
                    key={type.value}
                    onClick={() => onVehicleChange('type', type.value)}
                    aria-pressed={isSelected}
                    className={`min-h-[44px] p-3 sm:p-4 rounded-xl border-2 transition-all flex items-center gap-3 sm:flex-col sm:gap-0 sm:text-center ${isSelected
                      ? accent.selected
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                  >
                    <div className="w-14 h-11 sm:w-20 sm:h-16 sm:mb-3 sm:mx-auto shrink-0 flex items-center justify-center">
                      <img src={type.icon} alt={type.label} className="max-w-full max-h-full object-contain drop-shadow-md" />
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? accent.label : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formulaire véhicule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Marque
              </label>
              <input
                type="text"
                value={driverData.vehicle.brand}
                onChange={(e) => onVehicleChange('brand', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${validationErrors.brand
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent`}
                placeholder="Toyota"
              />
              {validationErrors.brand && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.brand}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Modèle
              </label>
              <input
                type="text"
                value={driverData.vehicle.model}
                onChange={(e) => onVehicleChange('model', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${validationErrors.model
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent`}
                placeholder="Corolla"
              />
              {validationErrors.model && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.model}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Immatriculation
              </label>
              <input
                type="text"
                value={driverData.vehicle.plate}
                onChange={(e) => onVehicleChange('plate', e.target.value.toUpperCase())}
                className={`w-full px-4 py-3 rounded-xl border ${validationErrors.plate
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent font-mono`}
                placeholder="AB-123-CD"
              />
              {validationErrors.plate && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.plate}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Couleur
              </label>
              <input
                type="text"
                value={driverData.vehicle.color}
                onChange={(e) => onVehicleChange('color', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${validationErrors.color
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent`}
                placeholder="Blanc"
              />
              {validationErrors.color && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.color}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Année
              </label>
              <input
                type="number"
                min="2000"
                max={new Date().getFullYear() + 1}
                value={driverData.vehicle.year}
                onChange={(e) => onVehicleChange('year', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Capacité (nombre de places)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={driverData.vehicle.capacity}
                  onChange={(e) => onVehicleChange('capacity', e.target.value)}
                  className="flex-1 accent-blue-600 dark:accent-green-500"
                />
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400 min-w-[3rem]">
                  {driverData.vehicle.capacity} place{driverData.vehicle.capacity > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
        <h4 className="font-medium text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Récapitulatif
        </h4>
        <div className="space-y-3">
          {documentTypes.map((doc) => (
            <div key={doc.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{doc.label}</span>
              {driverData[doc.key] ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
          ))}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800 dark:text-white">Véhicule</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {driverData.vehicle.brand ? `${driverData.vehicle.brand} ${driverData.vehicle.model}` : 'Non spécifié'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleInfoForm;

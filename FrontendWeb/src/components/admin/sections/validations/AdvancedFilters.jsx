import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Filter, ChevronDown } from 'lucide-react';

// Composant réutilisable pour les filtres avancés
const AdvancedFilters = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const filterOptions = {
    vehicleType: [t('common.all') || 'Tous', t('services.moto_taxi') || 'Moto-taxi', t('services.taxi_partage') || 'Taxi partagé', t('services.voiture_privee') || 'Voiture privée', t('services.truck') || 'Camion'],
    status: [t('common.all') || 'Tous', t('common.new') || 'Nouveau', t('common.pending') || 'En attente', t('common.in_review') || 'En révision'],
    dateRange: [t('common.all') || 'Tous', t('common.today') || "Aujourd'hui", t('common.this_week') || 'Cette semaine', t('common.this_month') || 'Ce mois', t('common.custom') || 'Personnalisé'],
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
          <span className="font-medium text-gray-700 dark:text-gray-200">{t('common.advanced_filters') || 'Filtres avancés'}</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="min-h-11 px-2 -mr-2 text-green-600 text-sm font-medium flex items-center"
        >
          {expanded ? t('common.collapse', 'Réduire') : t('common.expand', 'Développer')}
          <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('drivers.vehicle_type', 'Type de véhicule')}
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-900 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
              value={filters.vehicleType}
              onChange={(e) => onFilterChange('vehicleType', e.target.value)}
            >
              {filterOptions.vehicleType.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('common.status') || 'Statut'}
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-900 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              {filterOptions.status.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('common.period', 'Période')}
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-900 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
              value={filters.dateRange}
              onChange={(e) => onFilterChange('dateRange', e.target.value)}
            >
              {filterOptions.dateRange.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedFilters;

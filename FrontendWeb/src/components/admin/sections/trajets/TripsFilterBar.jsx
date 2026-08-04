import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, X, Filter, RefreshCw } from 'lucide-react';
import Button from '../../ui/Bttn';
import ExportDropdown from '../../ui/ExportDropdown';

const TripsFilterBar = ({
  search,
  onSearchChange,
  onClearSearch,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  filters,
  onFilterChange,
  onResetFilters,
  showToast,
  exportData,
  exportColumns
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 dark:border-gray-900/40 rounded-2xl shadow-sm border border-gray-100  p-6"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder={t('trips.search_placeholder')}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 dark:border-gray-900/40 border-2 border-gray-200 dark:border-gray-900/40 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {search && (
              <button
                onClick={onClearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-lg"
              >
                <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            icon={Filter}
            onClick={onToggleAdvancedFilters}
            className='text-sm'
          >
            {t('trips.advanced_filters')}
          </Button>
          <ExportDropdown
            data={exportData}
            columns={exportColumns}
            fileName="trajets_taka_taka"
            title={t('trips.title')}
            showToast={(title, msg, type) => showToast(title, msg, type)}
          />
        </div>
      </div>

      {/* Filtres avancés */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-900/40"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Date</label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => onFilterChange('date', e.target.value)}
                  className="w-full border border-gray-300 dark:bg-gray-800  dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Statut</label>
                <select
                  className="w-full border dark:bg-gray-800  border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  value={filters.status}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                >
                  <option value="all">{t('common.all_status')}</option>
                  <option value="pending">{t('trips.status.pending')}</option>
                  <option value="in-progress">{t('trips.status.in_progress')}</option>
                  <option value="completed">{t('trips.status.completed')}</option>
                  <option value="cancelled">{t('trips.status.cancelled')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Type véhicule</label>
                <select
                  className="w-full border dark:bg-gray-800  border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  value={filters.vehicleType}
                  onChange={(e) => onFilterChange('vehicleType', e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Peugeot">Peugeot</option>
                  <option value="Honda">Honda</option>
                  <option value="Kia">Kia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Départ</label>
                <input
                  type="text"
                  placeholder="Lieu de départ"
                  value={filters.departure}
                  onChange={(e) => onFilterChange('departure', e.target.value)}
                  className="w-full border dark:bg-gray-800  border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Destination</label>
                <input
                  type="text"
                  placeholder="Lieu d'arrivée"
                  value={filters.destination}
                  onChange={(e) => onFilterChange('destination', e.target.value)}
                  className="w-full border dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                icon={RefreshCw}
                onClick={onResetFilters}
              >
                Réinitialiser
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  showToast({
                    type: 'success',
                    title: 'Filtres appliqués',
                    message: 'Les filtres ont été appliqués avec succès'
                  });
                }}
              >
                Appliquer les filtres
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TripsFilterBar;

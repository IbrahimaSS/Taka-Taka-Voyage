import { Search, RefreshCw } from 'lucide-react';
import Card, { CardContent } from '../../ui/Card';
import ExportDropdown from '../../ui/ExportDropdown';

const DriversFilterBar = ({
  searchTerm,
  onSearchChange,
  filterOptions,
  selectedFilters,
  onFilterChange,
  exportColumns,
  filteredDrivers,
  onClearFilters,
  showToast,
  t
}) => {
  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="grid justify-end grid-cols-1 md:grid-cols-1 gap-4">
            <div className="relative ">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder={`${t('drivers.search_placeholder') || 'Rechercher par nom, téléphone, email, véhicule'}...`}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:bg-gray-800 dark:border-gray-900 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition text-base"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

          </div>
          {/* Boutons d'action des filtres */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 items-center">
            <div className='relative w-full'>
              <select
                className="w-full dark:bg-gray-800 lg:w-[200px]  border border-gray-200 dark:border-gray-900 rounded-lg py-3 pr-10  text-sm outline-none focus:border-green-400 transition"
                value={selectedFilters.status || 'all'}
                onChange={(e) => onFilterChange('status', e.target.value)}
              >
                {filterOptions.status.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className='relative w-full'>
              <select
                className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl py-3 pr-10 w-full  lg:w-[200px] text-sm outline-none focus:border-green-400 transition"
                value={selectedFilters.type || 'all'}
                onChange={(e) => onFilterChange('type', e.target.value)}
              >
                {filterOptions.type.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative w-full">
              <ExportDropdown
                data={filteredDrivers}
                columns={exportColumns}
                fileName="chauffeurs_taka_taka"
                title={t('drivers.export_title') || 'Liste des chauffeurs - Taka Taka'}
                showToast={showToast}
                className="w-full sm:w-auto"
              />
            </div>
            <button
              onClick={onClearFilters}
              className="min-h-11 px-2 -ml-2 text-sm text-red-600 hover:text-red-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('common.reset_filters') || 'Réinitialiser tous les filtres'}
            </button>
          </div>


        </div>
      </CardContent>
    </Card>
  );
};

export default DriversFilterBar;

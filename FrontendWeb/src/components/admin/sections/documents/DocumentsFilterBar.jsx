import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Trash2 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Button from '../../ui/Bttn';
import { documentTypes, statusOptions, completenessOptions } from './documentConstants';

const DocumentsFilterBar = ({
  filteredCount,
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  selectedFilters,
  onFilterChange,
  onClearFilters
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>{t('drivers.search_driver', 'Recherche de chauffeurs')}</CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {filteredCount} {t('drivers.driver_found', 'chauffeur(s) trouvé(s)')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              icon={Filter}
              onClick={onToggleFilters}
            >
              {showFilters ? t('common.hide_filters', 'Masquer filtres') : t('common.filters', 'Filtres')}
            </Button>

            {(searchTerm || Object.values(selectedFilters).some(v => v && v !== 'all')) && (
              <Button
                variant="ghost"
                icon={Trash2}
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700"
              >
                Effacer
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder={t('documents.search_placeholder', 'Rechercher un chauffeur ou un document...')}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Statut des documents
                    </label>
                    <select
                      className="w-full border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 transition"
                      value={selectedFilters.status || 'all'}
                      onChange={(e) => onFilterChange('status', e.target.value)}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Complétude du profil
                    </label>
                    <select
                      className="w-full border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 transition"
                      value={selectedFilters.completeness || 'all'}
                      onChange={(e) => onFilterChange('completeness', e.target.value)}
                    >
                      {completenessOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Type de document
                    </label>
                    <select
                      className="w-full border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 transition"
                      value={selectedFilters.type || 'all'}
                      onChange={(e) => onFilterChange('type', e.target.value)}
                    >
                      <option value="all">Tous les types</option>
                      {documentTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsFilterBar;

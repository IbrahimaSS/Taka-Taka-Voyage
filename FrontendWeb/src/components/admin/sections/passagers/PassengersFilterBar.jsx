import { Search, ChevronDown, CalendarDays } from 'lucide-react';
import Card, { CardContent } from '../../ui/Card';
import ExportDropdown from '../../ui/ExportDropdown';

const PassengersFilterBar = ({
  searchTerm,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  users,
  exportColumns,
  showToast,
  onPrint,
  onShare,
  t
}) => {
  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400  w-5 h-5 " />
              <input
                type="text"
                placeholder={`${t('common.search') || 'Rechercher'}...`}
                className="form-input pl-10 dark:bg-gray-800"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Filtre Statut */}
          <div className="relative">
            <select
              className="form-input appearance-none pr-10 dark:bg-gray-800"
              value={selectedFilters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <option value="all">{t('common.status') || 'Statuts'}</option>
              <option value="ACTIF">{t('common.active') || 'Actif'}</option>
              <option value="INACTIF">{t('common.inactive') || 'Inactif'}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
          </div>

          {/* Filtre Dates */}
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select
              className="form-input appearance-none pl-10 pr-10 dark:bg-gray-800"
              value={selectedFilters.dateRange}
              onChange={(e) => onFilterChange('dateRange', e.target.value)}
            >
              <option value="all">{t('common.dates') || 'Dates'}</option>
              <option value="today">{t('common.today') || "Aujourd'hui"}</option>
              <option value="7days">{t('common.last_7_days') || '7 derniers jours'}</option>
              <option value="30days">{t('common.last_30_days') || '30 derniers jours'}</option>
              <option value="3months">{t('common.last_3_months') || '3 derniers mois'}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
          </div>

          {/* Export */}
          <ExportDropdown
            data={users}
            columns={exportColumns}
            fileName="utilisateurs_taka_taka"
            title={t('passengers.export_title') || 'Liste des utilisateurs - Taka Taka'}
            showToast={showToast}
            onPrint={onPrint}
            onShare={onShare}
            className=''
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PassengersFilterBar;

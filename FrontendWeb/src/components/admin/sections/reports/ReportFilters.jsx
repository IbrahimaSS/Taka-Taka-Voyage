import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import Card from '../../ui/Card';
import ExportDropdown from '../../ui/ExportDropdown';

// Composant pour les filtres
const ReportFilters = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  formatFilter,
  setFormatFilter,
  filteredReports,
  exportColumns,
  showToast,
  setCurrentPage
}) => {
  const { t } = useTranslation();
  return (
    <Card hoverable={false} className="mb-4 md:mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder={t('common.search', 'Rechercher...')}
            className="w-full pl-10 pr-3 py-2 md:pl-12 md:pr-4 md:py-3 border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-3 py-2 md:px-4 md:py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">{t('common.all_status', 'Tous les statuts')}</option>
          <option value="generated">{t('common.generated', 'Généré')}</option>
          <option value="pending">{t('trips.status.pending', 'En attente')}</option>
          <option value="processing">{t('disputes.in_review', 'En cours')}</option>
          <option value="failed">{t('common.failed', 'Échoué')}</option>
        </select>

        <select
          className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-3 py-2 md:px-4 md:py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm"
          value={formatFilter}
          onChange={(e) => {
            setFormatFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">{t('common.all_formats', 'Tous les formats')}</option>
          <option value="pdf">PDF</option>
          <option value="csv">CSV</option>
          <option value="word">Word</option>
        </select>

        <div className="relative flex items-end">
          <ExportDropdown
            data={filteredReports}
            columns={exportColumns}
            fileName="rapports"
            title="Export des rapports"
            orientation="landscape"
            showToast={showToast}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
};

export default ReportFilters;

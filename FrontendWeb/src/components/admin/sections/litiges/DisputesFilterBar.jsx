import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import Card from '../../ui/Card';

const DisputesFilterBar = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange
}) => {
  const { t } = useTranslation();

  return (
    <Card hoverable={false}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder={t('disputes.search_placeholder', 'Rechercher un litige...')}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition text-sm md:text-base"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <select
          className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm md:text-base"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="all">{t('common.status', 'Statuts')}</option>
          <option value="open">{t('disputes.status.open', 'Ouvert')}</option>
          <option value="in_progress">{t('disputes.in_review', 'En cours')}</option>
          <option value="resolved">{t('common.resolved', 'Résolu')}</option>
          <option value="rejected">{t('common.rejected', 'Rejeté')}</option>
          <option value="pending">{t('trips.status.pending', 'En attente')}</option>
        </select>

        <select
          className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm md:text-base"
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
        >
          <option value="all">{t('common.categories', 'Types')}</option>
          <option value="paiement">{t('nav.paiements', 'Paiement')}</option>
          <option value="comportement">{t('disputes.behavior', 'Comportement')}</option>
          <option value="trajet">{t('trips.trajet', 'Trajet')}</option>
          <option value="accident">{t('disputes.accident', 'Accident')}</option>
          <option value="agression">{t('disputes.agression', 'Agression')}</option>
          <option value="urgence_medicale">{t('disputes.medical', 'Urgence Médicale')}</option>
          <option value="danger">{t('disputes.danger', 'Danger')}</option>
          <option value="autre">{t('common.other', 'Autre')}</option>
        </select>

        <select
          className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm md:text-base"
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value)}
        >
          <option value="all">{t('disputes.priorities', 'Priorités')}</option>
          <option value="low">{t('disputes.low', 'Basse')}</option>
          <option value="medium">{t('disputes.medium', 'Moyenne')}</option>
          <option value="high">{t('disputes.high', 'Haute')}</option>
          <option value="critical">{t('disputes.critical', 'Critique')}</option>
        </select>
      </div>
    </Card>
  );
};

export default DisputesFilterBar;

import { useTranslation } from 'react-i18next';
import { Search, BarChart3, CheckCircle, X, Clock } from 'lucide-react';
import Card, { CardContent } from '../../admin/ui/Card';
import FilterChip from './FilterChip';

const statusIcons = { all: BarChart3, completed: CheckCircle, cancelled: X, pending: Clock };

const TripsFilterBar = ({ statusFilters, activeFilter, onFilterChange, searchTerm, onSearchChange }) => {
  const { t } = useTranslation();

  return (
    <Card hoverable className="mb-8">
      <CardContent padding="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder={t('history.search_placeholder')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm transition-all"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">{t('history.status.title')}:</span>
              {statusFilters.map((filter) => (
                <FilterChip
                  key={filter.id}
                  active={activeFilter === filter.id}
                  onClick={() => onFilterChange(filter.id)}
                  icon={statusIcons[filter.id]}
                  label={filter.label}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripsFilterBar;

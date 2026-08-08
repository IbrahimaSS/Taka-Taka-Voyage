import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import Card, { CardContent } from '../../admin/ui/Card';
import FilterChip from './FilterChip';

const TransactionsFilterBar = ({ filters, activeFilter, onFilterChange, searchTerm, onSearchChange }) => {
  const { t } = useTranslation();

  return (
    <Card hoverable className="mb-8">
      <CardContent padding="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder={t('transactions.filters.search_placeholder')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <FilterChip
                key={filter.id}
                active={activeFilter === filter.id}
                onClick={() => onFilterChange(filter.id)}
                icon={filter.icon}
                label={filter.label}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsFilterBar;

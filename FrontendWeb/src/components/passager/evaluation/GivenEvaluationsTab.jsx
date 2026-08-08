import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import Card, { CardContent, CardFooter } from '../../admin/ui/Card';
import Pagination from '../../admin/ui/Pagination';
import EvaluationCard from './EvaluationCard';

const GivenEvaluationsTab = ({
  loading, givenEvaluations, filter, onFilterChange,
  currentPage, onPageChange, pagination,
}) => {
  const { t } = useTranslation();

  const filters = [
    { id: 'all', label: t('evaluations.all') },
    { id: '5', label: t('evaluations.stars', { count: 5 }) },
    { id: '4', label: t('evaluations.stars', { count: 4 }) },
    { id: '3', label: t('evaluations.stars', { count: 3 }) }
  ];

  return (
    <>
      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mt-2 mb-6">
        {filters.map((filterItem) => (
          <button
            key={filterItem.id}
            onClick={() => onFilterChange(filterItem.id)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${filter === filterItem.id ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {filterItem.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">{t('evaluations.loading')}</div>
        ) : givenEvaluations.length > 0 ? (
          givenEvaluations.map((evaluation, index) => (
            <EvaluationCard key={evaluation.id} evaluation={evaluation} index={index} />
          ))
        ) : (
          <Card><CardContent className="text-center py-12"><Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('evaluations.no_evaluations')}</h3></CardContent></Card>
        )}
      </div>

      {!loading && givenEvaluations.length > 0 && pagination.totalPages > 1 && (
        <CardFooter className="px-0 mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            showInfo={true}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            className="w-full"
          />
        </CardFooter>
      )}
    </>
  );
};

export default GivenEvaluationsTab;

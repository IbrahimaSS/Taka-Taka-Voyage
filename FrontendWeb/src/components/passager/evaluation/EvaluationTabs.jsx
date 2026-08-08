import { useTranslation } from 'react-i18next';
import { CardHeader, CardTitle } from '../../admin/ui/Card';

const EvaluationTabs = ({ activeTab, onTabChange, givenCount }) => {
  const { t } = useTranslation();

  return (
    <CardHeader className="px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <CardTitle className="text-gray-900 dark:text-gray-100">{t('evaluations.title')}</CardTitle>
        <div className="flex space-x-2">
          <button
            onClick={() => onTabChange('given')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'given' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
          >
            {t('evaluations.given')} ({givenCount})
          </button>
          <button
            onClick={() => onTabChange('received')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'received' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
          >
            {t('evaluations.received')} (0)
          </button>
        </div>
      </div>
    </CardHeader>
  );
};

export default EvaluationTabs;

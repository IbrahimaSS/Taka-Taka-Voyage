import { useTranslation } from 'react-i18next';
import { Award } from 'lucide-react';
import Card, { CardContent } from '../admin/ui/Card';

import { useEvaluationsData } from './evaluation/useEvaluationsData';
import EvaluationTabs from './evaluation/EvaluationTabs';
import GivenEvaluationsTab from './evaluation/GivenEvaluationsTab';
import GlobalStatsCard from './evaluation/GlobalStatsCard';
import TravelTipsCard from './evaluation/TravelTipsCard';

const Evaluations = () => {
  const { t } = useTranslation();
  const {
    currentPage, setCurrentPage,
    filter, setFilter,
    loading,
    activeTab, setActiveTab,
    givenEvaluations,
    stats,
    pagination,
  } = useEvaluationsData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Colonne gauche - Évaluations */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="dark:bg-gray-900 border-none shadow-none">
          <EvaluationTabs activeTab={activeTab} onTabChange={setActiveTab} givenCount={stats.total} />
          <CardContent className="px-0">

            {activeTab === 'given' && (
              <GivenEvaluationsTab
                loading={loading}
                givenEvaluations={givenEvaluations}
                filter={filter}
                onFilterChange={(id) => { setFilter(id); setCurrentPage(1); }}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                pagination={pagination}
              />
            )}

            {activeTab === 'received' && (
              <Card className="mt-4"><CardContent className="text-center py-12"><Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('evaluations.soon_available')}</h3><p className="text-gray-500">{t('evaluations.soon_available_desc')}</p></CardContent></Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Colonne droite - Statistiques et conseils */}
      <div className="space-y-6">
        <GlobalStatsCard stats={stats} />
        <TravelTipsCard />
      </div>
    </div>
  );
};

export default Evaluations;

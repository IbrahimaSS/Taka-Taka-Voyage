import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Bttn';

const GenerateReportModal = ({ isOpen, onClose, newReport, setNewReport, onGenerate, loading }) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('reports.generate_report', 'Générer un nouveau rapport')}
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('reports.report_type', 'Type de rapport')}
            </label>
            <select
              value={newReport.type}
              onChange={(e) => setNewReport(prev => ({ ...prev, type: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="FINANCIER">{t('reports.financial', 'Financier')}</option>
              <option value="UTILISATEURS">{t('nav.utilisateurs', 'Utilisateurs')}</option>
              <option value="TRAJETS">{t('reports.geographic', 'Trajets / Géographique')}</option>
              <option value="PERFORMANCE">{t('reports.driver_performance', 'Performance')}</option>
              <option value="SECURITE">{t('common.security', 'Sécurité')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('reports.output_format', 'Format de sortie')}
            </label>
            <select
              value={newReport.format}
              onChange={(e) => setNewReport(prev => ({ ...prev, format: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="PDF">PDF</option>
              <option value="CSV">CSV</option>
              <option value="WORD">Word</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('reports.period', 'Période')}
            </label>
            <select
              value={newReport.period}
              onChange={(e) => setNewReport(prev => ({ ...prev, period: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="today">{t('common.today', "Aujourd'hui")}</option>
              <option value="week">{t('common.this_week', 'Cette semaine')}</option>
              <option value="month">{t('common.this_month', 'Ce mois')}</option>
              <option value="quarter">{t('reports.this_quarter', 'Ce trimestre')}</option>
              <option value="year">{t('common.this_year', 'Cette année')}</option>
              <option value="custom">{t('common.custom', 'Personnalisée')}</option>
            </select>
          </div>

          {newReport.period === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('reports.start_date', 'Date de début')}
                </label>
                <input
                  type="date"
                  value={newReport.customStart}
                  onChange={(e) => setNewReport(prev => ({ ...prev, customStart: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('reports.end_date', 'Date de fin')}
                </label>
                <input
                  type="date"
                  value={newReport.customEnd}
                  onChange={(e) => setNewReport(prev => ({ ...prev, customEnd: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('reports.additional_options', 'Options supplémentaires')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newReport.includeCharts}
                  onChange={(e) => setNewReport(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-700 text-green-500 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">{t('reports.include_charts', 'Inclure les graphiques')}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newReport.includeDetails}
                  onChange={(e) => setNewReport(prev => ({ ...prev, includeDetails: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-700 text-green-500 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">{t('reports.include_details', 'Inclure les détails complets')}</span>
              </label>
            </div>

            <div className="space-y-3 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newReport.isScheduled}
                  onChange={(e) => setNewReport(prev => ({ ...prev, isScheduled: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-blue-700 dark:text-blue-400">{t('reports.schedule_this', 'Planifier ce rapport')}</span>
              </label>
              {newReport.isScheduled && (
                <select
                  className="w-full mt-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-lg px-2 py-1.5 text-xs outline-none"
                  onChange={(e) => setNewReport(prev => ({ ...prev, frequency: e.target.value }))}
                >
                  <option value="daily">Toutes les 24h</option>
                  <option value="weekly">Toutes les semaines</option>
                  <option value="monthly">Tous les mois</option>
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t('common.cancel', 'Annuler')}
          </Button>
          <Button
            variant="perso"
            icon={FileText}
            onClick={() => onGenerate()}
            loading={loading}
          >
            {t('reports.generate_report_btn', 'Générer le rapport')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GenerateReportModal;

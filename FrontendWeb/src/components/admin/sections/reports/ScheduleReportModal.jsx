import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Bttn';

const ScheduleReportModal = ({ isOpen, onClose, newSchedule, setNewSchedule, onSave, loading }) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('reports.schedule_report_title', 'Planifier une génération automatique')}
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1 text-gray-800 dark:text-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t('reports.report_type', 'Type de rapport')}</label>
            <select
              value={newSchedule.type}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, type: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-4 py-3 outline-none"
            >
              <option value="FINANCIER">{t('reports.financial', 'Financier')}</option>
              <option value="UTILISATEURS">{t('nav.utilisateurs', 'Utilisateurs')}</option>
              <option value="TRAJETS">{t('reports.geographic', 'Trajets')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('reports.frequency', 'Fréquence')}</label>
            <select
              value={newSchedule.frequency}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, frequency: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-4 py-3 outline-none"
            >
              <option value="daily">{t('reports.daily', 'Quotidien (chaque jour)')}</option>
              <option value="weekly">{t('reports.weekly', 'Hebdomadaire (chaque lundi)')}</option>
              <option value="monthly">{t('reports.monthly', 'Mensuel (chaque 1er du mois)')}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('reports.recipients', 'Destinataires (email)')}</label>
          <input
            type="text"
            placeholder="admin@takataka.com, manager@takataka.com"
            value={newSchedule.recipients}
            onChange={(e) => setNewSchedule(prev => ({ ...prev, recipients: e.target.value }))}
            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-4 py-3 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">Séparez les emails par des virgules</p>
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
            icon={Clock}
            onClick={onSave}
            loading={loading}
          >
            {t('reports.confirm_schedule', 'Confirmer la planification')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleReportModal;

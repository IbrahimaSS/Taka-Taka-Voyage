import { useTranslation } from 'react-i18next';
import { Calendar, CalendarDays, Eye, Download, Share2, RefreshCw } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Bttn';
import { StatusBadge, TypeBadge, FormatBadge } from './reportBadges';

// Modal de détails du rapport
const ReportDetailsModal = ({ report, isOpen, onClose, onDownload, onRegenerate, showToast }) => {
  const { t } = useTranslation();

  if (!report) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('reports.details_title', 'Détails du rapport')}
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{report.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{report.description}</p>
            <div className="flex flex-wrap items-center mt-2 gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">ID: {report.id}</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Format: {report.format}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <StatusBadge status={report.status} />
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Informations générales</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Type:</span>
                  <span className="font-medium"><TypeBadge type={report.type} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Format:</span>
                  <span className="font-medium"><FormatBadge format={report.format} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Statut:</span>
                  <span className="font-medium"><StatusBadge status={report.status} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Auteur:</span>
                  <span className="font-medium">{report.author}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Métriques</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Taille:</span>
                  <span className="font-medium">{report.size} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Téléchargements:</span>
                  <span className="font-medium">{report.downloadCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Date création:</span>
                  <span className="font-medium">{report.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Dernier accès:</span>
                  <span className="font-medium">{report.lastAccessed || 'Jamais'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Création</h4>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
              <span className="font-medium">{report.createdAt}</span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Période</h4>
            <div className="flex items-center">
              <CalendarDays className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
              <span className="font-medium">{report.period}</span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Dernier accès</h4>
            <div className="flex items-center">
              <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
              <span className="font-medium">{report.lastAccessed || 'Jamais'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Fermer
          </Button>
          {report.status === 'generated' ? (
            <>
              <Button
                variant='perso'
                icon={Download}
                onClick={() => {
                  onDownload(report);
                  onClose();
                }}
              >
                {t('reports.download', 'Télécharger')}
              </Button>
              <Button
                variant="outline"
                icon={Share2}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Lien copié', 'Le lien vers le rapport a été copié', 'success');
                }}
              >
                {t('reports.share', 'Partager')}
              </Button>
            </>
          ) : (
            <Button
              variant="warning"
              icon={RefreshCw}
              onClick={() => {
                onRegenerate(report);
                onClose();
              }}
            >
              {t('common.regenerate', 'Regénérer')}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReportDetailsModal;

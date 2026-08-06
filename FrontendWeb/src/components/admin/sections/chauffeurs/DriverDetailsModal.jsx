import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Bttn';
import HistoriqueTrajet from '../../../chauffeur/HistoriqueTrajet';
import { getStatusBadge, getVerificationBadge, getTypeBadge, getDocBadge } from './driverBadges';
import { getInitials, getAvatarUrl, formatDate } from './driverHelpers';

const DriverDetailsModal = ({ isOpen, onClose, driver, onActivateToggle, onSuspend }) => {
  const { t, i18n } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={t('drivers.details_title') || 'Détails du chauffeur'}
    >
      {driver ? (
        <div className="space-y-6 scroll-m-t-2 overflow-auto h-[70vh] pr-2">
          {/* En-tête du chauffeur */}
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-blue-700 flex items-center justify-center`}>
              {driver.photoUrl ? (
                <img src={getAvatarUrl(driver.photoUrl)} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xl font-bold">
                  {getInitials(driver.name || `${driver.prenom} ${driver.nom}`)}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {driver.name || `${driver.prenom} ${driver.nom}`}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{driver.email}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {getStatusBadge(driver.statut, t)}
                {getVerificationBadge(driver.verifie || driver.statut === 'ACTIF', t)}
                {getTypeBadge(driver.type || driver.typeChauffeur, t)}
              </div>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-900 ms-8">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.phone') || 'Téléphone'}</p>
              <p className="font-medium">{driver.phone || driver.telephone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.registration') || 'Inscription'}</p>
              <p className="font-medium">{formatDate(driver.joinDate || driver.inscritLe, i18n.language, t)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.last_activity') || 'Dernière activité'}</p>
              <p className="font-medium">{driver.derniereActivite ? formatDate(driver.derniereActivite, i18n.language, t) : (t('common.not_available') || 'Indisponible')}</p>
            </div>
          </div>

          {/* Véhicule et note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('drivers.vehicle') || 'Véhicule'}</p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                {driver.vehicle || driver.vehicule?.marque}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {driver.plate || driver.vehicule?.plaque}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('passengers.average_rating') || 'Note moyenne'}</p>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="ml-2 text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {driver.rating || driver.stats?.noteMoyenne || '0'}
                </span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">/5</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {driver.trips || driver.stats?.nombreTrajets || '0'} {t('drivers.trips_completed_text') || 'trajets effectués'}
              </p>
            </div>
          </div>

          {/* Documents */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-900">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">{t('drivers.documents_title') || 'Documents du chauffeur'}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <div className="text-center">
                {getDocBadge(driver.documents?.permis, t)}
                <p className="text-[10px] mt-1.5 font-medium text-gray-500 uppercase tracking-wider">{t('drivers.license') || 'Permis'}</p>
              </div>
              <div className="text-center">
                {getDocBadge(driver.documents?.assurance, t)}
                <p className="text-[10px] mt-1.5 font-medium text-gray-500 uppercase tracking-wider">{t('drivers.insurance') || 'Assurance'}</p>
              </div>
              <div className="text-center">
                {getDocBadge(driver.documents?.carteGrise, t)}
                <p className="text-[10px] mt-1.5 font-medium text-gray-500 uppercase tracking-wider">{t('drivers.reg_card') || 'Carte grise'}</p>
              </div>
              <div className="text-center">
                {getDocBadge(driver.documents?.identite, t)}
                <p className="text-[10px] mt-1.5 font-medium text-gray-500 uppercase tracking-wider">{t('common.identity') || 'Identité'}</p>
              </div>
              <div className="text-center">
                {getDocBadge(driver.documents?.photoVehicule, t)}
                <p className="text-[10px] mt-1.5 font-medium text-gray-500 uppercase tracking-wider">{t('drivers.vehicle_photo') || 'Photo Véhicule'}</p>
              </div>
            </div>
          </div>

          {/* Revenus */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-900">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">{t('drivers.total_earnings') || 'Revenus totaux'}</p>
            <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 text-center border border-green-100 dark:border-green-900/50">
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                {t('common.currency_symbol') || 'GNF'} {(driver.earnings || driver.revenus?.totalGagne || 0).toLocaleString()}
              </p>
              <p className="text-green-600 dark:text-green-500/80 mt-1">{t('drivers.total_platform_earnings') || 'Total gagné sur la plateforme'}</p>
            </div>
          </div>

          {/* Historique des trajets */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-900 overflow-hidden">
            <p className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-widest mb-4">{t('nav.history') || 'Historique des trajets'}</p>
            <div className="max-h-[500px] overflow-y-auto px-1 -mx-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
              <HistoriqueTrajet chauffeurId={driver.userId || driver.id} />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-900 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              {t('common.close') || 'Quitter'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => onActivateToggle(driver)}
            >
              {driver.statut === 'ACTIF' ? (t('common.deactivate') || 'Désactiver') : (t('common.activate') || 'Activer')}
            </Button>
            <Button
              variant="danger"
              onClick={() => onSuspend(driver)}
            >
              {t('common.suspend', 'Suspendre')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">{t('drivers.no_driver_selected') || 'Aucun chauffeur sélectionné'}</p>
        </div>
      )}
    </Modal>
  );
};

export default DriverDetailsModal;

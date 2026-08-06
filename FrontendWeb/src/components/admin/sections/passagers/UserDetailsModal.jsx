import { useTranslation } from 'react-i18next';
import { Star, Mail, Ban, UserCheck } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Bttn';
import { getStatusBadge } from './passengerBadges';
import { getAvatarUrl, getTimeAgo } from './passengerHelpers';

const UserDetailsModal = ({ isOpen, onClose, user, onToggleStatus, onSendEmail }) => {
  const { t, i18n } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? (t('passengers.details_title', { name: `${user.prenom} ${user.nom}` }) || `Détails de ${user.prenom} ${user.nom}`) : ''}
      size="lg"
    >
      {user && (
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center overflow-hidden`}>
              {user.photoUrl ? (
                <img src={getAvatarUrl(user.photoUrl)} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-bold">{user.prenom?.[0]}{user.nom?.[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user.prenom} {user.nom}</h3>
                {getStatusBadge(user.statut, t)}
              </div>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              <p className="text-gray-600 dark:text-gray-300">{user.telephone}</p>
            </div>
            <Button
              variant="ghost"
              icon={Mail}
              onClick={() => onSendEmail(user)}
            >
              {t('common.contact') || 'Contacter'}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 dark:bg-gray-900 rounded-xl p-4 text-center border border-emerald-100 dark:border-emerald-900/50">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{user.nombreTrajets || 0}</div>
              <div className="text-sm text-emerald-700/70 dark:text-emerald-500/80">{t('nav.trajets') || 'Trajets effectués'}</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 dark:bg-gray-900 rounded-xl p-4 text-center border border-amber-100 dark:border-amber-900/50">
              <div className="flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400 fill-current mr-1" />
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{user.noteMoyenne || '-'}</span>
              </div>
              <div className="text-sm text-amber-700/70 dark:text-amber-500/80">{t('passengers.average_rating') || 'Note moyenne'}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 dark:bg-gray-900 rounded-xl p-4 text-center border border-purple-100 dark:border-purple-900/50">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {user.totalDepense ? `${user.totalDepense.toLocaleString()} ${t('common.currency_symbol') || 'GNF'}` : '-'}
              </div>
              <div className="text-sm text-purple-700/70 dark:text-purple-500/80">{t('passengers.total_spent') || 'Total dépensé'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3">{t('common.personal_info') || 'Informations personnelles'}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t('common.registration_date') || "Date d'inscription"}:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">{new Date(user.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t('common.last_activity') || 'Dernière activité'}:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">{getTimeAgo(user.updatedAt, t)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-900">
            <Button
              variant={user.statut === 'ACTIF' ? 'warning' : 'success'}
              icon={user.statut === 'ACTIF' ? Ban : UserCheck}
              onClick={() => onToggleStatus(user)}
            >
              {user.statut === 'ACTIF' ? (t('common.deactivate') || 'Désactiver') : (t('common.activate') || 'Activer')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default UserDetailsModal;

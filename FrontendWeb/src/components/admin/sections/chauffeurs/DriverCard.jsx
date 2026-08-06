import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star, Phone, Mail, Eye, CheckCircle, XCircle, Ban } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Bttn';
import { getStatusBadge, getVerificationBadge, getTypeBadge } from './driverBadges';
import { getInitials, getAvatarUrl, formatDate } from './driverHelpers';

const DriverCard = ({ driver, onView, onActivate, onDeactivate, onSuspend }) => {
  const { t, i18n } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card hoverable className="p-6">
        <div className="flex items-center justify-between  mb-4">
          <div className="flex items-center">
            <div className={`w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mr-4`}>
              {driver.photoUrl ? (
                <img src={getAvatarUrl(driver.photoUrl)} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xl font-bold">
                  {getInitials(driver.name)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate">{driver.name}</h4>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {getStatusBadge(driver.statut, t)}
                {getVerificationBadge(driver.statut === 'ACTIF', t)}
                {getTypeBadge(driver.type, t)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 font-bold text-gray-800 dark:text-gray-100 text-lg">{driver.rating}</span>
            </div>
          </div>

        </div>

        <div className="mb-4 flex items-center gap-10">
          <div className="">
            {getTypeBadge(driver.type, t)}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{driver.trips} {t('nav.trajets') || 'trajets'}</p>

        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('drivers.vehicle') || 'Véhicule'}</p>
            <p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">{driver.vehicle}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('drivers.plate') || 'Plaque'}</p>
            <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{driver.plate}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
          <div className="flex items-center truncate">
            <Phone className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{driver.phone}</span>
          </div>
          <div className="flex items-center flex-shrink-0 ml-2">
            <Mail className="w-4 h-4 mr-1.5" />
            <span className="truncate text-xs">{driver.email?.split('@')[0]}...</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('drivers.total_earnings') || 'Gains totaux'}</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            <span className='text-gray-800 dark:text-gray-100'>{t('common.currency_symbol') || 'GNF'}</span> {driver.earnings.toLocaleString()}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('common.registered_on') || 'Inscrit le'} {formatDate(driver.joinDate, i18n.language, t)}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="small"
              icon={Eye}
              onClick={() => onView(driver)}
              title={t('common.view_details') || 'Voir les détails'}
              className="p-2"
            />

            {driver.statut !== 'ACTIF' && (
              <Button
                variant="secondary"
                size="small"
                icon={CheckCircle}
                onClick={() => onActivate(driver)}
                title={t('common.activate') || 'Activer'}
                className="p-2 text-green-600 hover:text-green-700"
              />
            )}

            {driver.statut !== 'INACTIF' && (
              <Button
                variant="secondary"
                size="small"
                icon={XCircle}
                onClick={() => onDeactivate(driver)}
                title={t('common.deactivate') || 'Désactiver'}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:text-gray-200"
              />
            )}

            {driver.statut !== 'SUSPENDU' && (
              <Button
                variant="secondary"
                size="small"
                icon={Ban}
                onClick={() => onSuspend(driver)}
                title={t('common.suspend', 'Suspendre')}
                className="p-2 text-red-600 hover:text-red-700"
              />
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default DriverCard;

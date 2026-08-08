import { useTranslation } from 'react-i18next';
import {
  MapPin, Users, Navigation, Info, Share2, Download, Phone, Trash2,
  Car as CarIcon, Motorbike,
} from 'lucide-react';
import Button from '../../admin/ui/Bttn';
import Card, { CardContent } from '../../admin/ui/Card';
import Modal from '../../admin/ui/Modal';
import TripStatusBadge from './TripStatusBadge';

const TripDetailsModal = ({ trip, isOpen, onClose, onDelete, onDownload }) => {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('planning.details_title')}
      size="lg"
    >
      {trip && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center">
                {trip.vehicle === 'Moto-taxi' ? (
                  <Motorbike className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                ) : (
                  <CarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{trip.vehicle}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('planning.auto_assigned')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('planning.estimated_price')}</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{trip.price}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">{t('planning.pickup')}</p>
                  <p className="text-base font-bold text-gray-900 dark:text-gray-100">{trip.pickup}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">{t('planning.destination')}</p>
                  <p className="text-base font-bold text-gray-900 dark:text-gray-100">{trip.destination}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">{t('planning.date')}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{trip.date}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">{t('planning.time')}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{trip.time}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <Users className="w-5 h-5 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{trip.passengers || 1} {t('planning.passengers')}</p>
            </div>
            <div className="text-center">
              <Navigation className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{trip.distanceKm || 'N/A'} {t('planning.km')}</p>
            </div>
            <div className="text-center">
              <Info className="w-5 h-5 text-amber-500 dark:text-amber-400 mx-auto mb-2" />
              <TripStatusBadge status={trip.status} />
            </div>
          </div>

          {trip.driver && (
            <Card className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
              <CardContent padding="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden border border-white/30 shadow-inner">
                      {trip.driver.photo ? (
                        <img src={trip.driver.photo} alt={trip.driver.prenom} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-white">
                          {trip.driver.prenom?.charAt(0)}{trip.driver.nom?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">{t('planning.driver_assigned')}</p>
                      <p className="text-base font-bold">{trip.driver.prenom} {trip.driver.nom}</p>
                      <p className="text-xs opacity-70 mt-0.5">{trip.driver.telephone}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="small" icon={Share2} className="bg-white/20 hover:bg-white/30 text-white" />
                    <Button variant="ghost" size="small" icon={Download} className="bg-white/20 hover:bg-white/30 text-white" onClick={onDownload} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-3 pt-4">
            <Button variant="secondary" onClick={onClose} className="flex-1 min-w-[120px]">{t('planning.close')}</Button>
            <Button variant="primary" onClick={onDownload} icon={Download} className="flex-1 min-w-[120px]">{t('planning.receipt')}</Button>

            {trip.driver?.telephone && (
              <Button
                variant="primary"
                onClick={() => window.open(`tel:${trip.driver.telephone}`)}
                icon={Phone}
                className="flex-1 min-w-[120px]"
              >
                {t('planning.call')}
              </Button>
            )}

            {(trip.status === 'EN_ATTENTE' || trip.status === 'ACCEPTEE') && (
              <Button variant="danger" onClick={() => onDelete(trip.id)} icon={Trash2} size="large" className="w-12 h-12 flex-shrink-0" />
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TripDetailsModal;

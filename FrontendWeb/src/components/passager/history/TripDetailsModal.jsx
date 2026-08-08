import { useTranslation } from 'react-i18next';
import { MapPin, Star, Share2, Phone, Receipt } from 'lucide-react';
import Button from '../../admin/ui/Bttn';
import Modal from '../../admin/ui/Modal';
import { getFullAssetURL } from '../../../utils/urlHelper';
import TripStatusBadge from './TripStatusBadge';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  const first = parts[0]?.charAt(0) || '';
  const last = parts[1]?.charAt(0) || '';
  return (first + last).toUpperCase() || '?';
};

const TripDetailsModal = ({ trip, isOpen, onClose, onShare, onContact, onShowInvoice }) => {
  const { t } = useTranslation();
  const getAvatarUrl = (path) => getFullAssetURL(path);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('history.details.title')}
      size="lg"
    >
      {trip && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-700 dark:to-gray-700/50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('history.details.date_time')}</p>
              <p className="font-semibold text-gray-900 dark:text-white">{trip.date}</p>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-emerald-900/10 p-4 rounded-xl font-poppins">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('history.details.status')}</p>
              <TripStatusBadge status={trip.status} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('history.details.pickup')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{trip.departure}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-rose-600 dark:text-rose-400 mr-3 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('history.details.destination')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{trip.destination}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('history.details.driver')}</p>
              <div className="flex items-center mt-2 group">
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-emerald-200 to-blue-200 dark:from-emerald-900/30 dark:to-blue-900/30 flex items-center justify-center mr-3 ring-2 ring-emerald-500/20 overflow-hidden">
                  <span className="z-0 font-bold text-xs">{getInitials(trip.driver?.name)}</span>
                  {trip.driver?.photo && (
                    <img
                      src={getAvatarUrl(trip.driver.photo)}
                      alt={trip.driver.name}
                      className="absolute inset-0 w-full h-full object-cover z-10"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{trip.driver?.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">{trip.driver?.vehicle}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl flex flex-col justify-center shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('history.details.price_paid')}</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{trip.price}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl shadow-sm border border-amber-100/50 dark:border-amber-800/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('history.details.rating_given')}</p>
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(trip.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-lg font-bold text-amber-600 dark:text-amber-500">
                  {trip.rating?.toFixed(1)}/5
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl shadow-sm border border-purple-100/50 dark:border-purple-800/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('history.details.distance')}</p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-1">{trip.distance}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="primary"
              onClick={onClose}
              className="flex-1"
            >
              {t('history.details.close')}
            </Button>
            <Button
              variant="warning"
              onClick={() => onShowInvoice(trip)}
              icon={Receipt}
              className="flex-1"
            >
              {t('history.details.invoice')}
            </Button>
            <Button
              variant="primary"
              onClick={onShare}
              icon={Share2}
              className="flex-1"
            >
              {t('history.details.share')}
            </Button>
            <Button
              variant="primary"
              onClick={onContact}
              icon={Phone}
              className="flex-1"
            >
              {t('history.details.contact')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TripDetailsModal;

import { useTranslation } from 'react-i18next';
import { Calendar, Clock, ChevronRight, Car as CarIcon, Motorbike } from 'lucide-react';
import Card from '../../admin/ui/Card';
import TripStatusBadge from './TripStatusBadge';

const TripListItem = ({ trip, onClick }) => {
  const { t } = useTranslation();
  return (
    <Card hoverable padding="p-6" onClick={() => onClick(trip)} className="cursor-pointer dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <TripStatusBadge status={trip.status} />
        <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-500">
          <span className="text-xl">
            {trip.vehicle === 'Moto-taxi' ? <Motorbike className="w-5 h-5" /> : <CarIcon className="w-5 h-5" />}
          </span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100 dark:before:bg-blue-900/30">
          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider mb-1">{t('planning.pickup')}</p>
            <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">{trip.pickup}</h4>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider mb-1">{t('planning.destination')}</p>
            <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">{trip.destination}</h4>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            {trip.date}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2 text-emerald-500" />
            {trip.time}
          </div>
        </div>
        <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{trip.price}</span>
      </div>
    </Card>
  );
};

export default TripListItem;

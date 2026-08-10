import { useTranslation } from 'react-i18next';
import { Calendar, Car as CarIcon, Clock, MapPin, Eye, MoreVertical } from 'lucide-react';
import ReservationActionMenu from './ReservationActionMenu';

const StatusBadge = ({ status, getStatusColor }) => (
  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(status)}`}>
    {status}
  </span>
);

// Carte mobile/tablette (< lg) : une reservation = une carte empilee
const ReservationCard = ({ reservation, getStatusColor, onViewDetails, onOpenMenu }) => (
  <div className="px-4 py-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
          <span className="text-blue-500 text-sm font-bold">
            {reservation.client?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">{reservation.client}</p>
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mt-0.5">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-medium">{reservation.time}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onViewDetails(reservation.raw)}
          className="w-11 h-11 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-500 transition-colors"
          title="Détails"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => onOpenMenu(e, reservation.id)}
          className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>

    <div className="mt-3 flex flex-col gap-1 pl-[52px]">
      <div className="flex items-center gap-1.5 min-w-0">
        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
        <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{reservation.from}</span>
      </div>
      <div className="flex items-center gap-1.5 min-w-0">
        <MapPin className="w-3 h-3 text-green-500 shrink-0" />
        <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{reservation.to}</span>
      </div>
    </div>

    <div className="mt-3">
      <StatusBadge status={reservation.status} getStatusColor={getStatusColor} />
    </div>
  </div>
);

const ReservationsPanel = ({
  selectedDate,
  selectedReservations,
  formatDisplayDate,
  getStatusColor,
  editingReservation,
  actionPosition,
  actionMenuRef,
  onActionClick,
  onViewDetails,
  onCall,
  onStartTrip,
  onUpdateStatus,
}) => {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400 shrink-0" />
              <span className="truncate">{formatDisplayDate(selectedDate)}</span>
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 shrink-0"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedReservations.filter(r => r.status === 'confirmée').length} {t('planning.confirmed')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedReservations.length} {t('planning.trips_found')}
            </span>
            <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
              <CarIcon className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="hidden lg:block border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-3">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 font-medium text-gray-700 dark:text-gray-300">{t('planning.passenger')}</div>
            <div className="col-span-2 font-medium text-gray-700 dark:text-gray-300">{t('planning.time')}</div>
            <div className="col-span-4 font-medium text-gray-700 dark:text-gray-300">{t('planning.trip')}</div>
            <div className="col-span-2 font-medium text-gray-700 dark:text-gray-300">{t('planning.status')}</div>
            <div className="col-span-1 font-medium text-gray-700 dark:text-gray-300"></div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
          {selectedReservations.length > 0 ? (
            selectedReservations.map((reservation) => (
              <div key={reservation.id} className="relative hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {/* Vue carte mobile/tablette */}
                <div className="lg:hidden">
                  <ReservationCard
                    reservation={reservation}
                    getStatusColor={getStatusColor}
                    onViewDetails={onViewDetails}
                    onOpenMenu={onActionClick}
                  />
                </div>

                {/* Vue tableau desktop */}
                <div className="hidden lg:grid grid-cols-12 gap-4 items-center px-6 py-4">
                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-blue-500 text-sm font-bold">
                        {reservation.client?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{reservation.client}</p>
                      <p className="text-[10px] text-gray-500 truncate">{reservation.id}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-sm font-medium">{reservation.time}</span>
                    </div>
                  </div>
                  <div className="col-span-4 min-w-0">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{reservation.from}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3 h-3 text-green-500 shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{reservation.to}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={reservation.status} getStatusColor={getStatusColor} />
                  </div>
                  <div className="col-span-1 relative text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewDetails(reservation.raw)}
                      className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded text-blue-500 transition-colors"
                      title={t('common.details')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => onActionClick(e, reservation.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-400">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {editingReservation === reservation.id && (
                  <ReservationActionMenu
                    reservation={reservation}
                    actionPosition={actionPosition}
                    actionMenuRef={actionMenuRef}
                    onViewDetails={() => onViewDetails(reservation.raw)}
                    onCall={() => onCall(reservation.phone)}
                    onStartTrip={() => onStartTrip(reservation.id)}
                    onUpdateStatus={(status) => onUpdateStatus(reservation.id, status)}
                  />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">{t('planning.no_trips_found_title')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationsPanel;

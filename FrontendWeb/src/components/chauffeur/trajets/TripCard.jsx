import { useTranslation } from 'react-i18next';
import { Car, User, MapPin, Navigation, Clock, Calendar } from 'lucide-react';
import Card from '../../admin/ui/Card';
import { STATUS_CONFIG } from './TripStatusFilters';

const TripCard = ({ trip, onAccept, onRefuse, onContinue }) => {
    const { t, i18n } = useTranslation();
    const config = STATUS_CONFIG[trip.status] || { color: 'bg-gray-100', icon: <Car className="w-4 h-4" /> };

    return (
        <Card
            padding="p-0"
            animate={false}
            className="!rounded-3xl !border-gray-100 dark:!border-gray-700 overflow-hidden hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
        >
            {/* Top: Status & Fare */}
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2 bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${config.color}`}>
                        {config.icon}
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
                        {trip.status === 'pending' ? t('trips.requests') : t('trips.active_trip_label')}
                    </span>
                </div>
                <div className="text-lg font-black text-blue-600 shrink-0">
                    {trip.estimatedFare.toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR')} {t('common.currency_symbol_short')}
                </div>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
                {/* Passenger & Routing Info */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-700 shrink-0">
                            {trip.passengerPhoto ? (
                                <img
                                    src={trip.passengerPhoto}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://ui-avatars.com/api/?name=" + trip.passengerName;
                                    }}
                                />
                            ) : (
                                <User className="w-6 h-6 text-blue-500" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white leading-tight truncate">{trip.passengerName}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-amber-500 text-xs">★</span>
                                <span className="text-xs font-bold text-gray-500">{trip.passengerRating}/5</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t('trips.request_time')}</p>
                        <p className="text-sm font-black text-gray-700 dark:text-gray-300">
                            {trip.requestedTime.toLocaleTimeString(i18n.language === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                {/* Path */}
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 flex flex-col items-center gap-1 shrink-0">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full ring-4 ring-green-500/20" />
                            <div className="w-0.5 h-10 border-l-2 border-dashed border-gray-300 dark:border-gray-600" />
                            <MapPin className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-5">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('trips.pickup')}</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{trip.pickupAddress}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('trips.destination')}</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{trip.destinationAddress}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl flex items-center gap-3 min-w-0">
                        <Navigation className="w-4 h-4 text-purple-500 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold text-gray-400 uppercase">{t('trips.distance')}</p>
                            <p className="text-xs font-black text-gray-900 dark:text-white truncate">{trip.distance}</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl flex items-center gap-3 min-w-0">
                        <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold text-gray-400 uppercase">{t('trips.duration')}</p>
                            <p className="text-xs font-black text-gray-900 dark:text-white truncate">{trip.estimatedTime}</p>
                        </div>
                    </div>
                </div>

                {/* Bottom: Actions */}
                <div className="flex gap-3 pt-2">
                    {trip.status === 'pending' ? (
                        <>
                            <button
                                onClick={() => onAccept(trip.id)}
                                className="flex-1 min-h-[44px] py-3.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/30 hover:opacity-90 transition-all active:scale-95"
                            >
                                {t('trips.accept_trip')}
                            </button>
                            <button
                                onClick={() => onRefuse(trip.id)}
                                className="px-6 min-h-[44px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
                            >
                                {t('common.reject')}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => onContinue(trip)}
                            className="flex-1 min-h-[44px] py-3.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-black text-sm shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-3"
                        >
                            {trip.typeCourse === 'PLANIFIEE' && trip.status === 'accepted' ? (
                                <>
                                    <Calendar className="w-5 h-5" />
                                    {t('nav.planning').toUpperCase()}
                                </>
                            ) : (
                                <>
                                    <Navigation className="w-5 h-5" />
                                    {t('trips.continue_trip')}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default TripCard;

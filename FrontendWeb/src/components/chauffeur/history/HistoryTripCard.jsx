import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Calendar, Star } from 'lucide-react';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

const HistoryTripCard = ({ trip, index, t, i18n, formatDateTime }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: (index % 10) * 0.05 }}
    className="group relative bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 overflow-hidden"
  >
    {/* Status Overlay background subtle gradient */}
    <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 -mr-10 -mt-10 pointer-events-none ${trip.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
      }`} />

    {/* HEADER */}
    <div className="flex items-start justify-between mb-5 gap-3">
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2">
          {trip.status === 'completed' ? (
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
          ) : (
            <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-lg shrink-0">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
          )}
          <span className={`text-xs font-black uppercase tracking-wider ${trip.status === 'completed'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-500 dark:text-red-400'
            }`}>
            {trip.status === 'completed' ? t('history.success') : t('history.cancelled_label')}
          </span>
        </div>
        <div className="flex items-center text-[11px] font-bold text-gray-400 dark:text-gray-500 ml-0.5">
          <Calendar className="w-3 h-3 mr-1.5 shrink-0" />
          {formatDateTime(trip.requestedTime)}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-sm font-medium text-gray-400 mb-1">{t('history.total_fare')}</div>
        <div className="text-xl font-black text-gray-800 dark:text-white flex items-center justify-end gap-1">
          {trip.estimatedFare?.toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR')}
          <span className="text-[10px] text-emerald-600 ml-0.5">{t('common.currency_symbol_short')}</span>
        </div>
      </div>
    </div>

    {/* PASSAGER INFO CARD - GLASSMORPHISM STYLE */}
    <div className="bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl p-4 mb-5 border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors group-hover:bg-gray-50 dark:group-hover:bg-gray-900/60">
      <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white dark:border-gray-700 shrink-0">
        {trip.passengerPhoto ? (
          <img
            src={trip.passengerPhoto}
            alt={trip.passengerName}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span className="text-lg font-black tracking-tighter">
            {getInitials(trip.passengerName)}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-gray-800 dark:text-white leading-tight truncate min-w-0">
            {trip.passengerName}
          </p>
          <div className="flex items-center bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg border border-amber-100 dark:border-amber-800/30 shrink-0">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
            <span className="text-xs font-black text-amber-700 dark:text-amber-400">
              {trip.passengerRating || '5.0'}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{t('history.validated_passenger')}</p>
      </div>
    </div>

    {/* ITINÉRAIRE DÉTAILLÉ */}
    <div className="relative space-y-4 mb-6 pl-2">
      {/* Vertical line connector */}
      <div className="absolute left-[13px] top-[14px] bottom-[14px] w-0.5 border-l-2 border-dashed border-gray-200 dark:border-gray-700" />

      <div className="flex items-start gap-4">
        <div className="relative z-10 w-3 h-3 rounded-full bg-emerald-500 mt-1 ring-4 ring-emerald-500/20 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-0.5">{t('history.depart')}</p>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 line-clamp-1 leading-relaxed">
            {trip.pickupAddress}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="relative z-10 w-3 h-3 rounded-full bg-blue-500 mt-1 ring-4 ring-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.5)] shrink-0" />
        <div className="flex-1 min-w-0 text-right md:text-left">
          <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-0.5">{t('history.arrival')}</p>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 line-clamp-1 leading-relaxed">
            {trip.destinationAddress}
          </p>
        </div>
      </div>
    </div>

    {/* METRICS - ULTRA-LIGHT MINIMALIST STYLE */}
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <div className="bg-blue-50/20 dark:bg-blue-900/10 rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center border border-blue-100/30 dark:border-blue-800/20 transition-all duration-300 group-hover:bg-blue-50/40">
        <span className="text-[9px] font-black text-blue-500/80 dark:text-blue-400/80 uppercase tracking-tighter mb-0.5">{t('history.distance_label')}</span>
        <span className="text-sm font-black text-blue-900/90 dark:text-blue-100">{trip.distance}</span>
      </div>
      <div className="bg-indigo-50/20 dark:bg-indigo-900/10 rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center border border-indigo-100/30 dark:border-indigo-800/20 transition-all duration-300 group-hover:bg-indigo-50/40">
        <span className="text-[9px] font-black text-indigo-500/80 dark:text-indigo-400/80 uppercase tracking-tighter mb-0.5">{t('history.duration_label')}</span>
        <span className="text-sm font-black text-indigo-900/90 dark:text-indigo-100">{trip.estimatedTime}</span>
      </div>
      <div className="bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center border border-emerald-100/40 dark:border-emerald-800/20 transition-all duration-300 group-hover:bg-emerald-50/50">
        <span className="text-[9px] font-black text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-tighter mb-0.5">{t('history.net_gain')}</span>
        <span className="text-sm font-black text-emerald-900/90 dark:text-emerald-50">{(trip.estimatedFare * 0.8)?.toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR')}</span>
      </div>
    </div>
  </motion.div>
);

export default HistoryTripCard;

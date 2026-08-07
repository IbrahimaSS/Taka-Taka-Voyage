import { motion } from 'framer-motion';
import { MapPin, Check, Loader, Phone, Navigation, Search } from 'lucide-react';
import Button from '../../admin/ui/Bttn';

const BookingForm = ({
  t, formData, onAddressInput, selectionMode, onSetSelectionMode, suggestions,
  onSelectSuggestion, isLoading, shouldShowDriver, priceData, shouldShowTripControls,
  tripStatus, currentDriver, onShowTracking, onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Départ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-3">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            {t('booking.pickup_label')}
          </label>
          <Button
            variant="secondary"
            size="small"
            onClick={() => onSetSelectionMode(selectionMode === 'pickup' ? null : 'pickup')}
            className={selectionMode === 'pickup' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : ''}
          >
            {selectionMode === 'pickup' ? (
              <span className="flex items-center">
                <Check className="w-3 h-3 mr-1" /> {t('booking.selection_mode')}
              </span>
            ) : t('booking.select_on_map')}
          </Button>
        </div>
        <div className="relative">
          <input
            type="text"
            value={formData.pickup}
            onChange={(e) => onAddressInput('pickup', e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none focus:shadow-lg"
            placeholder={t('booking.pickup_placeholder')}
            disabled={shouldShowDriver}
          />
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          {isLoading.pickup && (
            <Loader className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
          )}
          {/* Suggestions */}
          {suggestions.pickup.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto custom-scrollbar-v5">
              {suggestions.pickup.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelectSuggestion('pickup', suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{suggestion.display_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Destination */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mr-3">
              <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            {t('booking.destination_label')}
          </label>
          <Button
            variant="secondary"
            size="small"
            onClick={() => onSetSelectionMode(selectionMode === 'destination' ? null : 'destination')}
            className={selectionMode === 'destination' ? 'bg-rose-500 text-white hover:bg-rose-600' : ''}
          >
            {selectionMode === 'destination' ? (
              <span className="flex items-center"><Check className="w-3 h-3 mr-1" /> {t('booking.selection_mode')}</span>
            ) : t('booking.select_on_map')}
          </Button>
        </div>
        <div className="relative">
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => onAddressInput('destination', e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none focus:shadow-lg"
            placeholder={t('booking.destination_placeholder')}
            disabled={shouldShowDriver}
          />
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-600 dark:text-rose-400" />
          {isLoading.destination && (
            <Loader className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
          )}
          {suggestions.destination.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto custom-scrollbar-v5">
              {suggestions.destination.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelectSuggestion('destination', suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{suggestion.display_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Estimation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800/30"
      >
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('booking.estimation_title')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {priceData?.price || '—'} GNF
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('booking.estimated_price')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {priceData?.distance || '—'} km
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('booking.distance')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {priceData?.duration || '—'} min
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('booking.duration')}</div>
          </div>
        </div>
      </motion.div>

      {/* Bouton de confirmation ou contrôles de trajet */}
      {shouldShowTripControls ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800/30"
        >
          {tripStatus === 'driver_found' ? (
            <button
              onClick={() => window.open(`tel:${currentDriver?.phone}`)}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center transition-all shadow-lg shadow-emerald-500/30"
            >
              <Phone className="w-5 h-5 mr-2" />
              {t('booking.call_driver')}
            </button>
          ) : (
            <Button
              variant="primary"
              onClick={onShowTracking}
              className="w-full py-4"
              icon={Navigation}
            >
              {t('booking.follow_live')}
            </Button>
          )}
        </motion.div>
      ) : (
        <Button
          type="submit"
          variant="primary"
          disabled={!formData.pickup || !formData.destination || isLoading.submit}
          className="w-full py-4"
          icon={Search}
          fullWidth
        >
          {isLoading.submit ? (
            <span className="flex items-center justify-center">
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              {t('common.loading')}
            </span>
          ) : (
            t('booking.confirm_btn')
          )}
        </Button>
      )}
    </form>
  );
};

export default BookingForm;

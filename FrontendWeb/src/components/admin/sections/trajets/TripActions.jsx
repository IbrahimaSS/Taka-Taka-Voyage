import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MoreVertical, Eye, PlayCircle, Phone, Copy } from 'lucide-react';
import Button from '../../ui/Bttn';

const TripActions = ({ trip, onViewDetails, onFollow, showToast }) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="small"
        icon={MoreVertical}
        onClick={() => setShowActions(!showActions)}
        className="hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 "
      />

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-900 z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                onClick={() => {
                  onViewDetails(trip);
                  setShowActions(false);
                }}
              >
                <Eye className="w-4 h-4 mr-3 text-blue-500" />
                {t('trips.view_details')}
              </button>

              {trip.status === 'in-progress' && (
                <button
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                  onClick={() => {
                    onFollow(trip);
                    setShowActions(false);
                  }}
                >
                  <PlayCircle className="w-4 h-4 mr-3 text-green-500" />
                  {t('trips.follow_live')}
                </button>
              )}

              <button
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                onClick={() => {
                  showToast({
                    type: 'info',
                    title: t('booking.call_driver'),
                    message: `Appel vers ${trip.driver.phone}...`
                  });
                  setShowActions(false);
                }}
              >
                <Phone className="w-4 h-4 mr-3 text-emerald-500" />
                {t('trips.call_driver')}
              </button>

              <div className="border-t border-gray-100 dark:border-gray-900/40 my-1"></div>

              <button
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(trip.id);
                  showToast({
                    type: 'success',
                    title: t('common.saved'),
                    message: t('trips.copy_id')
                  });
                  setShowActions(false);
                }}
              >
                <Copy className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                {t('trips.copy_id')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripActions;

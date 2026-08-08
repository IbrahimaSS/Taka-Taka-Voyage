import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import RealTimeTracking from '../../components/suivisTrajet/TrajetEnTempReel';
import TrajetComplete from '../../components/suivisTrajet/TrajetComplete';
import TrajetNote from '../../components/suivisTrajet/TrajetNote';

const FullScreenTripOverlay = ({
  isOnTrackingView, tripStatus, currentTrip, currentDriver,
  showTripComplete, showTripRating,
  onBackToMap, onCancelTrip, onCompleteTrip, onPaymentSuccess, onRatingComplete,
  setActiveTab, setShowTripComplete, setShowTripRating,
}) => {
  return (
    <AnimatePresence mode="wait">
      {isOnTrackingView && tripStatus === 'en_route' && (
        <motion.div
          key="realtime-tracking"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-gray-100 overflow-y-auto"
        >
          <RealTimeTracking
            trip={currentTrip}
            driver={currentDriver}
            onBack={onBackToMap}
            onEmergency={() => toast.error("Signal d'urgence envoyé !")}
            onContactDriver={() => window.open(`tel:${currentDriver?.phone}`)}
            onCancelTrip={onCancelTrip}
            onEndTrip={onCompleteTrip}
            onShareTrip={(data) => {
              console.log('Share trip:', data);
              toast.success('Trajet partagé !');
            }}
          />
        </motion.div>
      )}

      {showTripComplete && currentTrip && (
        <motion.div
          key="trip-complete"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto"
        >
          <TrajetComplete
            role="passenger"
            trip={currentTrip}
            driver={currentDriver}
            onPaymentSuccess={onPaymentSuccess}
            onBack={() => {
              setShowTripComplete(false);
              setActiveTab('home');
            }}
          />
        </motion.div>
      )}

      {showTripRating && currentTrip && (
        <motion.div
          key="trip-rating"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto"
        >
          <TrajetNote
            trip={currentTrip}
            onRatingComplete={onRatingComplete}
            onBack={() => {
              setShowTripRating(false);
              setShowTripComplete(true);
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenTripOverlay;

// Passenger.jsx — VERSION FINALE COMPLETE (searching OK + stop searching on accept)
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PassengerNavbar from '../components/passager/PassengerNavbar';
import TripConfirmationModal from '../components/passager/TripConfirmationModal';
import TripStatusModal from '../components/passager/TripStatusModal';
import SearchIndicator from '../components/passager/SearchIndicator';
import { usePassenger } from '../context/PassengerContext';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import usePlatformNotifications from '../hooks/usePlatformNotifications';
import CommunityHub from '../components/community/CommunityHub';
import CommunityFAB from '../components/community/CommunityFAB';

import { usePromoNotifications } from './passager/usePromoNotifications';
import { useTripStatusFlow } from './passager/useTripStatusFlow';
import { useTripBooking } from './passager/useTripBooking';
import PassengerTabContent from './passager/PassengerTabContent';
import FullScreenTripOverlay from './passager/FullScreenTripOverlay';
import PassengerFooter from './passager/PassengerFooter';

const Passenger = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const platform = settings?.platform || {};
  const { passenger: user, isLoadingProfile } = usePassenger();

  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  // Notifications temps réel plateforme (maintenance, services) et promotions
  usePlatformNotifications();
  usePromoNotifications();

  const {
    currentTrip, setCurrentTrip, tripStatus, setTripStatus, currentDriver, setCurrentDriver,
    activeTab, setActiveTab,
    showTripStatusModal, setShowTripStatusModal,
    showTripComplete, setShowTripComplete,
    showTripRating, setShowTripRating,
    isOnMapView, setIsOnMapView, isOnTrackingView, setIsOnTrackingView,
    arrivalSecondsRemaining,
    clearTimers, searchTimeoutRef,
    shouldShowSearchIndicator,
    handleDriverFound, handleShowOnMap, handleNavigateToTracking,
    handleViewPlanning, handleBackToMap, handleCancelTrip,
    handleCompleteTrip, handlePostTripPaymentSuccess,
    handleRatingComplete, handleRateTrip,
  } = useTripStatusFlow();

  const { showTripModal, setShowTripModal, handleBookTrip, handleConfirmTrip } = useTripBooking({
    clearTimers, searchTimeoutRef, setShowTripStatusModal,
  });

  const handleTabChange = (tabId) => {
    if (tabId !== 'home') {
      setIsOnTrackingView(false);
      setIsOnMapView(false);
    }
    setActiveTab(tabId);
  };

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-transparent">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
          {t('common.session_loading')}
        </p>
      </div>
    );
  }

  const isFullScreenViewActive = (isOnTrackingView || showTripComplete || showTripRating) && currentTrip;
  const isTripInProgress = tripStatus === 'en_route';

  return (
    <>
      <FullScreenTripOverlay
        isOnTrackingView={isOnTrackingView}
        tripStatus={tripStatus}
        currentTrip={currentTrip}
        currentDriver={currentDriver}
        showTripComplete={showTripComplete}
        showTripRating={showTripRating}
        onBackToMap={handleBackToMap}
        onCancelTrip={handleCancelTrip}
        onCompleteTrip={handleCompleteTrip}
        onPaymentSuccess={handlePostTripPaymentSuccess}
        onRatingComplete={handleRatingComplete}
        setActiveTab={setActiveTab}
        setShowTripComplete={setShowTripComplete}
        setShowTripRating={setShowTripRating}
      />

      <Toaster position="top-right" containerStyle={{ zIndex: 9999 }} />

      {shouldShowSearchIndicator && (
        <SearchIndicator
          status={tripStatus}
          driver={currentDriver}
          tripDetails={currentTrip}
          onGoToHome={() => {
            setActiveTab('home');
            setIsOnMapView(true);
          }}
          onCancel={handleCancelTrip}
          onContact={() => window.open(`tel:${currentDriver?.phone}`)}
          onTrack={handleShowOnMap}
        />
      )}

      <div
        className={`min-h-screen bg-gray-100 bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-800 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all duration-300 ${isFullScreenViewActive ? 'hidden' : ''
          } ${!navigator.onLine ? 'pt-10' : ''}`}
      >
        <PassengerNavbar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isTripInProgress={isTripInProgress}
          onNavigateToTracking={handleNavigateToTracking}
        />

        {/* Décalage réservé à la sidebar tablette (icônes, md-to-lg) + marge basse pour ne pas
            passer sous la bottom bar flottante mobile */}
        <div className="md:pl-[72px] lg:pl-0 pb-24 md:pb-0">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${isOnMapView}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PassengerTabContent
                  activeTab={activeTab}
                  onBookTrip={handleBookTrip}
                  currentTrip={currentTrip}
                  currentDriver={currentDriver}
                  tripStatus={tripStatus}
                  isOnMapView={isOnMapView}
                  onShowTracking={handleShowOnMap}
                  onGoToHome={() => setActiveTab('home')}
                />
              </motion.div>
            </AnimatePresence>
          </main>

          <PassengerFooter platform={platform} />
        </div>

        <TripConfirmationModal
          isOpen={showTripModal}
          onClose={() => setShowTripModal(false)}
          onConfirm={handleConfirmTrip}
          tripDetails={currentTrip}
          user={user}
        />

        <TripStatusModal
          isOpen={showTripStatusModal}
          onClose={() => setShowTripStatusModal(false)}
          status={tripStatus}
          driver={currentDriver}
          tripDetails={currentTrip}
          arrivalSecondsRemaining={arrivalSecondsRemaining}
          onCancel={handleCancelTrip}
          onContact={() => window.open(`tel:${currentDriver?.phone}`)}
          onTrack={handleShowOnMap}
          onViewPlanning={handleViewPlanning}
          onTripComplete={handleCompleteTrip}
          onSearchAgain={() => {
            toast.dismiss('searching');
            setShowTripStatusModal(false);
            setCurrentTrip(null);
            setCurrentDriver(null);
            setTripStatus('idle');
            setIsOnMapView(false);
            setIsOnTrackingView(false);
          }}
          onDriverFound={handleDriverFound}
          onRateTrip={handleRateTrip}
        />
      </div>
      <CommunityFAB onClick={() => setIsCommunityOpen(true)} />
      <CommunityHub isOpen={isCommunityOpen} onClose={() => setIsCommunityOpen(false)} />
    </>
  );
};

export default Passenger;

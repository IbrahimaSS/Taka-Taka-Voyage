// Passenger.jsx — VERSION FINALE COMPLETE (searching OK + stop searching on accept)
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PassengerNavbar from '../components/passager/PassengerNavbar';
import BookingSection from '../components/passager/BookingSection';
import TripsHistory from '../components/passager/TripsHistory';
import Transactions from '../components/passager/Paiement';
import Profile from '../components/passager/Profile';
import Settings from '../components/passager/Settings';
import Support from '../components/passager/Support';
import TripConfirmationModal from '../components/passager/TripConfirmationModal';
import Evaluations from '../components/passager/Evaluation';
import TripStatusModal from '../components/passager/TripStatusModal';
import Planning from '../components/passager/Planning';
import { usePassenger } from '../context/PassengerContext';
import toast, { Toaster } from 'react-hot-toast';
import { tripService } from '../services/tripService';
import socketService from '../services/socketService';

import {
  Home,
  History,
  CreditCard,
  User,
  Settings as SettingsIcon,
  Headphones,
  Car,
  Star,
  Calendar,
} from 'lucide-react';

import RealTimeTracking from '../components/suivisTrajet/TrajetEnTempReel';
import TrajetComplete from '../components/suivisTrajet/TrajetComplete';
import TrajetNote from '../components/suivisTrajet/TrajetNote';
import SearchIndicator from '../components/passager/SearchIndicator';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const Passenger = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showTripModal, setShowTripModal] = useState(false);
  const [showTripStatusModal, setShowTripStatusModal] = useState(false);
  const [showTripComplete, setShowTripComplete] = useState(false);
  const [showTripRating, setShowTripRating] = useState(false);

  const {
    passenger: user,
    currentTrip,
    setCurrentTrip,
    tripStatus,
    setTripStatus,
    selectedDriver: currentDriver,
    setSelectedDriver: setCurrentDriver,
    isLoadingProfile,
  } = usePassenger();



  const [isOnMapView, setIsOnMapView] = useState(false);
  const [isOnTrackingView, setIsOnTrackingView] = useState(false);

  const [arrivalSecondsRemaining, setArrivalSecondsRemaining] = useState(null);
  const arrivalIntervalRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const arrivalModalTimeoutRef = useRef(null);

  // user is now managed by context

  const clearTimers = () => {
    if (arrivalIntervalRef.current) {
      clearInterval(arrivalIntervalRef.current);
      arrivalIntervalRef.current = null;
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    if (arrivalModalTimeoutRef.current) {
      clearTimeout(arrivalModalTimeoutRef.current);
      arrivalModalTimeoutRef.current = null;
    }
    setArrivalSecondsRemaining(null);
    setShowArrivalModal(false);
  };

  const tabs = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'history', label: 'Historique', icon: History },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'planning', label: 'Planning ', icon: Calendar },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'evaluations', label: 'Évaluations', icon: Star },
    { id: 'settings', label: 'Paramètres', icon: SettingsIcon },
    { id: 'support', label: 'Support', icon: Headphones },
  ];

  const shouldShowSearchIndicator = useMemo(() => {
    const rid = currentTrip?.reservationId;
    const isImmediate = currentTrip?.typeCourse === 'IMMEDIATE';
    const okStatus = tripStatus === 'searching' || tripStatus === 'driver_found' || tripStatus === 'approaching' || tripStatus === 'arrived';
    return !!rid && isImmediate && okStatus;
  }, [currentTrip?.reservationId, currentTrip?.typeCourse, tripStatus]);

  const handleBookTrip = (tripData) => {
    setCurrentTrip(tripData);
    setShowTripModal(true);
  };

  const handleConfirmTrip = async (confirmedTripData, paymentResult = null) => {
    if (!currentTrip) throw new Error('Aucun trajet à confirmer');

    const momentPaiement = confirmedTripData.paymentTime === 'advance' ? 'MAINTENANT' : 'APRES';
    const typeCourse = confirmedTripData.tripType === 'now' ? 'IMMEDIATE' : 'PLANIFIEE';

    const paiementRequis = momentPaiement === 'MAINTENANT';
    if (paiementRequis && !paymentResult?.success) {
      throw new Error('Paiement requis avant de confirmer la réservation.');
    }

    const payload = {
      depart: currentTrip.depart ?? currentTrip.pickup,
      destination: currentTrip.destination,
      departLat: currentTrip.departLat ?? currentTrip.pickupCoords?.[0],
      departLng: currentTrip.departLng ?? currentTrip.pickupCoords?.[1],
      destinationLat: currentTrip.destinationLat ?? currentTrip.destinationCoords?.[0],
      destinationLng: currentTrip.destinationLng ?? currentTrip.destinationCoords?.[1],
      distanceKm: currentTrip.distanceKm,
      dureeMin: currentTrip.dureeMin,
      typeVehicule: confirmedTripData.vehicleType || currentTrip.vehicleType || 'taxi',
      prix: String(confirmedTripData.price ?? currentTrip.estimatedPrice ?? '').replace(/[^0-9]/g, ''),
      momentPaiement,
      typeCourse,
      paymentResult: paiementRequis ? paymentResult : null,
    };

    const creatingToast = toast.loading('Création de la réservation...');
    try {
      const response =
        typeCourse === 'IMMEDIATE'
          ? await tripService.create(payload)
          : await tripService.createPlanned(payload);

      toast.dismiss(creatingToast);
      toast.success('Réservation créée !');

      const reservationId = response.data?.reservation?._id || response.data?.reservationId;

      setCurrentTrip((prev) => ({
        ...prev,
        ...confirmedTripData,
        ...payload,
        reservationId,
        id: `TRIP-${Date.now()}`,
        typeCourse,
        // ✅ Garder le statut si déjà "driver_found" (via socket)
        status:
          prev?.status === 'driver_found'
            ? 'driver_found'
            : typeCourse === 'IMMEDIATE'
              ? 'searching'
              : 'scheduled',
        createdAt: prev?.createdAt || new Date().toISOString(),
      }));

      clearTimers();

      if (typeCourse === 'IMMEDIATE') {
        // ✅ Ne passer en 'searching' que si on n'a pas déjà trouvé un chauffeur (via socket)
        if (tripStatus !== 'driver_found' && tripStatus !== 'arrived') {
          toast.loading("🔍 Recherche d'un chauffeur...", { id: 'searching' });
          setTripStatus('searching');
        }

        searchTimeoutRef.current = setTimeout(() => {
          setTripStatus((prev) => {
            if (prev === 'searching') {
              toast.dismiss('searching');
              toast.error('Aucun chauffeur disponible. Veuillez réessayer.');
              setCurrentTrip(null);
              setCurrentDriver(null);
              return 'idle';
            }
            return prev;
          });
        }, 120000);

        // join room RESERVATION_{id}
        if (reservationId) {
          socketService.onceConnected(() => {
            socketService.emit('reservation:join', { reservationId });
          });
        }
      } else {
        setTripStatus('scheduled');
        setShowTripStatusModal(true);
        toast.success('Course planifiée avec succès !');
      }
    } catch (error) {
      toast.dismiss(creatingToast);
      toast.dismiss('searching');
      throw error;
    }
  };

  const handleDriverFound = (driver) => {
    setCurrentDriver(driver);
    setTripStatus('driver_found');
    setCurrentTrip((prev) => ({ ...prev, driver, status: 'driver_found' }));
  };

  const handleShowOnMap = () => {
    setIsOnMapView(true);
    setShowTripStatusModal(false);
    setActiveTab('home');
    toast.success('Chauffeur affiché sur la carte');
  };

  const handleStartTrip = () => {
    clearTimers();

    setTimeout(() => {
      setTripStatus('en_route');
      setIsOnTrackingView(true);
      setIsOnMapView(false);
      setActiveTab('home');

      setCurrentTrip((prev) => ({
        ...prev,
        status: 'en_route',
        startedAt: new Date().toISOString(),
      }));

      setShowTripStatusModal(false);
      toast.success('Trajet démarré ! Suivi en temps réel activé.');
    }, 600);
  };

  const handleNavigateToTracking = () => {
    if (tripStatus === 'en_route') {
      setIsOnTrackingView(true);
      setIsOnMapView(false);
      setActiveTab('home');
      toast.success('Retour au suivi en temps réel');
    }
  };

  const hadalOnViewPlanning = () => {
    setShowTripStatusModal(false);
    setActiveTab('planning');
  };

  const handleBackToMap = () => {
    setIsOnTrackingView(false);
    setIsOnMapView(true);
    setActiveTab('home');
  };

  const handleCancelTrip = async () => {
    clearTimers();
    toast.dismiss('searching');

    const reservationId = currentTrip?.reservationId;
    if (reservationId) {
      try {
        await tripService.cancel(reservationId, { reason: 'CANCELLED_BY_PASSENGER' });
      } catch (e) {
        console.warn('Cancel API failed:', e?.message);
      }
      socketService.emit('course:annuler', { reservationId, source: 'PASSAGER' });
    }

    setTripStatus('cancelled');
    setIsOnTrackingView(false);
    setIsOnMapView(false);
    setCurrentDriver(null);
    setCurrentTrip(null);
    toast.info('Course annulée');
    setShowTripStatusModal(false);
  };

  useEffect(() => {
    return () => {
      clearTimers();
      toast.dismiss('searching');
    };
  }, []);

  useEffect(() => {
    if (tripStatus === 'arrived') {
      setShowArrivalModal(true);
    } else {
      setShowArrivalModal(false);
    }

    if (tripStatus === 'en_route') {
      setIsOnTrackingView(true);
      setIsOnMapView(false);
    }

    if (tripStatus === 'approaching') {
      setIsOnMapView(true);
    }
  }, [tripStatus]);

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-transparent">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
          Chargement de votre session...
        </p>
      </div>
    );
  }

  const handleCompleteTrip = () => {
    setTripStatus('completed');
    setIsOnTrackingView(false);
    setIsOnMapView(false);

    const completedTrip = {
      ...currentTrip,
      status: 'completed',
      completedAt: new Date().toISOString(),
      driver: currentDriver,
    };

    setCurrentTrip(completedTrip);

    if (currentTrip?.paymentTime === 'advance') {
      setShowTripRating(true);
      setShowTripStatusModal(false);
    } else {
      setShowTripComplete(true);
      setShowTripStatusModal(false);
    }

    toast.success('Trajet terminé avec succès !');
  };

  const handlePostTripPaymentSuccess = (paymentData) => {
    setShowTripComplete(false);

    const updatedTrip = {
      ...currentTrip,
      payment: {
        ...paymentData,
        status: 'completed',
        paidAt: new Date().toISOString(),
      },
      paid: true,
    };

    setCurrentTrip(updatedTrip);
    setShowTripRating(true);
    toast.success('Paiement effectué avec succès !');
  };

  const handleRatingComplete = () => {
    setShowTripRating(false);
    setCurrentTrip(null);
    setCurrentDriver(null);
    setTripStatus('idle');
    toast.success('Merci pour votre évaluation !');
  };

  const handleRateTrip = (ratingData) => {
    console.log('Trip rated:', ratingData);
    setShowTripStatusModal(false);
    setCurrentTrip(null);
    setCurrentDriver(null);
    setTripStatus('idle');
    toast.success('Merci pour votre évaluation !');
  };

  const handleTabChange = (tabId) => {
    if (tabId !== 'home') {
      setIsOnTrackingView(false);
      setIsOnMapView(false);
    }
    setActiveTab(tabId);
  };

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <BookingSection
          onBookTrip={handleBookTrip}
          currentTrip={currentTrip}
          currentDriver={currentDriver}
          tripStatus={tripStatus}
          isOnMapView={isOnMapView}
          onStartTrip={handleStartTrip}
          onShowTracking={() => {
            if (tripStatus === 'en_route') {
              setIsOnTrackingView(true);
              setIsOnMapView(false);
            }
          }}
        />
      );
    }

    switch (activeTab) {
      case 'history':
        return <TripsHistory />;
      case 'payments':
        return <Transactions />;
      case 'evaluations':
        return <Evaluations />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'planning':
        return <Planning />;
      case 'support':
        return <Support />;
      default:
        return <BookingSection onBookTrip={handleBookTrip} />;
    }
  };

  const isFullScreenViewActive = isOnTrackingView || showTripComplete || showTripRating;
  const isTripInProgress = tripStatus === 'en_route';


  return (
    <>
      <AnimatePresence mode="wait">
        {/* ... existing Tracking and Complete modals ... */}
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
              onBack={handleBackToMap}
              onEmergency={() => toast.error("Signal d'urgence envoyé !")}
              onContactDriver={() => window.open(`tel:${currentDriver?.phone}`)}
              onCancelTrip={handleCancelTrip}
              onEndTrip={handleCompleteTrip}
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
              trip={currentTrip}
              driver={currentDriver}
              onPaymentSuccess={handlePostTripPaymentSuccess}
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
              onRatingComplete={handleRatingComplete}
              onBack={() => {
                setShowTripRating(false);
                setShowTripComplete(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster position="top-right" containerStyle={{ zIndex: 9999 }} />

      <AnimatePresence>
        {showArrivalModal && currentDriver && (
          <motion.div
            key="arrival-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ zIndex: 99999 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-center text-white">
                <div className="w-20 h-20 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-4 backdrop-blur-md">
                  <Car className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold italic">Votre chauffeur est arrivé !</h3>
                <p className="text-white/80 mt-1">Il vous attend au point de départ.</p>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                      {currentDriver.name}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {currentDriver.vehicle?.brand || "Véhicule"} {currentDriver.vehicle?.model || ""} • {currentDriver.vehicle?.plate || "N/A"}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-sm font-medium dark:text-gray-300">{currentDriver.rating || "5.0"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => window.open(`tel:${currentDriver.phone}`)}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center transition-all shadow-lg shadow-green-500/30"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Appeler le chauffeur
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setShowArrivalModal(false);
                        handleShowOnMap();
                      }}
                      className="py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      <Navigation className="w-5 h-5 mr-2" />
                      Suivi Carte
                    </button>
                    <button
                      onClick={handleCancelTrip}
                      className="py-3.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-2xl font-semibold flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Annuler
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Démarrage automatique à la montée abord</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        className={`min-h-screen bg-gray-100 bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-800 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 ${isFullScreenViewActive ? 'hidden' : ''
          }`}
      >
        <PassengerNavbar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabs={tabs}
          isTripInProgress={isTripInProgress}
          onNavigateToTracking={handleNavigateToTracking}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${isOnMapView}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

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
          onViewPlanning={hadalOnViewPlanning}
          onStartTrip={handleStartTrip}
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

        <footer className="mt-12 py-12 bg-gradient-to-r from-gray-900 to-gray-800 dark:bg-gray-800/40 text-white transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-8 md:mb-0 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Taka<span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">Taka</span>
                    </h2>
                    <p className="text-gray-400 text-sm dark:text-gray-100">Mobilité intelligente</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-8 justify-center">
                <a href="#" className="text-gray-400 hover:text-white transition-all hover:scale-105">À propos</a>
                <a href="#" className="text-gray-400 hover:text-white transition-all hover:scale-105">Aide</a>
                <a href="#" className="text-gray-400 hover:text-white transition-all hover:scale-105">Confidentialité</a>
                <a href="#" className="text-gray-400 hover:text-white transition-all hover:scale-105">Conditions</a>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800 dark:border-gray-800/50 text-center">
              <p className="text-gray-500">© {new Date().getFullYear()} Taka Taka. Tous droits réservés.</p>
              <p className="text-gray-600 text-xs mt-2 uppercase tracking-widest">Service disponible 24h/24, 7j/7</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Passenger;

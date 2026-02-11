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
import { PassengerProvider } from '../context/PassengerContext';
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

  const [currentTrip, setCurrentTrip] = useState(null);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [tripStatus, setTripStatus] = useState('idle'); // idle, searching, driver_found, arrived, en_route, completed, cancelled, scheduled

  const [isOnMapView, setIsOnMapView] = useState(false);
  const [isOnTrackingView, setIsOnTrackingView] = useState(false);

  const [arrivalSecondsRemaining, setArrivalSecondsRemaining] = useState(null);
  const arrivalIntervalRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const arrivalModalTimeoutRef = useRef(null);

  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    if (!user) {
      const u = getStoredUser();
      if (u) setUser(u);
    }
  }, [user]);

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
    const okStatus = tripStatus === 'searching' || tripStatus === 'driver_found' || tripStatus === 'arrived';
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

      const updatedTrip = {
        ...currentTrip,
        ...confirmedTripData,
        ...payload,
        reservationId,
        id: `TRIP-${Date.now()}`,
        typeCourse,
        status: typeCourse === 'IMMEDIATE' ? 'searching' : 'scheduled',
        createdAt: new Date().toISOString(),
      };

      setCurrentTrip(updatedTrip);
      clearTimers();

      if (typeCourse === 'IMMEDIATE') {
        setTripStatus('searching');
        toast.loading("🔍 Recherche d'un chauffeur...", { id: 'searching' });

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

  // ✅ SOCKET: connexion PASSAGER (UN SEUL ENDROIT: ICI)
  useEffect(() => {
    const pid = user?._id || user?.id;
    if (!pid) return;

    socketService.connect(pid, 'PASSAGER', user.nom || '', user.prenom || '');

    // ⚠️ IMPORTANT : ne pas disconnect en cleanup (sinon ça coupe quand react remount)
    // return () => socketService.disconnect();
  }, [user?._id, user?.id]);

  // ✅ SOLUTION RACE CONDITION: Refs pour accéder à l'état frais dans les callbacks socket
  const tripStatusRef = useRef(tripStatus);
  const currentTripIdRef = useRef(null);

  useEffect(() => {
    tripStatusRef.current = tripStatus;
    currentTripIdRef.current = currentTrip?.reservationId;
  }, [tripStatus, currentTrip?.reservationId]);

  // ✅ SOCKET: listeners persistants (activés dès la connexion)
  useEffect(() => {
    const onAccepted = (data) => {
      const rid = data?.reservationId;
      // On accepte si c'est notre réservation actuelle OU si on est en train d'en chercher une
      if (!rid || (currentTripIdRef.current && String(rid) !== String(currentTripIdRef.current))) {
        console.log("📩 Socket course:acceptee ignoré (pas le bon ID ou pas de course en cours)", { rid, current: currentTripIdRef.current });
        return;
      }

      console.log("✅ Socket course:acceptee reçu !", data);
      clearTimers();
      toast.dismiss('searching');

      const ch = data?.chauffeur || {};
      const driverObj = {
        id: ch.id || ch._id,
        nom: ch.nom,
        prenom: ch.prenom,
        name: `${ch.prenom || ''} ${ch.nom || ''}`.trim() || 'Chauffeur',
        phone: ch.phone,
        rating: ch.rating,
        vehicle: ch.vehicle,
        eta: ch.eta,
        distance: ch.distance,
        verified: ch.verified,
      };

      setCurrentDriver(driverObj);
      setTripStatus('driver_found');
      setCurrentTrip((prev) => ({ ...prev, reservationId: rid, driver: driverObj, status: 'driver_found' }));

      setShowTripStatusModal(true);
      setIsOnMapView(true);
      setIsOnTrackingView(false);
      setActiveTab('home');

      toast.success('✅ Votre demande a été acceptée !');
    };

    const onDriverEnRoute = (data) => {
      if (!data?.reservationId || String(data.reservationId) !== String(currentTripIdRef.current)) return;
      toast.success(data?.message || 'Le chauffeur est en route');
    };

    const onDriverArrived = (data) => {
      if (!data?.reservationId || String(data.reservationId) !== String(currentTripIdRef.current)) return;

      setTripStatus('arrived');
      toast.success(data?.message || 'Votre chauffeur est arrivé');

      setShowArrivalModal(true);
      arrivalModalTimeoutRef.current = setTimeout(() => {
        setShowArrivalModal(false);
        handleStartTrip();
      }, 3000);
    };

    const onTripStarted = (data) => {
      if (!data?.reservationId || String(data.reservationId) !== String(currentTripIdRef.current)) return;

      toast.success(data?.message || 'Trajet démarré – suivi en temps réel activé');
      setTripStatus('en_route');
      setIsOnTrackingView(true);
      setIsOnMapView(false);
      setActiveTab('home');
    };

    const onDriverPos = (pos) => {
      if (!pos?.reservationId || String(pos.reservationId) !== String(currentTripIdRef.current)) return;

      setCurrentDriver((prev) => ({
        ...(prev || {}),
        currentLocation: [pos.lat, pos.lng],
        location: [pos.lat, pos.lng],
        heading: pos.heading,
        speed: pos.speed,
        lastSeenAt: pos.timestamp || Date.now(),
      }));
    };

    socketService.on('course:acceptee', onAccepted);
    socketService.on('course:chauffeur_en_route', onDriverEnRoute);
    socketService.on('course:chauffeur_arrive', onDriverArrived);
    socketService.on('course:demarre', onTripStarted);
    socketService.on('position:chauffeur', onDriverPos);

    return () => {
      socketService.off('course:acceptee', onAccepted);
      socketService.off('course:chauffeur_en_route', onDriverEnRoute);
      socketService.off('course:chauffeur_arrive', onDriverArrived);
      socketService.off('course:demarre', onTripStarted);
      socketService.off('position:chauffeur', onDriverPos);
    };
  }, []); // Pas de dépendance sur currentTripId !

  return (
    <PassengerProvider>
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
        {showArrivalModal && (
          <motion.div
            key="arrival-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ zIndex: 99999 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-blue-600 mx-auto flex items-center justify-center mb-4">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Votre chauffeur est arrivé</h3>
              <p className="text-gray-600 mt-2">Le trajet va démarrer automatiquement dans un instant.</p>

              <div className="mt-5">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-green-500 to-blue-600"
                  />
                </div>
                <div className="text-sm text-gray-500 mt-2">Démarrage automatique...</div>
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
    </PassengerProvider>
  );
};

export default Passenger;

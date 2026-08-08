import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { usePassenger } from '../../context/PassengerContext';
import { tripService } from '../../services/tripService';
import socketService from '../../services/socketService';

// Gère le cycle de vie du statut d'un trajet : navigation carte/tracking,
// arrivée du chauffeur, annulation, fin de course et évaluation.
export const useTripStatusFlow = () => {
  const {
    currentTrip,
    setCurrentTrip,
    tripStatus,
    setTripStatus,
    selectedDriver: currentDriver,
    setSelectedDriver: setCurrentDriver,
    currentPage: activeTab,
    setCurrentPage: setActiveTab,
  } = usePassenger();

  const [showTripStatusModal, setShowTripStatusModal] = useState(false);
  const [showTripComplete, setShowTripComplete] = useState(false);
  const [showTripRating, setShowTripRating] = useState(false);
  const [isOnMapView, setIsOnMapView] = useState(false);
  const [isOnTrackingView, setIsOnTrackingView] = useState(false);
  const [arrivalSecondsRemaining, setArrivalSecondsRemaining] = useState(null);

  const arrivalIntervalRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (arrivalIntervalRef.current) {
      clearInterval(arrivalIntervalRef.current);
      arrivalIntervalRef.current = null;
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    setArrivalSecondsRemaining(null);
  }, []);

  const handleCompleteTrip = useCallback(() => {
    setTripStatus('completed');
    setIsOnTrackingView(false);
    setIsOnMapView(false);

    setCurrentTrip((prev) => ({
      ...prev,
      status: 'completed',
      completedAt: new Date().toISOString(),
      driver: currentDriver,
    }));

    // Toujours afficher le résumé du trajet d'abord
    setShowTripComplete(true);
    setShowTripStatusModal(false);

    toast.success('Trajet terminé avec succès !', { id: 'trip-completion' });
  }, [currentDriver, setCurrentTrip, setTripStatus]);

  // Redirection automatique si le statut passe à 'completed' (via socket)
  useEffect(() => {
    if (tripStatus === 'completed' && !showTripComplete && !showTripRating) {
      console.log("🏁 Redirection automatique: Trajet marqué 'completed'");
      handleCompleteTrip();
    }
  }, [tripStatus, showTripComplete, showTripRating, handleCompleteTrip]);

  // Gestion automatique des redirections selon le statut
  useEffect(() => {
    // Quand le trajet démarre (clic Chauffeur sur Démarrer)
    if (tripStatus === 'en_route') {
      setIsOnTrackingView(true);
      setIsOnMapView(false);
      setActiveTab('home');
      console.log("🚀 [Passager] Basculement automatique en mode suivi plein écran.");
    }
    // Quand le chauffeur est en approche ou arrivé
    if (tripStatus === 'approaching' || tripStatus === 'arrived') {
      setIsOnMapView(true); // Se focaliser sur la carte d'accueil
      setIsOnTrackingView(false);
    }
  }, [tripStatus, setActiveTab]);

  // Support pour la redirection /passager/tickets
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/tickets')) {
      setActiveTab('profile');
    }
  }, [setActiveTab]);

  // Gestion des notifications de statut
  useEffect(() => {
    if (currentTrip?.status) {
      setTripStatus(currentTrip.status);
    }
  }, [currentTrip, setTripStatus]);

  const handleDriverFound = (driver) => {
    setCurrentDriver(driver);
    setTripStatus('driver_found');
    setCurrentTrip((prev) => ({ ...prev, driver, status: 'driver_found' }));
    setShowTripStatusModal(true);
  };

  // Faire disparaître le modal chauffeur après 10s
  useEffect(() => {
    let timer;
    if (tripStatus === 'driver_found' && showTripStatusModal) {
      timer = setTimeout(() => {
        setShowTripStatusModal(false);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [tripStatus, showTripStatusModal]);

  const handleShowOnMap = () => {
    // Si la course a démarré, on va sur la vue tracking
    if (tripStatus === 'en_route') {
      setIsOnTrackingView(true);
      setIsOnMapView(false);
    } else {
      // Sinon (approche/arrivée), on reste sur la home avec la carte
      setIsOnMapView(true);
      setIsOnTrackingView(false);
    }
    setShowTripStatusModal(false);
    setActiveTab('home');
    toast.success('Suivi du chauffeur activé');
  };

  const handleNavigateToTracking = () => {
    if (tripStatus === 'en_route') {
      setIsOnTrackingView(true);
      setIsOnMapView(false);
      setActiveTab('home');
      toast.success('Retour au suivi en temps réel');
    }
  };

  const handleViewPlanning = () => {
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
        if (currentTrip?.typeCourse === 'IMMEDIATE') {
          await tripService.cancelAndRefund(reservationId);
        } else {
          await tripService.cancel(reservationId, { reason: 'CANCELLED_BY_PASSENGER' });
        }
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

    if (currentTrip?.typeCourse === 'IMMEDIATE') {
      toast.success('Course annulée • Remboursement effectué 💸');
    } else {
      toast('Course annulée', { icon: 'ℹ️' });
    }

    setShowTripStatusModal(false);
  };

  useEffect(() => {
    return () => {
      clearTimers();
      toast.dismiss('searching');
    };
  }, [clearTimers]);

  const handlePostTripPaymentSuccess = useCallback((paymentData) => {
    setShowTripComplete(false);

    setCurrentTrip((prev) => ({
      ...prev,
      payment: {
        ...paymentData,
        status: 'completed',
        paidAt: new Date().toISOString(),
      },
      paid: true,
    }));

    setShowTripRating(true);
    toast.success('Paiement effectué avec succès !', { id: 'payment-status' });
  }, [setCurrentTrip]);

  const handleRatingComplete = () => {
    setShowTripRating(false);
    setCurrentTrip(null);
    setCurrentDriver(null);
    setTripStatus('idle');
    toast.success('Merci pour votre évaluation !', { id: 'rating-status' });
  };

  const handleRateTrip = (ratingData) => {
    console.log('Trip rated:', ratingData);
    setShowTripStatusModal(false);
    setCurrentTrip(null);
    setCurrentDriver(null);
    setTripStatus('idle');
    toast.success('Merci pour votre évaluation !', { id: 'rating-status' });
  };

  // Écouter la redirection vers le Wallet (depuis le modal de paiement)
  useEffect(() => {
    const handleGoToWallet = () => {
      setActiveTab('wallet');
      setIsOnMapView(false);
      setIsOnTrackingView(false);
    };
    window.addEventListener('navigate-to-wallet', handleGoToWallet);
    return () => window.removeEventListener('navigate-to-wallet', handleGoToWallet);
  }, [setActiveTab]);

  useEffect(() => {
    const handleOpenTicketGlobal = (e) => {
      console.log("🚀 [PASSENGER] Event taka:open_ticket reçu. Forçage ouverture ticket...", e.detail);
      setActiveTab('profile');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('taka:open_ticket_delay', { detail: e.detail }));
      }, 100);
    };
    window.addEventListener('taka:open_ticket', handleOpenTicketGlobal);
    return () => window.removeEventListener('taka:open_ticket', handleOpenTicketGlobal);
  }, [setActiveTab]);

  const shouldShowSearchIndicator = useMemo(() => {
    const rid = currentTrip?.reservationId;
    const isImmediate = currentTrip?.typeCourse === 'IMMEDIATE';
    const okStatus = tripStatus === 'searching' || tripStatus === 'driver_found' || tripStatus === 'approaching' || tripStatus === 'arrived';
    return !!rid && isImmediate && okStatus;
  }, [currentTrip?.reservationId, currentTrip?.typeCourse, tripStatus]);

  return {
    currentTrip, setCurrentTrip, tripStatus, setTripStatus, currentDriver, setCurrentDriver,
    activeTab, setActiveTab,
    showTripStatusModal, setShowTripStatusModal,
    showTripComplete, setShowTripComplete,
    showTripRating, setShowTripRating,
    isOnMapView, setIsOnMapView,
    isOnTrackingView, setIsOnTrackingView,
    arrivalSecondsRemaining,
    clearTimers,
    searchTimeoutRef,
    shouldShowSearchIndicator,
    handleDriverFound,
    handleShowOnMap,
    handleNavigateToTracking,
    handleViewPlanning,
    handleBackToMap,
    handleCancelTrip,
    handleCompleteTrip,
    handlePostTripPaymentSuccess,
    handleRatingComplete,
    handleRateTrip,
  };
};

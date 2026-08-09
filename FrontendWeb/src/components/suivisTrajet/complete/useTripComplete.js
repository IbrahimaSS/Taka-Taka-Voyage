import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../../../services/socketService';
import { tripService } from '../../../services/tripService';
import toast from 'react-hot-toast';

export const useTripComplete = ({ trip, driver, onPaymentSuccess, onBack, role }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('--:--');
  const [selectedPayment, setSelectedPayment] = useState(trip?.paymentMethod?.toLowerCase()?.includes('orange') ? 'orange' : 'cash');
  const [otpValues, setOtpValues] = useState(Array(6).fill(''));
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpTimer, setOtpTimer] = useState(120);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localTrip, setLocalTrip] = useState(trip);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ✅ [FIX] Données normalisées à partir des props (Déplacé en haut pour éviter le crash au 1er render)
  const normalizedData = {
    departure: trip?.pickup || trip?.depart || trip?.pickupAddress || 'Point de départ',
    destination: trip?.destination || trip?.destinationAddress || 'Destination',
    driver: driver?.name || trip?.driverName || 'Chauffeur',
    driverRating: driver?.rating || trip?.driverRating || 4.5,
    distance: trip?.estimatedDistance || trip?.distanceKm || trip?.distance || '0.0 km',
    duration: trip?.estimatedDuration || trip?.dureeMin || trip?.estimatedTime || '-- min',
    startTime: trip?.startTime || '--:--',
    endTime: trip?.endTime || '',
    pricing: {
      base: (() => {
        // Priorité au prix réel (prix > estimatedFare > estimatedPrice) pour la cohérence
        const val = trip?.prix || trip?.estimatedFare || trip?.estimatedPrice || trip?.price || 0;
        const rawTotal = parseInt(String(val).replace(/[^0-9]/g, '')) || 0;

        // Arrondir au 100 GNF le plus proche pour éviter les décimales bizarres (ex: 25 GNF)
        const total = Math.round(rawTotal / 100) * 100;

        const fee = trip?.fraisService || trip?.serviceFee || 500;
        const feeVal = parseInt(String(fee).replace(/[^0-9]/g, '')) || 500;

        // Si le total est supérieur aux frais, on déduit les frais pour avoir la base
        return total > feeVal ? total - feeVal : total;
      })(),
      serviceFee: (() => {
        const fee = trip?.fraisService || trip?.serviceFee || 500;
        return parseInt(String(fee).replace(/[^0-9]/g, '')) || 500;
      })(),
      trafficSurcharge: 0,
    }
  };

  const [tripData, setTripData] = useState(normalizedData);

  // ✅ Détection ultra-robuste et exhaustive du paiement à l'avance ou déjà réglé
  const mP_top = String(
    localTrip?.momentPaiement ||
    localTrip?.paymentTime ||
    localTrip?.moment_paiement ||
    localTrip?.payment_time ||
    localTrip?.typePaiement ||
    localTrip?.payment_method ||
    localTrip?.paiement?.methode ||
    localTrip?.payment?.method ||
    localTrip?.method ||
    localTrip?.modePaiement ||
    ''
  ).toUpperCase();

  const pS_top = String(
    localTrip?.paymentStatus ||
    localTrip?.statutPaiement ||
    localTrip?.payment_status ||
    localTrip?.statut_paiement ||
    localTrip?.paiement?.statut ||
    localTrip?.payment?.status ||
    localTrip?.payment?.statut ||
    localTrip?.payment?.state ||
    ''
  ).toUpperCase();

  const isPrepaid =
    mP_top.includes('MAINTENANT') ||
    mP_top.includes('NOW') ||
    mP_top.includes('ADVANCE') ||
    mP_top.includes('IMMEDIAT') ||
    mP_top.includes('PREPAID') ||
    mP_top.includes('AVANCE') ||
    mP_top.includes('ORANGE') ||
    mP_top.includes('MOBILE') ||
    mP_top.includes('WALLET') ||
    mP_top.includes('CARD') ||
    pS_top.includes('PAYE') ||
    pS_top.includes('PAID') ||
    pS_top.includes('SUCCESS') ||
    pS_top.includes('COMPLETED') ||
    pS_top.includes('TERMINEE') ||
    pS_top.includes('VALIDE') ||
    pS_top.includes('CONFIRME') ||
    localTrip?.paiementAvance === true ||
    localTrip?.paiement_avance === true ||
    String(localTrip?.paiementAvance).toUpperCase() === 'TRUE' ||
    String(localTrip?.paiement_avance).toUpperCase() === 'TRUE' ||
    pS_top.includes('CONFIRMEE') ||
    pS_top.includes('VALIDEE') ||
    localTrip?.paiement_avance === true ||
    localTrip?.isPaid === true ||
    localTrip?.paid === true ||
    !!localTrip?.transactionId;

  // ✅ [NOUVEAU] Forcer isPrepaid à FAUX si le moment de paiement est explicitement à la fin
  const isPaymentAtEnd = mP_top.includes('FIN') || mP_top.includes('END') || mP_top.includes('APRES');
  const finalIsPrepaid = isPrepaid && !isPaymentAtEnd;

  const [paymentStatus, setPaymentStatus] = useState(() => {
    // On ne considère payé que si c'est prépayé ou si le statut de paiement est explicitement validé
    if (finalIsPrepaid ||
      pS_top.includes('PAYE') ||
      pS_top.includes('PAID') ||
      pS_top.includes('SUCCESS') ||
      pS_top === 'VALIDEE' ||
      pS_top === 'CONFIRMEE'
    ) return 'PAYE';
    return 'EN_ATTENTE';
  });

  //  DEBUG LOGS
  useEffect(() => {
    console.group("🔍 [DEBUG] TrajetComplete - IDs & Payment");
    console.log("Role:", role);
    console.log("Trip ID (id):", localTrip?.id);
    console.log("Trip _ID (_id):", localTrip?._id);
    console.log("Reservation ID:", localTrip?.reservationId);
    console.log("Payment Method:", localTrip?.paymentMethod);
    console.log("Moment Paiement:", localTrip?.momentPaiement);
    console.log("isPrepaid:", finalIsPrepaid);
    console.log("PaymentStatus:", paymentStatus);
    console.groupEnd();
  }, [localTrip, finalIsPrepaid, paymentStatus, role]);

  // ✅ Synchroniser le statut du paiement si la prop trip change
  useEffect(() => {
    if (finalIsPrepaid ||
      pS_top.includes('PAYE') ||
      pS_top.includes('PAID') ||
      pS_top.includes('SUCCESS') ||
      pS_top === 'VALIDEE' ||
      pS_top === 'CONFIRMEE'
    ) {
      setPaymentStatus('PAYE');
    }
  }, [localTrip, finalIsPrepaid, pS_top]);


  const [waitingForDriverConfirmation, setWaitingForDriverConfirmation] = useState(false);

  const confettiContainerRef = useRef();
  const otpRefs = useRef([]);

  // ✅ Auto-reset processing state if payment is confirmed via props/sync
  useEffect(() => {
    if (paymentStatus === 'PAYE' || finalIsPrepaid) {
      setIsProcessing(false);
    }
  }, [paymentStatus, finalIsPrepaid]);

  const totalAmount = (tripData?.pricing?.base || 0) + (tripData?.pricing?.serviceFee || 0);

  // ✅ [STABILISATION] Mise à jour des données réelles
  useEffect(() => {
    const formatTime = (dateStr) => {
      if (!dateStr) return '--:--';
      try {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return '--:--';
      }
    };

    const now = new Date();
    setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));

    setTripData({
      ...normalizedData,
      startTime: formatTime(trip?.dateDebut || trip?.createdAt),
      endTime: formatTime(trip?.dateFin || now)
    });
  }, [localTrip, driver]);

  // ✅ Synchroniser localTrip si la prop change (important pour le rafraîchissement global)
  useEffect(() => {
    if (trip) setLocalTrip(trip);
  }, [trip]);

  // ✅ [NOUVEAU] Fonction de rafraîchissement manuel pour le chauffeur
  const refreshTripData = async (silent = false) => {
    const targetId = localTrip?.reservationId || localTrip?.id || trip?.reservationId || trip?.id;
    if (!targetId || isRefreshing) return;

    setIsRefreshing(true);
    const refreshToast = silent ? null : toast.loading("Actualisation des données...");

    try {
      const { data } = await tripService.details(targetId);
      if (data?.succes && data?.reservation) {
        console.log("🔄 [TrajetComplete] Trip data refreshed from server:", data.reservation);
        setLocalTrip(data.reservation);
        if (!silent) toast.success("Données actualisées", { id: refreshToast });
      } else {
        if (!silent) toast.error("Impossible de rafraîchir les données", { id: refreshToast });
      }
    } catch (error) {
      console.error("❌ [TrajetComplete] Error refreshing trip:", error);
      if (!silent) toast.error("Erreur réseau lors du rafraîchissement", { id: refreshToast });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Timer OTP
  useEffect(() => {
    if (otpTimer > 0 && selectedPayment === 'orange') {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer, selectedPayment]);

  // Confetti animation
  const createConfetti = useCallback(() => {
    if (!confettiContainerRef.current) return;

    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'absolute w-2 h-2 rounded-full animate-confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.setProperty('--x-end', `${Math.random() * 100 - 50}px`);
      confetti.style.setProperty('--y-end', `${Math.random() * 100 + 100}px`);
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;

      confettiContainerRef.current.appendChild(confetti);

      setTimeout(() => confetti.remove(), 2000);
    }
  }, []);

  // Lancer confetti au chargement et auto-redirect si déjà payé
  useEffect(() => {
    setTimeout(() => {
      createConfetti();
    }, 500);
  }, [createConfetti]);

  // ✅ Si déjà payé (Passager), on laisse 4 secondes pour voir le résumé puis on passe à la note
  const redirectTriggered = useRef(false);
  const onPaymentSuccessRef = useRef(onPaymentSuccess);

  useEffect(() => {
    onPaymentSuccessRef.current = onPaymentSuccess;
  }, [onPaymentSuccess]);

  useEffect(() => {
    if (role === 'passenger' && (paymentStatus === 'PAYE' || finalIsPrepaid) && !redirectTriggered.current) {
      console.log("⏱️ [TrajetComplete] Lancement du timer de redirection auto (4s)");
      redirectTriggered.current = true;
      const timer = setTimeout(() => {
        if (onPaymentSuccessRef.current) {
          console.log("➡️ [TrajetComplete] Redirection vers évaluation...");
          onPaymentSuccessRef.current({ status: 'PAYE', alreadyPaid: true });
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [role, paymentStatus, finalIsPrepaid]);

  // Gestion OTP
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Focus sur le champ suivant
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Vérifier si le code est complet
    if (newOtpValues.every(v => v) && newOtpValues.length === 6) {
      handlePaymentComplete();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Gestion des paiements
  const handlePaymentMethodSelect = (method) => {
    setSelectedPayment(method);
    if (method === 'orange') {
      setOtpTimer(120);
    }
  };

  // ✅ ECOUTER LES EVENEMENTS SOCKET
  useEffect(() => {
    const targetId = String(localTrip?.reservationId || localTrip?.id || localTrip?._id || '').trim();

    const handleReceptionAConfirmer = (data) => {
      const receivedId = String(data.reservationId || '').trim();
      if (receivedId === targetId && role === 'driver') {
        toast.dismiss();
        setWaitingForDriverConfirmation(true);
        // ✅ NOTIFICATION TEMPS RÉEL POUR LE CHAUFFEUR
        toast.success("💰 Le passager a validé son paiement !\nVeuillez vérifier la réception et confirmer.", {
          duration: 8000,
          position: "top-center",
          id: 'payment-received-alert'
        });

        // Petit son ou vibration si possible
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
    };

    const handleArrivalWithoutPayment = (data) => {
      console.log("📍 [TrajetComplete] Arrivée à destination signalée (En attente paiement)", data);
      const receivedId = String(data.reservationId || '').trim();
      if (receivedId === targetId || !receivedId) {
        setPaymentStatus('EN_ATTENTE');
        setIsProcessing(false);
        toast("📍 Vous êtes arrivé à destination. Veuillez procéder au paiement.", { icon: '🚕', id: 'arrival-notice' });
        refreshTripData(true);
      }
    };

    const handleFinitAvecPaiement = (data) => {
      console.log("📩 [TrajetComplete] Payment/Trip completion event RECEIVED", data);
      const receivedId = String(data.reservationId || data.tripId || data.id || data.trip?._id || '').trim();

      // Comparaison souple
      const isMatch = receivedId && (targetId.includes(receivedId) || receivedId.includes(targetId));

      if (isMatch || !receivedId || (data.status === 'success' && role === 'passenger')) {
        setPaymentStatus('PAYE');
        setIsProcessing(false);
        setWaitingForDriverConfirmation(false);
        toast.success("✅ Paiement confirmé !", { id: 'payment-status' });

        // Suggestion 3: Auto-refresh data to ensure everything is in sync
        if (data.trip || data.reservation) {
          setLocalTrip(data.trip || data.reservation);
        } else {
          refreshTripData(true);
        }

        if (role === 'passenger' && onPaymentSuccess) {
          onPaymentSuccess(data);
        }
      }
    };

    // Nouveau: Ecouter les mises à jour globales pour Suggestion 3
    const handleUpdate = (data) => {
      const receivedId = String(data.reservationId || data.id || '').trim();
      if (receivedId && (targetId.includes(receivedId) || receivedId.includes(targetId))) {
        console.log("🔄 [TrajetComplete] Auto-syncing trip data via socket");
        if (data.trip || data.reservation) setLocalTrip(data.trip || data.reservation);
        else refreshTripData(true);
      }
    };

    socketService.on('paiement:reception_a_confirmer', handleReceptionAConfirmer);
    socketService.on('course:finit_avec_paiement', handleFinitAvecPaiement);
    socketService.on('paiement:confirme', handleFinitAvecPaiement);
    socketService.on('course:arrive_destination', handleArrivalWithoutPayment);
    socketService.on('reserver:mise_a_jour', handleUpdate);

    return () => {
      socketService.off('paiement:reception_a_confirmer', handleReceptionAConfirmer);
      socketService.off('course:finit_avec_paiement', handleFinitAvecPaiement);
      socketService.off('paiement:confirme', handleFinitAvecPaiement);
      socketService.off('course:arrive_destination', handleArrivalWithoutPayment);
    };
  }, [localTrip?.id, localTrip?._id, localTrip?.reservationId, role, onPaymentSuccess]);

  const handlePaymentComplete = () => {
    const reservationId = trip?.reservationId || trip?.id;

    if (role === 'passenger') {
      setIsProcessing(true);

      const payload = {
        reservationId,
        montant: totalAmount,
        method: selectedPayment.toUpperCase() // Backend often expects uppercase
      };

      if (selectedPayment === 'cash') {
        socketService.emit('paiement:confirmer_envoi', payload);
        toast.success("Demande de confirmation envoyée au chauffeur.", { icon: '💰', id: 'payment-status' });
        // On NE met PAS isProcessing à false. Le bouton reste gris "En cours..."
        // jusqu'à ce que le chauffeur confirme (course:finit_avec_paiement)
      } else if (selectedPayment === 'orange') {
        if (!phoneNumber) {
          toast.error("Veuillez saisir votre numéro de téléphone Orange Money");
          setIsProcessing(false);
          return;
        }

        setTimeout(() => {
          socketService.emit('paiement:confirmer_envoi', payload);
          setPaymentStatus('PAYE');
          setIsProcessing(false);
          toast.success("Paiement Orange Money effectué avec succès !", { id: 'payment-status' });
        }, 2000);
      } else {
        socketService.emit('paiement:confirmer_envoi', payload);
        setTimeout(() => {
          setPaymentStatus('PAYE');
          setIsProcessing(false);
          toast.success("Paiement effectué !");
        }, 1500);
      }
    } else if (role === 'driver') {
      // Suggestion 1: Utiliser un modal maison au lieu de window.confirm
      if (!waitingForDriverConfirmation && !finalIsPrepaid) {
        setShowConfirmModal(true);
        return;
      }

      handleDriverConfirmPayment();
    }
  };

  const handleDriverConfirmPayment = () => {
    const reservationId = localTrip?.reservationId || localTrip?.id || trip?.reservationId || trip?.id;
    setShowConfirmModal(false);
    setIsProcessing(true);

    socketService.emit('paiement:confirmer_reception', {
      reservationId
    });

    // ✅ [MISE À JOUR OPTIMISTE]
    setTimeout(() => {
      setPaymentStatus('PAYE');
      setIsProcessing(false);
      setWaitingForDriverConfirmation(false);
      toast.success("Réception validée", { id: 'payment-status' });
    }, 500);
  };

  const handleReportProblem = () => {
    window.location.href = `mailto:support@takataka.com?subject=Probleme Trajet ${trip?.id}`;
  };

  const handleGoBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const handleGoHome = () => {
    navigate(role === 'driver' ? '/chauffeur' : '/passager');
  };

  const handleViewHistory = () => {
    navigate('/passager/trajets');
  };

  const handleNewBooking = () => {
    if (onBack) onBack();
    else navigate('/passager');
  };

  return {
    currentTime,
    selectedPayment,
    otpValues,
    phoneNumber,
    setPhoneNumber,
    otpTimer,
    isProcessing,
    isRefreshing,
    localTrip,
    showConfirmModal,
    setShowConfirmModal,
    tripData,
    paymentStatus,
    waitingForDriverConfirmation,
    confettiContainerRef,
    otpRefs,
    totalAmount,
    isPrepaid,
    finalIsPrepaid,
    refreshTripData,
    handleOtpChange,
    handleOtpKeyDown,
    handlePaymentMethodSelect,
    handlePaymentComplete,
    handleDriverConfirmPayment,
    handleReportProblem,
    handleGoBack,
    handleGoHome,
    handleViewHistory,
    handleNewBooking,
  };
};

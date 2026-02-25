// components/passenger/TripComplete.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Car,
  Clock,
  MapPin,
  Flag,
  User,
  Star,
  Navigation,
  Shield,
  HelpCircle,
  FileText,
  AlertTriangle,
  Smartphone,
  Wallet,
  Lock,
  RefreshCw,
  History,
  ArrowLeft,
  Home,
  ShieldCheck,
  ChevronRight,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socketService';
import toast from 'react-hot-toast';

import { useSettings } from '../../context/SettingsContext';

const TripComplete = ({
  trip,
  driver,
  onPaymentSuccess,
  onBack,
  role = 'passenger' // 'passenger' or 'driver'
}) => {
  const { settings } = useSettings();
  const platform = settings?.platform || {};
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('--:--');
  const [selectedPayment, setSelectedPayment] = useState(trip?.paymentMethod?.toLowerCase()?.includes('orange') ? 'orange' : 'cash');
  const [otpValues, setOtpValues] = useState(Array(6).fill(''));
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpTimer, setOtpTimer] = useState(120);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
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
    localTrip?.statut ||
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
    (localTrip?.paymentMethod && !localTrip?.paymentMethod.toUpperCase().includes('CASH') && !localTrip?.paymentMethod.toUpperCase().includes('ESPECES')) ||
    (localTrip?.typePaiement && !localTrip?.typePaiement.toUpperCase().includes('CASH') && !localTrip?.typePaiement.toUpperCase().includes('ESPECES')) ||
    (localTrip?.typeCourse === 'PLANIFIEE' && localTrip?.paymentMethod && !localTrip?.paymentMethod.toUpperCase().includes('CASH')) ||
    (localTrip?.momentPaiement && (String(localTrip.momentPaiement).toUpperCase().includes('AVANCE') || String(localTrip.momentPaiement).toUpperCase().includes('MAINTENANT') || String(localTrip.momentPaiement).toUpperCase().includes('PREPAID'))) ||
    localTrip?.paiementAvance === true ||
    localTrip?.isPaid === true ||
    localTrip?.paid === true ||
    !!localTrip?.transactionId ||
    localTrip?.statut?.toUpperCase() === 'COMPLETED' ||
    localTrip?.statut === 'completed';

  //  DEBUG LOGS
  useEffect(() => {
    console.group("🔍 [DEBUG] TrajetComplete - IDs & Payment");
    console.log("Role:", role);
    console.log("Trip ID (id):", localTrip?.id);
    console.log("Trip _ID (_id):", localTrip?._id);
    console.log("Reservation ID:", localTrip?.reservationId);
    console.log("Payment Method:", localTrip?.paymentMethod);
    console.log("Moment Paiement:", localTrip?.momentPaiement);
    console.log("isPrepaid:", isPrepaid);
    console.groupEnd();
  }, [localTrip, isPrepaid, role]);

  const [paymentStatus, setPaymentStatus] = useState(() => {
    // FORCE PAYE si isPrepaid est détecté (Très important pour le flux Chauffeur)
    if (isPrepaid ||
      pS_top.includes('PAYE') ||
      pS_top.includes('PAID') ||
      pS_top.includes('SUCCESS') ||
      pS_top.includes('COMPLETED') ||
      pS_top.includes('TERMINEE') ||
      pS_top.includes('VALIDE') ||
      pS_top.includes('CONFIRME') ||
      pS_top.includes('ACCEPTED')
    ) return 'PAYE';
    return 'EN_ATTENTE';
  });

  // ✅ Synchroniser le statut du paiement si la prop trip change
  useEffect(() => {
    if (isPrepaid ||
      pS_top.includes('PAYE') ||
      pS_top.includes('PAID') ||
      pS_top.includes('SUCCESS') ||
      pS_top.includes('COMPLETED') ||
      pS_top.includes('TERMINEE') ||
      pS_top.includes('VALIDE') ||
      pS_top.includes('CONFIRME') ||
      pS_top.includes('ACCEPTED')
    ) {
      setPaymentStatus('PAYE');
    }
  }, [localTrip, isPrepaid, pS_top]);


  const [waitingForDriverConfirmation, setWaitingForDriverConfirmation] = useState(false);

  const confettiContainerRef = useRef();
  const otpRefs = useRef([]);

  // ✅ Auto-reset processing state if payment is confirmed via props/sync
  useEffect(() => {
    if (paymentStatus === 'PAYE' || isPrepaid) {
      setIsProcessing(false);
    }
  }, [paymentStatus, isPrepaid]);

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
      setConfettiActive(true);
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
    if (role === 'passenger' && (paymentStatus === 'PAYE' || isPrepaid) && !redirectTriggered.current) {
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
  }, [role, paymentStatus, isPrepaid]);

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
    socketService.on('course:terminee', handleFinitAvecPaiement);
    socketService.on('reserver:mise_a_jour', handleUpdate);

    return () => {
      socketService.off('paiement:reception_a_confirmer', handleReceptionAConfirmer);
      socketService.off('course:finit_avec_paiement', handleFinitAvecPaiement);
      socketService.off('paiement:confirme', handleFinitAvecPaiement);
      socketService.off('course:terminee', handleFinitAvecPaiement);
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
      if (!waitingForDriverConfirmation && !isPrepaid) {
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

  // Composant d'étape
  const StepIndicator = ({ number, label, active, completed }) => (
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-colors ${completed ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
        {completed ? <Check className="w-4 h-4" /> : number}
      </div>
      <span className={`text-[10px] uppercase font-bold tracking-wider ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>{label}</span>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-black overflow-x-hidden">
      {/* Confetti Container */}
      <div ref={confettiContainerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden" />

      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleGoBack}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Récapitulatif de course</h1>
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
              ID: {localTrip?.id?.slice(-8) || localTrip?._id?.slice(-8) || 'TRP...'}
              {role === 'driver' && (
                <button
                  onClick={refreshTripData}
                  disabled={isRefreshing}
                  className={`ml-1 hover:text-blue-500 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </p>
          </div>
          <button
            onClick={handleGoHome}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Succès Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="relative inline-block mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl shadow-green-500/20"
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-4 bg-green-500/10 rounded-[40px] -z-10"
            />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Arrivé à destination !</h2>
          <p className="text-gray-600 dark:text-gray-400">Merci d'avoir choisi TakaTaka pour votre déplacement.</p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-8 mb-8 border border-white/20 dark:border-white/5 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Itinéraire */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                Détails du trajet
              </h3>

              <div className="relative pl-8 space-y-8">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-red-500" />

                <div className="relative">
                  <div className="absolute -left-[27px] w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-green-500 z-10" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Départ</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200 line-clamp-2">{tripData?.departure}</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[27px] w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-red-500 z-10" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Arrivée</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200 line-clamp-2">{tripData?.destination}</p>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chauffeur</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{tripData?.driver}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(tripData?.driverRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{tripData?.driverRating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Distance</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{tripData?.distance}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Durée</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{tripData?.duration}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Heure de départ</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {tripData?.startTime || '--:--'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Heure d'arrivée</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {tripData?.endTime || currentTime}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reçu détaillé */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Détails du paiement</h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Prix de base</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{(tripData?.pricing?.base || 0).toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Frais de service</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{(tripData?.pricing?.serviceFee || 0).toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Supplément trafic</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{(tripData?.pricing?.trafficSurcharge || 0).toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-gray-800 dark:text-gray-100 font-bold">Total</span>
                  <span className="text-xl font-bold text-green-700 dark:text-green-500">
                    {((tripData?.pricing?.base || 0) + (tripData?.pricing?.serviceFee || 0)).toLocaleString()} GNF
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sélection du mode de paiement - Masqué si déjà payé ou si chauffeur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-8 mb-8 border border-white/20 dark:border-white/5 shadow-2xl"
        >
          {role === 'passenger' && paymentStatus !== 'PAYE' && !isPrepaid && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Choisissez votre mode de paiement</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Espèces */}
                <button
                  onClick={() => handlePaymentMethodSelect('cash')}
                  className={`payment-option p-6 rounded-xl border-2 transition-all ${selectedPayment === 'cash' ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700'}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-4">
                      <CreditCard className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Espèces</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Paiement direct au chauffeur</p>
                  </div>
                </button>

                {/* Orange Money */}
                <button
                  onClick={() => handlePaymentMethodSelect('orange')}
                  className={`payment-option p-6 rounded-xl border-2 transition-all ${selectedPayment === 'orange' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700'}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center mb-4">
                      <Smartphone className="w-8 h-8 text-orange-600" />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Orange Money</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Paiement sécurisé via Telco</p>
                  </div>
                </button>

                {/* Portefeuille */}
                <button
                  onClick={() => handlePaymentMethodSelect('wallet')}
                  className={`payment-option p-6 rounded-xl border-2 transition-all ${selectedPayment === 'wallet' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700'}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4">
                      <Wallet className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Portefeuille</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Utilisez votre solde TakaTaka</p>
                  </div>
                </button>
              </div>

              {/* Formulaires Conditionnels */}
              <AnimatePresence mode="wait">
                {selectedPayment === 'orange' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
                          <Lock className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 dark:text-gray-100">Validation de sécurité</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Veuillez renseigner vos informations Orange Money</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Phone number input for Orange Money */}
                        <div className="mb-4 text-left">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Numéro de téléphone Orange Money</label>
                          <div className="relative">
                            <input
                              type="tel"
                              placeholder="ex: 622 00 00 00"
                              value={phoneNumber}
                              onChange={e => setPhoneNumber(e.target.value)}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 transition-all outline-none pl-12"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <Smartphone className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code OTP (reçu par SMS)</p>
                          <div className="flex justify-between gap-2">
                            {otpValues.map((value, index) => (
                              <input
                                key={index}
                                ref={el => otpRefs.current[index] = el}
                                type="text"
                                maxLength={1}
                                value={value}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                className="w-full h-14 text-center text-2xl font-bold bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 transition-all outline-none"
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Code valide pendant{' '}
                            <span className={`font-bold ${otpTimer < 30 ? 'text-red-600' : 'text-orange-600 dark:text-orange-400'}`}>
                              {otpTimer}
                            </span>{' '}
                            secondes
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedPayment === 'cash' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-6 mb-6"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100">Paiement en espèces</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Remettez le montant au chauffeur</p>
                      </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-900/30">
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Montant à payer au chauffeur</p>
                        <div className="text-4xl font-bold text-green-700 dark:text-green-500 mb-6">
                          {((tripData?.pricing?.base || 0) + (tripData?.pricing?.serviceFee || 0)).toLocaleString()} GNF
                        </div>
                        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                          <User className="w-4 h-4" />
                          <span>
                            Chauffeur: <strong className="text-gray-900 dark:text-gray-100">{tripData?.driver}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Message si déjà payé à l'avance (Passager uniquement pour éviter les doublons chauffeur) */}
          {paymentStatus === 'PAYE' && role === 'passenger' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Paiement déjà effectué</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Ce trajet a été réglé à l'avance. Merci pour votre confiance !
              </p>
            </div>
          )}

          {/* Vue spécifique Chauffeur (En attente confirmation) */}
          {role === 'driver' && paymentStatus !== 'PAYE' && !isPrepaid && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8 mb-8 text-center"
            >
              <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Paiement en cours</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {waitingForDriverConfirmation || isProcessing
                  ? "Traitement du paiement... Veuillez patienter quelques instants."
                  : "Le passager règle son trajet. Vous pouvez confirmer dès que vous recevez le montant."}
              </p>
            </motion.div>
          )}

          {/* Message Succès Chauffeur */}
          {role === 'driver' && (paymentStatus === 'PAYE' || isPrepaid) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 mb-8 text-center"
            >
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Paiement déjà réglé !</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isPrepaid
                  ? "Ce trajet a été payé d'avance par le passager via la plateforme. Votre commission a été prélevée."
                  : "Le paiement a été validé avec succès. Vous pouvez maintenant accepter de nouvelles courses."}
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleReportProblem}
              className="flex-1 bg-red-50 text-red-700 border border-red-200 py-4 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-3"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Signaler un problème</span>
            </button>

            {role === 'driver' ? (
              <button
                onClick={(paymentStatus === 'PAYE' || isPrepaid) ? onPaymentSuccess : handlePaymentComplete}
                disabled={isProcessing}
                className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-3 ${(isProcessing && paymentStatus !== 'PAYE' && !isPrepaid) ? 'opacity-40 cursor-not-allowed grayscale' : 'shadow-lg'}`}
              >
                {(isProcessing && paymentStatus !== 'PAYE' && !isPrepaid) ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>En cours...</span>
                  </>
                ) : (paymentStatus === 'PAYE' || isPrepaid) ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Terminer le trajet</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Confirmer le paiement</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={(paymentStatus === 'PAYE' || isPrepaid) ? onPaymentSuccess : handlePaymentComplete}
                disabled={isProcessing}
                className={`flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-3 ${(isProcessing && paymentStatus !== 'PAYE' && !isPrepaid) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {(isProcessing && paymentStatus !== 'PAYE' && !isPrepaid) ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Attente chauffeur...</span>
                  </>
                ) : (
                  <>
                    {(paymentStatus === 'PAYE' || isPrepaid) ? <Star className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    <span>{(paymentStatus === 'PAYE' || isPrepaid) ? 'Noter le chauffeur' : 'Confirmer mon paiement'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {/* Informations supplémentaires (PASSAGER UNIQUEMENT) */}
        {role === 'passenger' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-8 border border-white/20 dark:border-white/5"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">À faire ensuite</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Évaluation */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-100">Évaluez le trajet</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Partagez votre expérience pour aider à améliorer notre service
                </p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Historique */}
              <div
                onClick={handleViewHistory}
                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                    <History className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-100">Consultez l'historique</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Retrouvez tous vos trajets et reçus dans votre espace personnel
                </p>
                <div className="text-green-700 dark:text-green-400 font-medium hover:underline flex items-center">
                  Voir mes trajets
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              {/* Nouvelle réservation */}
              <div
                onClick={handleNewBooking}
                className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-100">Réservez à nouveau</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Planifiez votre prochain déplacement en quelques secondes
                </p>
                <div className="text-purple-700 dark:text-purple-400 font-medium hover:underline flex items-center">
                  Nouvelle réservation
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gray-900 dark:bg-black text-white py-8 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-500 mb-6">© 2024 TakaTaka. Tous droits réservés.</p>
            <div className="flex justify-center gap-6">
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                <ShieldCheck className="w-4 h-4 inline mr-2" />
                Sécurité
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                <HelpCircle className="w-4 h-4 inline mr-2" />
                Aide
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                <FileText className="w-4 h-4 inline mr-2" />
                Conditions
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Suggestion 1: Modal de confirmation personnalisé */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>

              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-4">
                Paiement non validé par le passager
              </h3>

              <p className="text-center text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Le passager n'a pas encore confirmé l'envoi du paiement sur son application.
                <br /><br />
                Confirmez-vous avoir reçu <strong>{totalAmount.toLocaleString()} GNF</strong> ?
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDriverConfirmPayment}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  Oui, j'ai reçu l'argent
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-4 rounded-2xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripComplete;
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
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TripComplete = ({ trip, driver, onPaymentSuccess, onBack }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('--:--');
  const [selectedPayment, setSelectedPayment] = useState('orange');
  const [otpValues, setOtpValues] = useState(Array(6).fill(''));
  const [otpTimer, setOtpTimer] = useState(120);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [tripData, setTripData] = useState(null);

  const confettiContainerRef = useRef();
  const otpRefs = useRef([]);

  // Données de démo ou des props
  const demoData = {
    departure: trip?.pickup || 'Mamou, Tambassa',
    destination: trip?.destination || 'Conakry, Matam',
    driver: driver?.name || 'Fela Balde',
    driverRating: driver?.rating || 4.2,
    distance: trip?.estimatedDistance || '8.0 km',
    duration: trip?.estimatedDuration || '22 min',
    startTime: '15:20',
    endTime: '',
    pricing: {
      base: trip?.estimatedPrice || '1 500 GNF',
      serviceFee: '100 GNF',
      trafficSurcharge: '0 GNF',
      total: trip?.estimatedPrice ? `${parseInt(trip.estimatedPrice) + 100} GNF` : '1 600 GNF'
    }
  };

  // Mise à jour de l'heure
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setCurrentTime(timeString);

      // Calculer l'heure de départ
      const startTime = new Date(now);
      startTime.setMinutes(startTime.getMinutes() - 22);
      const startTimeString = startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      setTripData({
        ...demoData,
        startTime: startTimeString,
        endTime: timeString
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [trip, driver]);

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

  // Lancer confetti au chargement
  useEffect(() => {
    setTimeout(() => {
      setConfettiActive(true);
      createConfetti();
    }, 500);
  }, [createConfetti]);

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

  const handlePaymentComplete = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);

      // Préparer les données de paiement
      const paymentData = {
        method: selectedPayment,
        amount: demoData.pricing.total,
        transactionId: `TXN-${Date.now()}`,
        tripId: trip?.id || 'TRIP-' + Date.now(),
        driverId: driver?.id,
        timestamp: new Date().toISOString()
      };

      // Appeler la fonction de succès
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentData);
      }
    }, 2000);
  };

  const handleReportProblem = () => {
    if (window.confirm('Signaler un problème avec ce trajet ? Un agent TakaTaka vous contactera.')) {
      console.log('Problème signalé');
    }
  };

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleGoHome = () => {
    navigate('/passenger');
  };

  const handleViewHistory = () => {
    navigate('/passenger/history');
  };

  const handleNewBooking = () => {
    navigate('/passenger/book');
  };

  // Composant d'étape
  const StepIndicator = ({ number, label, active, completed }) => (
    <div className="flex flex-col items-center">
      <div className={`
        step-indicator w-8 h-8 rounded-full flex items-center justify-center
        ${completed ? 'bg-green-500 text-white' : active ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
      `}>
        {completed ? <Check className="w-4 h-4" /> : <span>{number}</span>}
      </div>
      <span className={`text-xs mt-2 ${active ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen  bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-gray-800  dark:bg-slate-900  dark:text-slate-100 transition-colors duration-300">
      {/* Container de confetti */}

      {/* Header */}
      <nav className="glass-header shadow-sm sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center w-full mx-auto px-10 py-4">

            
            <div ref={confettiContainerRef} className="fixed inset-0 top-5 pointer-events-none z-100" />

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Taka<span className="gradient-text">Taka</span>
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Paiement du trajet</p>
              </div>
            </div>


            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-medium">{currentTime}</span>
              </div>
              <motion.button
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoHome}
                className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <Home className="w-5 h-5" />
              </motion.button>
            </div>
         
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progression */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-8 mb-4">
            <StepIndicator number={1} label="Trajet" completed={true} />
            <div className="h-1 w-16 bg-green-500" />
            <StepIndicator number={2} label="Paiement" active={true} />
            <div className="h-1 w-16 bg-gray-200 dark:bg-gray-800" />
            <StepIndicator number={3} label="Évaluation" />
          </div>
        </div>

        {/* Message de succès */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-8 mb-8 border border-white/20 dark:border-white/5"
        >
          <div className="text-center mb-8">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse" />
              <div className="relative w-full h-full bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-16 h-16 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Vous êtes arrivé à destination !
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              Votre trajet s'est déroulé avec succès. Merci d'avoir choisi TakaTaka.
            </p>

            <div className="inline-flex items-center space-x-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-6 py-3 rounded-full">
              <Star className="w-4 h-4" />
              <span>Trajet complété avec succès</span>
            </div>
          </div>
        </motion.div>

        {/* Détails du trajet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-8 mb-8 border border-white/20 dark:border-white/5"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Résumé du trajet</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Informations itinéraire */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-red-500 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Départ</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{demoData.departure}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Flag className="w-6 h-6 text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Destination</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{demoData.destination}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chauffeur</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{demoData.driver}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(demoData.driverRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{demoData.driverRating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Distance</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{demoData.distance}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Durée</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{demoData.duration}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Heure de départ</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {tripData?.startTime || demoData.startTime}
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
                  <span className="font-medium text-gray-800 dark:text-gray-200">{demoData.pricing.base}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Frais de service</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{demoData.pricing.serviceFee}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Supplément trafic</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{demoData.pricing.trafficSurcharge}</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-gray-800 dark:text-gray-100 font-bold">Total</span>
                  <span className="text-xl font-bold text-green-700 dark:text-green-500">{demoData.pricing.total}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sélection du mode de paiement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-8 mb-8 border border-white/20 dark:border-white/5"
        >
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
                  <Smartphone className="w-8 h-8 text-orange-500 dark:text-orange-400" />
                </div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Orange Money</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Paiement mobile sécurisé</p>
              </div>
            </button>

            {/* MTN Mobile Money */}
            <button
              onClick={() => handlePaymentMethodSelect('mtn')}
              className={`payment-option p-6 rounded-xl border-2 transition-all ${selectedPayment === 'mtn' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30' : 'border-gray-200 dark:border-gray-800 hover:border-yellow-300 dark:hover:border-yellow-700'}`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
                </div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">MTN Mobile Money</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Paiement via Flooz</p>
              </div>
            </button>
          </div>

          {/* Formulaire Orange Money */}
          {selectedPayment === 'orange' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-100">Paiement Orange Money</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Confirmez le paiement depuis votre téléphone</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro Orange Money
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-l-lg">
                      +224
                    </span>
                    <input
                      type="tel"
                      className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-r-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      placeholder="07 XX XX XX XX"
                      defaultValue="621 23 14 23"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Montant à payer
                  </label>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                    <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{demoData.pricing.total}</span>
                    <button
                      type="button"
                      className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium flex items-center transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualiser
                    </button>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-orange-200 dark:border-orange-900/30">
                  <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400 mr-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Un code de confirmation vous sera envoyé par SMS. Entrez-le ci-dessous.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Code de confirmation
                  </label>
                  <div className="flex gap-2">
                    {otpValues.map((value, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        value={value}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-bold border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
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
            </motion.div>
          )}

          {/* Formulaire Espèces */}
          {selectedPayment === 'cash' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
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
                  <div className="text-4xl font-bold text-green-700 dark:text-green-500 mb-6">{demoData.pricing.total}</div>
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                    <User className="w-4 h-4" />
                    <span>
                      Chauffeur: <strong className="text-gray-900 dark:text-gray-100">{demoData.driver}</strong>
                    </span>
                  </div>
                </div>
              </div>
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

            <button
              onClick={handlePaymentComplete}
              disabled={isProcessing}
              className={`flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-3 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>En cours...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Procéder au paiement</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Informations supplémentaires */}
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
      </div>

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
    </div>
  );
};

export default TripComplete;
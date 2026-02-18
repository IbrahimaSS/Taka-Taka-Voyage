// components/passager/RealTimeTracking.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { leafletIcons, ensureLeafletIcons } from '../maps/leafletIcons';
import MapController from '../maps/MapController';
import { GeolocationService } from '../../services/geolocation';
import { socketService } from '../../services/socketService';
import {
  Car,
  User,
  Phone,
  ArrowLeft,
  Clock,
  Navigation,
  MapPin,
  Shield,
  HelpCircle,
  FileText,
  Share2,
  AlertTriangle,
  Gauge,
  CheckCircle,
  Flag,
  RefreshCw,
  CreditCard,
  Smartphone,
  Battery,
  Target,
  ChevronRight,
  XCircle,
  Star,
  ShieldCheck,
  ChevronLeft,
  Bell,
  MessageCircle,
  BatteryCharging,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmergencyButton from '../passager/EmergencyButton';
import { useDriverContext } from '../../context/DriverContext';

// MapController is now imported from shared components

const RealTimeTracking = ({
  role = 'passenger',
  trip,
  driver,
  onBack,
  onEmergency,
  onContactDriver,
  onCancelTrip,
  onEndTrip,
  onShareTrip
}) => {
  // États
  const driverCtx = role === 'driver' ? useDriverContext() : null;
  const isValidCoords = (pos) => {
    if (!pos) return false;
    if (Array.isArray(pos)) {
      return pos.length === 2 && pos[0] !== null && pos[1] !== null && !isNaN(pos[0]) && !isNaN(pos[1]);
    }
    if (typeof pos === 'object') {
      return pos.lat !== null && pos.lng !== null && !isNaN(pos.lat) && !isNaN(pos.lng);
    }
    return false;
  };

  const isSimulating = driverCtx?.isSimulating || false;
  const setIsSimulating = driverCtx?.setIsSimulating || (() => { });

  const [driverPosition, setDriverPosition] = useState(
    driver?.currentLocation || driver?.location || null
  );
  const [passengerPosition] = useState(
    trip?.pickupCoords || [9.6412, -13.5784]
  );
  const [progress, setProgress] = useState(0);
  const [isTripStarted, setIsTripStarted] = useState(true);
  const [isTripEnded, setIsTripEnded] = useState(false);
  const [speed, setSpeed] = useState(42);
  const [currentTime, setCurrentTime] = useState('--:--');
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [connectionStatus, setConnectionStatus] = useState('excellent');
  const [estimatedArrival, setEstimatedArrival] = useState('14:45');

  // Références
  const mapRef = useRef();
  const progressInterval = useRef();
  const timeInterval = useRef();
  const driverStartPositionRef = useRef(null); // Position du chauffeur au démarrage du suivi

  // Données calculées à partir des props
  const tripData = {
    departure: {
      coords: trip?.pickupCoords || [9.6412, -13.5784],
      name: trip?.pickup || trip?.depart || trip?.pickupAddress || 'Point de départ',
      address: trip?.pickup || trip?.depart || trip?.pickupAddress || ''
    },
    destination: {
      coords: trip?.destinationCoords || [9.6412, -13.5784],
      name: trip?.destination || trip?.destinationAddress || 'Destination',
      address: trip?.destination || trip?.destinationAddress || ''
    },
    driver: driver || {
      id: 1,
      name: "Mamadou Diallo",
      phone: "+224 623 09 02 24",
      rating: 4.8,
      totalTrips: 1247,
      experience: '3 ans',
      vehicle: {
        brand: "Toyota",
        model: "Corolla",
        plate: "AB-123-CD",
        color: "Blanc",
        type: trip?.vehicleType || 'taxi',
        year: 2022,
        capacity: 4
      }
    },
    trip: {
      totalDistance: (() => {
        const val = trip?.estimatedDistance || trip?.distanceKm || trip?.distance;
        if (typeof val === 'number') return val;
        return parseFloat(String(val || '').replace(' km', '')) || 8.0;
      })(),
      traveledDistance: 0,
      totalDuration: (() => {
        const val = trip?.estimatedDuration || trip?.dureeMin || trip?.estimatedTime;
        if (typeof val === 'number') return val;
        return parseInt(String(val || '').replace(' min', '')) || 20;
      })(),
      elapsedMinutes: 0,
      remainingMinutes: (() => {
        const val = trip?.estimatedDuration || trip?.dureeMin || trip?.estimatedTime;
        if (typeof val === 'number') return val;
        return parseInt(String(val || '').replace(' min', '')) || 20;
      })(),
      price: {
        // Safe price formatting
        estimated: (() => {
          const priceRaw = trip?.estimatedPrice || trip?.estimatedFare || trip?.prix || trip?.price || '0';
          const price = String(priceRaw).replace(/[^0-9]/g, '');
          return parseInt(price || 0);
        })() || 15000,
        serviceFee: 1000,
        trafficSurcharge: 0,
        total: (() => {
          const priceRaw = trip?.estimatedPrice || trip?.estimatedFare || trip?.prix || trip?.price || '0';
          const price = String(priceRaw).replace(/[^0-9]/g, '');
          return (parseInt(price || 0) || 15000) + 1000;
        })()
      },
      paymentMethod: (trip?.paymentMethod && trip.paymentMethod !== 'Non spécifié') ? trip.paymentMethod : null
    }
  };

  // Mise à jour de l'heure
  const updateTime = useCallback(() => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setCurrentTime(timeString);
  }, []);


  // Fonction pour afficher des notifications
  const showToast = (message, type = 'info') => {
    setNotification({ message, type });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Gestionnaire d'urgence
  // const handleEmergency = () => {
  //   if (window.confirm('🚨 Envoyer un signal d\'urgence ?\nVotre position sera partagée avec les autorités et le support TakaTaka.')) {
  //     const emergencyData = {
  //       position: passengerPosition,
  //       driver: driverPosition,
  //       time: new Date().toISOString(),
  //       tripId: trip?.id || 'TRIP-' + Date.now(),
  //       passengerInfo: {
  //         name: trip?.passengerName || 'Passager',
  //         phone: trip?.passengerPhone || '+224 XXX XX XX XX'
  //       }
  //     };

  //     console.log('Emergency signal sent:', emergencyData);
  //     showToast('🚨 Signal d\'urgence envoyé ! Aide en route.', 'danger');
  //     if (onEmergency) onEmergency(emergencyData);
  //   }
  // };

  // Gestionnaire de contact
  const handleContactDriver = () => {
    if (tripData.driver?.phone) {
      window.open(`tel:${tripData.driver.phone}`);
      showToast(`📞 Appel du chauffeur ${tripData.driver.name}...`, 'info');
    }
    if (onContactDriver) onContactDriver(tripData.driver.phone);
  };

  // Gestionnaire d'annulation
  const handleCancelTrip = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce trajet ?\nDes frais d\'annulation peuvent s\'appliquer.')) {
      clearInterval(progressInterval.current);

      setIsTripEnded(true);
      showToast('Trajet annulé. Un remboursement sera traité.', 'warning');

      if (onCancelTrip) onCancelTrip();
    }
  };

  // Gestionnaire de fin de trajet
  const handleEndTrip = () => {
    if (progress >= 95 || isTripEnded) {
      clearInterval(progressInterval.current);
      setIsTripEnded(true);
      showToast('✅ Trajet terminé avec succès!', 'success');
      if (onEndTrip) onEndTrip();
    } else {
      showToast('Vous n\'êtes pas encore arrivé à destination.', 'warning');
    }
  };

  // Gestionnaire de partage
  const handleShareTrip = async () => {
    const shareData = {
      title: 'Mon trajet TakaTaka',
      text: `🚗 Je suis en trajet de ${tripData.departure.name} à ${tripData.destination.name}. Arrivée prévue à ${estimatedArrival}. Suivez mon trajet en direct !`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Trajet partagé avec succès!', 'success');
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      showToast('📋 Lien copié dans le presse-papier!', 'info');
    }

    if (onShareTrip) onShareTrip(shareData);
  };



  // Effets
  useEffect(() => {
    ensureLeafletIcons();
    // Initialisation de l'heure
    updateTime();
    timeInterval.current = setInterval(updateTime, 60000);

    // Simulation de la batterie
    const batteryInterval = setInterval(() => {
      setBatteryLevel(prev => {
        const newLevel = prev - 0.5;
        if (newLevel <= 20) {
          showToast('🔋 Batterie faible !', 'warning');
        }
        return newLevel > 0 ? newLevel : 0;
      });
    }, 30000);

    // Initialisation de la room socket
    const rid = trip?.reservationId || trip?.id;
    if (rid) {
      console.log(`📡 [SOCKET] Tentative de connexion à la room RESERVATION_${rid}`);
      socketService.emit('reservation:join', { reservationId: rid });
    }

    return () => {
      clearInterval(timeInterval.current);
      clearInterval(batteryInterval);
    };
  }, [updateTime, trip?.reservationId, trip?.id]);

  // ✅ FIX: Mettre à jour la position locale quand le prop driver change (socket)
  useEffect(() => {
    if (driver?.location || driver?.currentLocation) {
      setDriverPosition(driver.location || driver.currentLocation);
    }
  }, [driver]);

  // ✅ FIX: Écouter les mises à jour de position via Socket (pour le chauffeur en mode simulation/test)
  useEffect(() => {
    const onPositionUpdate = (data) => {
      if (data && data.lat && data.lng) {
        setDriverPosition({ lat: data.lat, lng: data.lng });
      }
    };

    // Si on est le chauffeur, on veut aussi voir ce que le serveur diffuse (utile pour les simulations ou si le GPS local est bloqué)
    if (role === 'driver' || role === 'passenger') {
      socketService.on('position:chauffeur', onPositionUpdate);
    }

    return () => {
      socketService.off('position:chauffeur', onPositionUpdate);
    };
  }, [role]);

  // ✅ FIX: Auto-zoom pour tout voir (Chauffeur + Départ + Arrivée)
  useEffect(() => {
    if (mapRef.current && driverPosition && tripData.departure.coords) {
      const bounds = L.latLngBounds([
        driverPosition,
        tripData.departure.coords,
        tripData.destination.coords
      ]);

      mapRef.current.flyToBounds(bounds, {
        padding: [50, 50],
        animate: true,
        duration: 2
      });
    }
  }, [driverPosition, tripData.departure.coords, tripData.destination.coords]);

  // ✅ CALCUL DYNAMIQUE DU PROGRÈS
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    distanceTraveled: 0,
    distanceRemaining: tripData.trip.totalDistance,
    progress: 0,
    durationRemaining: tripData.trip.totalDuration
  });

  useEffect(() => {
    if (tripData?.destination?.coords && tripData?.departure?.coords && driverPosition) {

      // Helpers pour sécuriser les coords
      const getLat = (pos) => parseFloat(pos?.lat || pos?.[0]);
      const getLng = (pos) => parseFloat(pos?.lng || pos?.[1]);

      const driverLat = getLat(driverPosition);
      const driverLng = getLng(driverPosition);
      const destLat = getLat(tripData.destination.coords);
      const destLng = getLng(tripData.destination.coords);
      const depLat = getLat(tripData.departure.coords);
      const depLng = getLng(tripData.departure.coords);

      // On ignore le point de départ théorique s'il est utilisé comme simple placeholder au début.
      const isPlaceholder = depLat === driverLat && depLng === driverLng;

      // ✅ FIX: Initialiser la position de départ (référence 0%) dès que possible
      if (!driverStartPositionRef.current) {
        // Idéalement on utilise la position réelle du chauffeur au moment du START,
        // sinon on fallback sur le point de départ théorique du trajet.
        if (driverPosition && !isPlaceholder) {
          driverStartPositionRef.current = { lat: driverLat, lng: driverLng };
        } else {
          driverStartPositionRef.current = { lat: depLat, lng: depLng };
        }
      }

      const startLat = driverStartPositionRef.current.lat;
      const startLng = driverStartPositionRef.current.lng;

      // 1. Distance totale du trajet = position initiale du chauffeur → destination
      const distTotal = GeolocationService.calculateDistance(startLat, startLng, destLat, destLng) || Math.max(0.1, tripData.trip.totalDistance);

      // 2. Distance restante = position actuelle du chauffeur → destination
      const distRemaining = GeolocationService.calculateDistance(driverLat, driverLng, destLat, destLng);

      // 3. Distance parcourue = Total - Restant (bornée à 0 minimum)
      let distTraveled = Math.max(0, distTotal - distRemaining);

      // 4. Pourcentage — borné entre 0% et 100%
      let pct = (distTraveled / distTotal) * 100;

      // ✅ [FIX] Si on est à moins de 200m de la destination, on considère que c'est 100%
      // pour éviter les sauts GPS qui bloquent à 99%
      if (distRemaining < 0.2) {
        pct = 100;
      }

      pct = Math.min(100, Math.max(0, pct));

      // 5. Temps restant — Règle de 3 sur la durée initiale estimée
      const timeRemaining = Math.max(1, Math.round((distRemaining / distTotal) * tripData.trip.totalDuration));

      // 5b. Format lisible
      const formattedDuration = timeRemaining >= 60
        ? `${Math.floor(timeRemaining / 60)}h ${timeRemaining % 60} min`
        : `${timeRemaining} min`;

      // 6. Mise à jour de l'ETA
      const now = new Date();
      now.setMinutes(now.getMinutes() + timeRemaining);
      const newEta = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      setRealTimeMetrics({
        distanceTraveled: parseFloat(distTraveled.toFixed(1)),
        distanceRemaining: parseFloat(distRemaining.toFixed(1)),
        progress: Math.round(pct),
        durationRemaining: timeRemaining,
        formattedDuration
      });
      setProgress(Math.round(pct)); // Sync avec l'état existant pour la barre
      setEstimatedArrival(newEta);   // Sync avec l'état existant pour l'ETA
    }
  }, [driverPosition, tripData.destination.coords, tripData.departure.coords, tripData.trip.totalDistance, tripData.trip.totalDuration]);

  // ✅ AUTO-TERMINER : Si progress === 100%, on finit automatiquement
  useEffect(() => {
    if (progress >= 100 && !isTripEnded) {
      console.log("🏁 Destination atteinte à 100%. Fin de trajet automatique...");

      // On émet l'événement socket pour le backend
      socketService.emit('course:terminer_auto', { reservationId: trip?.id });

      setIsTripEnded(true);
      showToast('🏁 Destination atteinte ! Trajet terminé.', 'success');

      // Appel du callback si présent
      if (onEndTrip) onEndTrip();
    }
  }, [progress, isTripEnded, role, trip?.id, onEndTrip]);

  // ✅ ÉCOUTER LA FIN DE TRAJET (Pour le passager ou side-effect)
  useEffect(() => {
    const handleTripFinished = (data) => {
      const rid = trip?.reservationId || trip?.id;
      if (String(data.reservationId) === String(rid)) {
        setIsTripEnded(true);
        showToast('🏁 Le trajet est terminé !', 'success');
        if (onEndTrip) onEndTrip();
      }
    };

    socketService.on('course:finit_avec_paiement', handleTripFinished);
    socketService.on('course:arrive_destination', handleTripFinished);

    return () => {
      socketService.off('course:finit_avec_paiement', handleTripFinished);
      socketService.off('course:arrive_destination', handleTripFinished);
    };
  }, [trip?.reservationId, trip?.id, onEndTrip]);

  // Styles de notification
  const notificationStyles = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  const notificationIcons = {
    info: <Bell className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    danger: <AlertTriangle className="w-5 h-5" />
  };

  // Si aucun trajet n'est fourni, afficher un message
  if (!trip) {
    return (
      <div className="min-h-screen mt-4  bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucun trajet en cours</h2>
          <p className="text-gray-600 mb-6">Commencez un nouveau trajet pour utiliser le suivi en temps réel</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-medium hover:opacity-90"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100  bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-800  dark:bg-slate-900  dark:text-slate-100 font-poppins transition-colors duration-300">
      {/* Header */}
      <nav className="glass-header container shadow-sm sticky w-[100%] mx-auto px-4 py-4 top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">

            <div>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Suivi en direct
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Trajet vers {tripData.destination.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium">{currentTime}</span>
            </div>
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* En-tête du trajet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-6 mb-6 border border-white/20 dark:border-white/5"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {isTripEnded ? 'Trajet terminé' : (trip?.status === 'approaching' ? 'Chauffeur en approche' : 'Trajet en cours')}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                  <span className="text-sm">{tripData.departure.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                  <span className="text-sm">{tripData.destination.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-full flex items-center ${isTripEnded ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isTripEnded ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                <span className="font-medium">{isTripEnded ? 'Terminé' : 'En cours'}</span>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Arrivée estimée</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-500">{estimatedArrival}</p>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 dark:text-gray-300">Progression du trajet</span>
              <span className="font-bold text-green-700 dark:text-green-400">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span>{realTimeMetrics.distanceTraveled} km parcourus</span>
              <span>{realTimeMetrics.distanceRemaining} km restants</span>
            </div>
          </div>

          {/* Cartes d'information rapide */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ y: -4 }}
              className="passenger-card dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role === 'driver' ? 'Passager Principal' : 'Chauffeur'}
                  </p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">
                    {role === 'driver' ? (trip?.passengerName || 'Passager') : tripData.driver.name}
                  </p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(tripData.driver.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                      />
                    ))}
                    <span className="text-xs text-gray-600 dark:text-gray-500 ml-1">{tripData.driver.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="passenger-card dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Véhicule</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">
                    {tripData.driver.vehicle.brand} {tripData.driver.vehicle.model}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-500">{tripData.driver.vehicle.plate}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="passenger-card dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vitesse</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">{speed} km/h</p>
                  <p className="text-xs text-gray-600 dark:text-gray-500">{speed > 50 ? 'Rapide' : 'Modérée'}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="passenger-card dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Temps restant</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">{realTimeMetrics.formattedDuration || '-- min'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-500">Arrivée: {estimatedArrival}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Carte et Informations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-6 border border-white/20 dark:border-white/5"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Position en temps réel</h3>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => mapRef.current && mapRef.current.invalidateSize()}
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                  </motion.button>

                  {role === 'driver' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsSimulating(!isSimulating)}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border-2 transition-all font-bold text-xs ${isSimulating
                        ? 'bg-amber-500 border-amber-600 text-white animate-pulse'
                        : 'bg-white dark:bg-gray-800 border-emerald-500 text-emerald-600'
                        }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isSimulating ? 'animate-spin' : ''}`} />
                      {isSimulating ? 'SIMULATION ACTIVE' : 'SIMULER MOUVEMENT'}
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="h-[400px] rounded-xl overflow-hidden shadow-lg border border-gray-100">
                <MapContainer
                  center={isValidCoords(driverPosition) ? driverPosition : (isValidCoords(passengerPosition) ? passengerPosition : [0, 0])}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                  className="rounded-xl"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Marqueurs avec Halo pour visibilité "GROS" */}
                  {isValidCoords(tripData.departure.coords) && (
                    <>
                      <Circle
                        center={tripData.departure.coords}
                        radius={30}
                        pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.4, weight: 2 }}
                      />
                      <Marker position={tripData.departure.coords} icon={leafletIcons.start}>
                        <Popup>
                          <div className="p-2">
                            <p className="font-bold text-green-600">📍 Départ</p>
                            <p className="text-sm">{tripData.departure.name}</p>
                          </div>
                        </Popup>
                      </Marker>
                    </>
                  )}

                  {isValidCoords(tripData.destination.coords) && (
                    <>
                      <Circle
                        center={tripData.destination.coords}
                        radius={30}
                        pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.4, weight: 2 }}
                      />
                      <Marker position={tripData.destination.coords} icon={leafletIcons.end}>
                        <Popup>
                          <div className="p-2">
                            <p className="font-bold text-red-600">🏁 Destination</p>
                            <p className="text-sm">{tripData.destination.name}</p>
                          </div>
                        </Popup>
                      </Marker>
                      <Circle
                        center={tripData.destination.coords}
                        radius={200}
                        pathOptions={{ color: '#dc2626', fillColor: '#fecaca', fillOpacity: 0.2 }}
                      />
                    </>
                  )}

                  {isValidCoords(driverPosition) && (
                    <Marker position={driverPosition} icon={leafletIcons.driver}>
                      <Popup>
                        <div className="p-2">
                          <p className="font-bold">{tripData.driver.name}</p>
                          <p className="text-sm">{tripData.driver.vehicle.brand} {tripData.driver.vehicle.model}</p>
                          <p className="text-sm">⭐ {tripData.driver.rating} ({tripData.driver.totalTrips} trajets)</p>
                          <p className="text-xs text-gray-500">{tripData.driver.vehicle.plate} • {tripData.driver.vehicle.color}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {isValidCoords(passengerPosition) && (
                    <Marker position={passengerPosition} icon={leafletIcons.user}>
                      <Popup>
                        <div className="p-2">
                          <p className="font-bold text-blue-600">👤 {role === 'driver' ? `Passager: ${trip?.passengerName}` : 'Votre position'}</p>
                          <p className="text-sm">En attente du chauffeur</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Trajet Driver -> Passenger (Approche) */}
                  {isValidCoords(driverPosition) && isValidCoords(tripData.departure.coords) && (
                    <Polyline
                      positions={[driverPosition, tripData.departure.coords]}
                      pathOptions={{ color: '#22c55e', weight: 6, opacity: 0.9, dashArray: '15, 15', lineCap: 'round', lineJoin: 'round' }}
                    />
                  )}

                  {/* Trajet Passenger -> Destination (Future Course) */}
                  {isValidCoords(tripData.departure.coords) && isValidCoords(tripData.destination.coords) && (
                    <Polyline
                      positions={[tripData.departure.coords, tripData.destination.coords]}
                      pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.4 }}
                    />
                  )}
                </MapContainer>
              </div>

              {/* Légende */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Position du chauffeur</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {role === 'driver' ? 'Position du passager' : 'Votre position'}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-600 dark:to-green-700 rounded-full mr-2 border border-green-200 dark:border-green-800"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Point de départ</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Destination</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-6">
            {/* Carte ETA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg"
            >
              <div className="text-sm opacity-90 mb-1">ARRIVÉE ESTIMÉE</div>
              <div className="text-3xl font-bold mb-2">{estimatedArrival}</div>
              <div className="text-sm opacity-90">
                Dans <span className="font-bold">{realTimeMetrics?.formattedDuration || '-- min'}</span>
              </div>
              <div className="flex items-center mt-4 text-xs opacity-80">
                <Navigation className="w-3 h-3 mr-1" />
                <span>{tripData.trip.totalDistance} km • {tripData.trip.totalDuration} min</span>
              </div>
            </motion.div>

            {/* Actions rapides */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-6 border border-white/20 dark:border-white/5"
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContactDriver}
                  className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-3"
                >
                  <Phone className="w-5 h-5" />
                  <span>{role === 'driver' ? 'Appeler le passager' : 'Appeler le chauffeur'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShareTrip}
                  className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-3"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Partager le trajet</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEndTrip}
                  disabled={isTripEnded}
                  className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-3 ${isTripEnded ? 'bg-green-600' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'} text-white disabled:opacity-50`}
                >
                  <Flag className="w-5 h-5" />
                  <span>{isTripEnded ? 'Trajet terminé' : "J'arrive à destination"}</span>
                </motion.button>


              </div>
            </motion.div>

            {/* Détails du paiement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-6 border border-white/20 dark:border-white/5"
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Détails du paiement</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Prix estimé</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{tripData.trip.price.estimated.toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Frais de service</span>
                  <span className="font-bold text-green-600 dark:text-green-400">+ {tripData.trip.price.serviceFee.toLocaleString()} GNF</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800 dark:text-gray-100">Total</span>
                    <span className="text-2xl font-bold text-green-700 dark:text-green-500">
                      {tripData.trip.price.total.toLocaleString()} GNF
                    </span>
                  </div>
                </div>
              </div>
              {tripData.trip.paymentMethod && (
                <div className="mt-4 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-orange-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{tripData.trip.paymentMethod}</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 ${notificationStyles[notification.type]} text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm`}
          >
            <div className="flex items-center space-x-3">
              {notificationIcons[notification.type]}
              <p className="font-medium">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton d'urgence */}
      {/* <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleEmergency}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-2xl flex items-center justify-center animate-pulse"
        title="Signal d'urgence"
      >
        <AlertTriangle className="w-7 h-7 text-white" />
      </motion.button> */}

      <EmergencyButton />

      {/* Bouton d'annulation */}
    </div>
  );
};

// Valeurs par défaut pour les props
RealTimeTracking.defaultProps = {
  trip: null,
  driver: null,
  onBack: () => console.log('Retour'),
  onEmergency: (data) => console.log('Urgence:', data),
  onContactDriver: (phone) => console.log('Contacter:', phone),
  onCancelTrip: () => console.log('Annuler trajet'),
  onEndTrip: () => console.log('Terminer trajet'),
  onShareTrip: (data) => console.log('Partager:', data)
};

export default RealTimeTracking;
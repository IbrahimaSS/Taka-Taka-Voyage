// components/passager/RealTimeTracking.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { leafletIcons, ensureLeafletIcons } from '../maps/leafletIcons';
import MapController from '../maps/MapController';
import { GeolocationService } from '../../services/geolocation';
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
  const [driverPosition, setDriverPosition] = useState(
    driver?.currentLocation || driver?.location || [9.6412, -13.5784]
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
  const tripSimulationInterval = useRef();

  // Données calculées à partir des props
  const tripData = {
    departure: {
      coords: trip?.pickupCoords || [9.6412, -13.5784],
      name: trip?.pickup || 'Point de départ',
      address: trip?.pickup || ''
    },
    destination: {
      coords: trip?.destinationCoords || [9.6412, -13.5784],
      name: trip?.destination || 'Destination',
      address: trip?.destination || ''
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
      totalDistance: parseFloat(trip?.estimatedDistance?.replace(' km', '')) || 8.0,
      traveledDistance: 0,
      totalDuration: parseInt(trip?.estimatedDuration?.replace(' min', '')) || 20,
      elapsedMinutes: 0,
      remainingMinutes: parseInt(trip?.estimatedDuration?.replace(' min', '')) || 20,
      price: {
        estimated: parseInt(trip?.estimatedPrice?.replace(/\D/g, '')) || 15000,
        serviceFee: 1000,
        trafficSurcharge: 0,
        total: (parseInt(trip?.estimatedPrice?.replace(/\D/g, '')) || 15000) + 1000
      },
      paymentMethod: trip?.paymentMethod || 'Orange Money'
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
      clearInterval(tripSimulationInterval.current);
      clearInterval(progressInterval.current);

      setIsTripEnded(true);
      showToast('Trajet annulé. Un remboursement sera traité.', 'warning');

      if (onCancelTrip) onCancelTrip();
    }
  };

  // Gestionnaire de fin de trajet
  const handleEndTrip = () => {
    if (progress >= 95 || isTripEnded) {
      clearInterval(tripSimulationInterval.current);
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


  // Les icônes sont maintenant centralisées dans leafletIcons.js

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

    return () => {
      clearInterval(timeInterval.current);
      clearInterval(batteryInterval);
    };
  }, [updateTime]);

  // Centrer la carte sur le chauffeur lors des mises à jour réelles
  useEffect(() => {
    if (mapRef.current && driverPosition) {
      mapRef.current.setView(driverPosition, mapRef.current.getZoom(), {
        animate: true,
        duration: 1
      });
    }
  }, [driverPosition]);

  // Calcul de l'ETA
  const calculateETA = () => {
    return estimatedArrival;
  };

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
                {isTripEnded ? 'Trajet terminé' : 'Trajet en cours'}
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
                <p className="text-xl font-bold text-green-700 dark:text-green-500">{calculateETA()}</p>
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
              <span>{tripData.trip.traveledDistance} km parcourus</span>
              <span>{(tripData.trip.totalDistance - tripData.trip.traveledDistance).toFixed(1)} km restants</span>
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
                  <p className="font-bold text-gray-800 dark:text-gray-100">{tripData.trip.remainingMinutes} min</p>
                  <p className="text-xs text-gray-600 dark:text-gray-500">Arrivée: {calculateETA()}</p>
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
                  <button
                    onClick={handleResetTrip}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Réinitialiser démo
                  </button>
                </div>
              </div>

              <div className="h-[400px] rounded-xl overflow-hidden shadow-lg border border-gray-100">
                <MapContainer
                  center={driverPosition}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                  className="rounded-xl"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapController center={driverPosition} zoom={15} />

                  {/* Marqueurs */}
                  <Marker position={tripData.departure.coords} icon={leafletIcons.start}>
                    <Popup>
                      <div className="p-2">
                        <p className="font-bold text-green-600">📍 Départ</p>
                        <p className="text-sm">{tripData.departure.name}</p>
                        <p className="text-xs text-gray-500">{tripData.departure.address}</p>
                      </div>
                    </Popup>
                  </Marker>

                  <Marker position={tripData.destination.coords} icon={leafletIcons.end}>
                    <Popup>
                      <div className="p-2">
                        <p className="font-bold text-red-600">🏁 Destination</p>
                        <p className="text-sm">{tripData.destination.name}</p>
                        <p className="text-xs text-gray-500">{tripData.destination.address}</p>
                      </div>
                    </Popup>
                  </Marker>

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

                  <Marker position={passengerPosition} icon={leafletIcons.user}>
                    <Popup>
                      <div className="p-2">
                        <p className="font-bold text-blue-600">👤 {role === 'driver' ? `Passager: ${trip?.passengerName}` : 'Votre position'}</p>
                        <p className="text-sm">En attente du chauffeur</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Trajet */}
                  <Polyline
                    positions={[tripData.departure.coords, driverPosition]}
                    pathOptions={{ color: '#22c55e', weight: 4, opacity: 0.7 }}
                  />

                  {/* Trajet restant */}
                  <Polyline
                    positions={[driverPosition, tripData.destination.coords]}
                    pathOptions={{ color: '#94a3b8', weight: 3, opacity: 0.5, dashArray: '10, 10' }}
                  />

                  {/* Zone d'arrivée */}
                  <Circle
                    center={tripData.destination.coords}
                    radius={200}
                    pathOptions={{ color: '#dc2626', fillColor: '#fecaca', fillOpacity: 0.2 }}
                  />
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
              <div className="text-3xl font-bold mb-2">{calculateETA()}</div>
              <div className="text-sm opacity-90">
                Dans <span className="font-bold">{tripData.trip.remainingMinutes} minutes</span>
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
              <div className="mt-4 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-orange-500 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{tripData.trip.paymentMethod}</span>
              </div>
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
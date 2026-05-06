// src/components/passager/BookingSection.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, Car, Search, Check,
  Phone, Calendar, Download, Eye, History,
  Loader, Star, Users, Fuel, Gauge, Shield,
  Crown, Truck, Bus, Sparkles, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent, Polyline } from 'react-leaflet';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';

// Composants UI réutilisables
import Button from '../admin/ui/Bttn';
import Card, { CardHeader, CardTitle, CardContent } from '../admin/ui/Card';
import Table, { TableRow, TableCell } from '../admin/ui/Table';
import Badge from '../admin/ui/Badge';
import Progress from '../admin/ui/Progress';
import Modal from '../admin/ui/Modal';

// Services & utils
import { GeolocationService } from '../../services/geolocation';
import { leafletIcons, ensureLeafletIcons } from '../maps/leafletIcons';
import MapController from '../maps/MapController';
import { locationService } from '../../services/locationService';
import { getFullAssetURL } from '../../utils/urlHelper';
import ReservationLocationModal from '../home/ReservationLocationModal';

// Gestionnaire d'événements carte
function MapEvents({ onPickupSelect, onDestinationSelect, selectionMode }) {
  const { t } = useTranslation();
  useMapEvent({
    click(e) {
      if (selectionMode === 'pickup') {
        onPickupSelect(e.latlng);
        toast.success(t('booking.pickup_selected'));
      } else if (selectionMode === 'destination') {
        onDestinationSelect(e.latlng);
        toast.success(t('booking.destination_selected'));
      }
    }
  });
  return null;
}

import { tripService } from '../../services/tripService';
import { platformService } from '../../services/platformService';

// Helper pour éviter les crashs Leaflet (Invalid LatLng)
const isValidLatLng = (loc) => {
  return Array.isArray(loc) && loc.length >= 2 && loc[0] != null && loc[1] != null && !isNaN(loc[0]) && !isNaN(loc[1]);
};

/* ─── CATÉGORIES FLOTTE ─── */
const flotteCategories = [
  { id: 'TOUS', label: 'Tous', icon: Sparkles },
  { id: 'VIP', label: 'VIP', icon: Crown },
  { id: 'SUV', label: 'SUV', icon: Car },
  { id: 'BERLINE', label: 'Berline', icon: Car },
  { id: 'ÉCONOMIQUE', label: 'Économique', icon: Gauge },
  { id: 'PICK-UP 4X4', label: '4x4', icon: Truck },
  { id: 'BUS', label: 'Bus', icon: Bus },
];

const categoryStyles = {
  VIP: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  SUV: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  BERLINE: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
  ÉCONOMIQUE: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  BUS: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
};

const formatPrix = (prix) => new Intl.NumberFormat('fr-GN').format(prix || 0);

const BookingSection = ({
  onBookTrip,
  currentTrip,
  currentDriver,
  tripStatus,
  isOnMapView,
  onShowTracking
}) => {
  const { t } = useTranslation();

  // ─── MODE DE SERVICE : 'vtc' ou 'location' ───
  const [serviceMode, setServiceMode] = useState('vtc');

  // ─── ÉTATS LOCATION ───
  const [vehiculesFlotte, setVehiculesFlotte] = useState([]);
  const [loadingFlotte, setLoadingFlotte] = useState(false);
  const [activeFlotteCategory, setActiveFlotteCategory] = useState('TOUS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState(null);

  // Charger la flotte quand on passe en mode location
  useEffect(() => {
    if (serviceMode === 'location' && vehiculesFlotte.length === 0) {
      setLoadingFlotte(true);
      locationService.getVehiculesPublics()
        .then(res => {
          if (res.donnees) {
            const enriched = res.donnees.map(v => ({
              ...v,
              note: v.note || (4.5 + Math.random() * 0.5).toFixed(1)
            }));
            setVehiculesFlotte(enriched);
          }
        })
        .catch(err => console.error('Erreur chargement flotte:', err))
        .finally(() => setLoadingFlotte(false));
    }
  }, [serviceMode]);

  const vehiculesFiltres = activeFlotteCategory === 'TOUS'
    ? vehiculesFlotte
    : vehiculesFlotte.filter(v => v.categorie === activeFlotteCategory);

  const handleReserverVehicule = (vehicule) => {
    setSelectedVehicule(vehicule);
    setIsModalOpen(true);
  };

  const [formData, setFormData] = useState({
    pickup: '',
    destination: '',
    vehicleType: 'taxi',
  });
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectionMode, setSelectionMode] = useState(null);
  const [mapCenter, setMapCenter] = useState([9.6412, -13.5784]); // Conakry
  const [isLoading, setIsLoading] = useState({
    geolocation: false,
    pickup: false,
    destination: false,
    search: false,
    submit: false
  });
  const [suggestions, setSuggestions] = useState({
    pickup: [],
    destination: []
  });
  const [hasLocationPermission, setHasLocationPermission] = useState(true);
  const [showTripHistory, setShowTripHistory] = useState(false);
  const mapRef = useRef();
  const searchTimeoutRef = useRef();

  // ── Tarifs dynamiques depuis l'admin ──
  const [dynamicRates, setDynamicRates] = useState(null);

  useEffect(() => {
    platformService.getServicesActifs()
      .then((res) => {
        if (res.data?.success && res.data.services) {
          const ratesMap = {};
          res.data.services.forEach((svc) => {
            if (svc.enabled) {
              ratesMap[svc.frontendKey] = {
                perKm: svc.pricing.perKm,
                min: svc.pricing.minimumFare,
                basePrice: svc.pricing.basePrice,
                perMinute: svc.pricing.perMinute,
              };
            }
          });
          setDynamicRates(ratesMap);
        }
      })
      .catch((err) => console.error('Erreur chargement tarifs:', err));
  }, []);

  // État pour les trajets récents (Données réelles)
  const [recentTrips, setRecentTrips] = useState([]);

  useEffect(() => {
    const fetchRecentTrips = async () => {
      try {
        const response = await tripService.getPassengerHistory({ page: 1, limit: 3 });
        if (response.data.succes) {
          const formattedTrips = response.data.trajets.map(trip => {
            const dateObj = new Date(trip.dateFin || trip.createdAt);
            return {
              id: trip._id,
              date: dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
              time: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              departure: trip.depart,
              destination: trip.destination,
              price: `${trip.prix.toLocaleString()} GNF`,
              status: trip.statut === 'TERMINEE' ? 'completed' : 'cancelled'
            };
          });
          setRecentTrips(formattedTrips);
        }
      } catch (error) {
        console.error("Erreur chargement trajets récents", error);
      }
    };

    fetchRecentTrips();
  }, []);

  // Initialiser les icônes Leaflet
  useEffect(() => {
    ensureLeafletIcons();
  }, []);

  // 🤖 [IA] Remplissage en direct depuis l'Assistant IA (Slot Filling progressif)
  useEffect(() => {
    const handleSlotUpdate = (event) => {
      const data = event.detail;
      console.log('🤖 [BOOKING] Slot Data reçu de l\'IA:', data);

      // Remplir les champs texte du formulaire
      setFormData(prev => ({
        ...prev,
        pickup: data.point_depart || prev.pickup,
        destination: data.destination || prev.destination,
        vehicleType: data.type_vehicule
          ? data.type_vehicule.toLowerCase().replace(/\s+/g, '').replace('voitureprivée', 'voiture').replace('voitureprivee', 'voiture').replace('taxipartagé', 'taxi').replace('taxipartage', 'taxi')
          : prev.vehicleType
      }));

      // Géocoder automatiquement les adresses pour placer les marqueurs sur la carte
      if (data.point_depart && data.point_depart !== '') {
        GeolocationService.geocodeAddress(data.point_depart + ', Guinée').then(results => {
          if (results && results.length > 0) {
            const loc = [parseFloat(results[0].lat), parseFloat(results[0].lon)];
            if (!isNaN(loc[0]) && !isNaN(loc[1])) {
              setPickupLocation(loc);
              setMapCenter(loc);
              if (mapRef.current) mapRef.current.setView(loc, 13);
            }
          }
        }).catch(() => { });
      }

      if (data.destination && data.destination !== '') {
        GeolocationService.geocodeAddress(data.destination + ', Guinée').then(results => {
          if (results && results.length > 0) {
            const loc = [parseFloat(results[0].lat), parseFloat(results[0].lon)];
            if (!isNaN(loc[0]) && !isNaN(loc[1])) {
              setDestinationLocation(loc);
            }
          }
        }).catch(() => { });
      }
    };

    window.addEventListener('taka-ia-slot-update', handleSlotUpdate);
    return () => window.removeEventListener('taka-ia-slot-update', handleSlotUpdate);
  }, []);

  // Initialiser les données si un trajet est en cours
  useEffect(() => {
    if (currentTrip) {
      setFormData({
        pickup: currentTrip.pickup || '',
        destination: currentTrip.destination || '',
        vehicleType: currentTrip.vehicleType || 'taxi'
      });
      if (currentTrip.pickupCoords && isValidLatLng(currentTrip.pickupCoords)) {
        setPickupLocation(currentTrip.pickupCoords);
        setMapCenter(currentTrip.pickupCoords);
      }
      if (currentTrip.destinationCoords && isValidLatLng(currentTrip.destinationCoords)) {
        setDestinationLocation(currentTrip.destinationCoords);
      }
    }
  }, [currentTrip]);

  // Centrer la carte sur le chauffeur si disponible
  useEffect(() => {
    if (currentDriver && currentDriver.location && isValidLatLng(currentDriver.location) && mapRef.current) {
      setMapCenter(currentDriver.location);
      mapRef.current.setView(currentDriver.location, 16, {
        animate: true,
        duration: 1
      });
    }
  }, [currentDriver, isOnMapView]);

  // Suivi de la permission de géolocalisation
  useEffect(() => {
    if (!navigator.permissions || !navigator.permissions.query) return;
    let status;
    navigator.permissions.query({ name: 'geolocation' })
      .then((permissionStatus) => {
        status = permissionStatus;
        setHasLocationPermission(permissionStatus.state !== 'denied');
        permissionStatus.onchange = () => {
          setHasLocationPermission(permissionStatus.state !== 'denied');
        };
      })
      .catch(() => { });
    return () => {
      if (status) {
        status.onchange = null;
      }
    };
  }, []);

  // Localiser l'utilisateur
  const locateUser = useCallback(async () => {
    if (!hasLocationPermission) {
      toast.error(t('booking.error_location_denied'));
      return;
    }

    setIsLoading(prev => ({ ...prev, geolocation: true }));
    const toastId = toast.loading(t('booking.locating'));

    try {
      const position = await GeolocationService.getCurrentPosition();
      const { lat, lng } = position;
      const location = [lat, lng];

      setUserLocation(location);
      setPickupLocation(location);
      setMapCenter(location);
      setHasLocationPermission(true);

      // Obtenir l'adresse
      const address = await GeolocationService.reverseGeocode(lat, lng);
      setFormData(prev => ({
        ...prev,
        pickup: address || `Position actuelle (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      }));

      if (mapRef.current) {
        mapRef.current.setView(location, 16);
      }

      toast.dismiss(toastId);
      toast.success(t('booking.position_found'));
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      toast.dismiss(toastId);
      let message = t('booking.error_locating');
      switch (error.code) {
        case 1: message = t('booking.permission_denied'); break;
        case 2: message = t('booking.position_unavailable'); break;
        case 3: message = t('booking.timeout'); break;
      }
      if (error.code === 1 || error.code === 0) {
        setHasLocationPermission(false);
      }
      toast.error(message);
    } finally {
      setIsLoading(prev => ({ ...prev, geolocation: false }));
    }
  }, [hasLocationPermission]);

  // Recherche d'adresse avec debounce
  const handleAddressInput = useCallback(async (type, value) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setFormData(prev => ({ ...prev, [type]: value }));

    if (value.trim().length < 3) {
      setSuggestions(prev => ({ ...prev, [type]: [] }));
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(prev => ({ ...prev, search: true }));
      try {
        const results = await GeolocationService.geocodeAddress(value);
        const formattedResults = results
          .map(item => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            display_name: item.display_name
          }))
          .filter(item => !isNaN(item.lat) && !isNaN(item.lng));
        setSuggestions(prev => ({ ...prev, [type]: formattedResults }));
      } catch (error) {
        console.error('Erreur de recherche:', error);
        setSuggestions(prev => ({ ...prev, [type]: [] }));
      } finally {
        setIsLoading(prev => ({ ...prev, search: false }));
      }
    }, 500);
  }, []);

  // Sélection d'une suggestion
  const handleSelectSuggestion = useCallback((type, suggestion) => {
    const location = [suggestion.lat, suggestion.lng];
    if (isNaN(location[0]) || isNaN(location[1])) {
      console.warn('handleSelectSuggestion: Invalid coordinates', location);
      return;
    }

    if (type === 'pickup') {
      setPickupLocation(location);
      setMapCenter(location);
    } else {
      setDestinationLocation(location);
      setMapCenter(location);
    }

    setFormData(prev => ({ ...prev, [type]: suggestion.display_name }));
    setSuggestions(prev => ({ ...prev, [type]: [] }));

    if (mapRef.current) {
      mapRef.current.setView(location, 16);
    }
  }, []);

  // Sélection sur la carte
  const handleMapSelection = useCallback(async (type, latlng) => {
    const location = [latlng.lat, latlng.lng];
    const loadingKey = type === 'pickup' ? 'pickup' : 'destination';
    setIsLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const address = await GeolocationService.reverseGeocode(latlng.lat, latlng.lng);
      if (isNaN(latlng.lat) || isNaN(latlng.lng)) return;

      if (type === 'pickup') {
        setPickupLocation(location);
        setFormData(prev => ({ ...prev, pickup: address }));
      } else {
        setDestinationLocation(location);
        setFormData(prev => ({ ...prev, destination: address }));
      }

      setMapCenter(location);
    } catch (error) {
      console.error('Erreur de reverse geocoding:', error);
      const fallbackAddress = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
      setFormData(prev => ({ ...prev, [type]: fallbackAddress }));
    } finally {
      setIsLoading(prev => ({ ...prev, [loadingKey]: false }));
    }

    setSelectionMode(null);
  }, []);

  // Calcul du prix (tarifs dynamiques admin)
  const calculatePrice = useCallback(() => {
    if (!pickupLocation || !destinationLocation) return null;
    const [lat1, lon1] = pickupLocation;
    const [lat2, lon2] = destinationLocation;
    const distance = GeolocationService.calculateDistance(lat1, lon1, lat2, lon2);
    const duration = Math.round(distance * 3);

    // Fallback sur les anciens tarifs si l'API n'a pas encore répondu
    const fallbackRates = {
      moto: { perKm: 400, min: 3000, basePrice: 0, perMinute: 0 },
      taxi: { perKm: 1200, min: 15000, basePrice: 0, perMinute: 0 },
      voiture: { perKm: 2000, min: 25000, basePrice: 0, perMinute: 0 }
    };

    const rates = dynamicRates || fallbackRates;
    const rate = rates[formData.vehicleType] || rates.taxi || fallbackRates.taxi;

    if (!rate) return null;

    let price = (rate.basePrice || 0) + distance * (rate.perKm || 0) + duration * (rate.perMinute || 0);
    price = Math.max(Math.round(price), rate.min || 0);

    return {
      distance: distance.toFixed(1),
      duration,
      price: price.toLocaleString(),
      priceValue: price
    };
  }, [pickupLocation, destinationLocation, formData.vehicleType, dynamicRates]);

  // Soumission du formulaire → pas d'envoi direct : on ouvre le modal de confirmation
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.pickup || !formData.destination || !pickupLocation || !destinationLocation) {
      toast.error(t('booking.enter_locations'));
      return;
    }

    const calculatedPrice = calculatePrice();
    if (!calculatedPrice) {
      toast.error(t('booking.error_calculating'));
      return;
    }

    const tripDraft = {
      // Champs UI (BookingSection / TripConfirmationModal / TripStatusModal)
      pickup: formData.pickup,
      destination: formData.destination,
      pickupCoords: pickupLocation,
      destinationCoords: destinationLocation,
      vehicleType: formData.vehicleType,
      estimatedPrice: calculatedPrice.priceValue,
      estimatedDistance: `${calculatedPrice.distance} km`,
      estimatedDuration: `${calculatedPrice.duration} min`,

      // Champs backend (pré-calculés pour le payload final)
      depart: formData.pickup,
      departLat: pickupLocation[0],
      departLng: pickupLocation[1],
      destinationLat: destinationLocation[0],
      destinationLng: destinationLocation[1],
      distanceKm: calculatedPrice.distance,
      dureeMin: calculatedPrice.duration
    };

    onBookTrip?.(tripDraft);
  };

  const priceData = calculatePrice();

  // Déterminer si on doit afficher le chauffeur
  const shouldShowDriver = currentDriver &&
    (tripStatus === 'driver_found' || tripStatus === 'approaching' || tripStatus === 'arrived') &&
    isOnMapView;

  // Déterminer si on doit afficher les contrôles de trajet
  const shouldShowTripControls = currentDriver &&
    (tripStatus === 'driver_found' || tripStatus === 'approaching' || tripStatus === 'arrived');

  // Recherche en cours
  const isSearching = tripStatus === 'searching';

  return (
    <>
      {/* Panneau de recherche en cours */}
      {isSearching && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card hoverable padding="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-600 flex items-center justify-center"
                >
                  <Loader className="w-12 h-12 text-green-600 animate-spin" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-600"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('booking.searching_driver')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('booking.best_driver_msg')}</p>
                {currentTrip && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1 text-emerald-500" />
                    <span className="truncate max-w-[150px]">{currentTrip.pickup}</span>
                    <span className="mx-2">→</span>
                    <MapPin className="w-4 h-4 mr-1 text-rose-500" />
                    <span className="truncate max-w-[150px]">{currentTrip.destination}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Barre de progression */}
            <div className="mt-4">
              <Progress
                value={50}
                animated
                striped
                color="green"
                showLabel={false}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 text-center">
              {t('booking.map_tip')}
            </p>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card hoverable padding="p-4 sm:p-8" className="relative overflow-hidden">
            <CardHeader align="start" className="mb-8">
              <CardTitle size="lg">
                {isSearching ? t('booking.searching_driver') : shouldShowDriver ? t('booking.your_trip') : t('booking.title')}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {isSearching ? t('booking.wait_searching') : shouldShowDriver ? t('booking.driver_approaching') : t('booking.select_destination_tip')}
              </p>
            </CardHeader>
            <CardContent>
              {/* SÉLECTEUR DE SERVICE */}
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setServiceMode('vtc')}
                  className={`flex-1 flex items-center justify-center py-2.5 rounded-lg font-bold transition-all ${serviceMode === 'vtc'
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Car className="w-4 h-4 mr-2 text-emerald-500" />
                  Course VTC / Taxi
                </button>
                <button
                  type="button"
                  onClick={() => setServiceMode('location')}
                  className={`flex-1 flex items-center justify-center py-2.5 rounded-lg font-bold transition-all ${serviceMode === 'location'
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  Location Véhicule
                </button>
              </div>

              {/* ─── MODE VTC : Formulaire classique ─── */}
              {serviceMode === 'vtc' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Départ */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-3">
                          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        {t('booking.pickup_label')}
                      </label>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => {
                          setSelectionMode(selectionMode === 'pickup' ? null : 'pickup');
                          setSuggestions(prev => ({ ...prev, pickup: [] }));
                        }}
                        className={selectionMode === 'pickup' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : ''}
                      >
                        {selectionMode === 'pickup' ? (
                          <span className="flex items-center">
                            <Check className="w-3 h-3 mr-1" /> {t('booking.selection_mode')}
                          </span>
                        ) : t('booking.select_on_map')}
                      </Button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.pickup}
                        onChange={(e) => handleAddressInput('pickup', e.target.value)}
                        className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none focus:shadow-lg"
                        placeholder={t('booking.pickup_placeholder')}
                        disabled={shouldShowDriver}
                      />
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      {isLoading.pickup && (
                        <Loader className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                      )}
                      {/* Suggestions */}
                      {suggestions.pickup.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto custom-scrollbar-v5">
                          {suggestions.pickup.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSelectSuggestion('pickup', suggestion)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">{suggestion.display_name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                        <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mr-3">
                          <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        </div>
                        {t('booking.destination_label')}
                      </label>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => {
                          setSelectionMode(selectionMode === 'destination' ? null : 'destination');
                          setSuggestions(prev => ({ ...prev, destination: [] }));
                        }}
                        className={selectionMode === 'destination' ? 'bg-rose-500 text-white hover:bg-rose-600' : ''}
                      >
                        {selectionMode === 'destination' ? (
                          <span className="flex items-center"><Check className="w-3 h-3 mr-1" /> {t('booking.selection_mode')}</span>
                        ) : t('booking.select_on_map')}
                      </Button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.destination}
                        onChange={(e) => handleAddressInput('destination', e.target.value)}
                        className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none focus:shadow-lg"
                        placeholder={t('booking.destination_placeholder')}
                        disabled={shouldShowDriver}
                      />
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-600 dark:text-rose-400" />
                      {isLoading.destination && (
                        <Loader className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                      )}
                      {suggestions.destination.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto custom-scrollbar-v5">
                          {suggestions.destination.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSelectSuggestion('destination', suggestion)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">{suggestion.display_name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estimation */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800/30"
                  >
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('booking.estimation_title')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                          {priceData?.price || '—'} GNF
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('booking.estimated_price')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {priceData?.distance || '—'} km
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('booking.distance')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {priceData?.duration || '—'} min
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('booking.duration')}</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Bouton de confirmation ou contrôles de trajet */}
                  {shouldShowTripControls ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800/30"
                    >
                      {/* Information chauffeur gérée par le SearchIndicator et le Modal d'arrivée */}
                      {tripStatus === 'driver_found' ? (
                        <button
                          onClick={() => window.open(`tel:${currentDriver?.phone}`)}
                          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center transition-all shadow-lg shadow-emerald-500/30"
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          {t('booking.call_driver')}
                        </button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={onShowTracking}
                          className="w-full py-4"
                          icon={Navigation}
                        >
                          {t('booking.follow_live')}
                        </Button>
                      )}
                    </motion.div>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={!formData.pickup || !formData.destination || isLoading.submit}
                      className="w-full py-4"
                      icon={Search}
                      fullWidth
                    >
                      {isLoading.submit ? (
                        <span className="flex items-center justify-center">
                          <Loader className="w-5 h-5 mr-2 animate-spin" />
                          {t('common.loading')}
                        </span>
                      ) : (
                        t('booking.confirm_btn')
                      )}
                    </Button>
                  )}
                </form>
              )}

              {/* ─── MODE LOCATION : Grille des véhicules ─── */}
              {serviceMode === 'location' && (
                <div className="space-y-5">
                  {/* Filtres catégories */}
                  <div className="flex flex-wrap gap-2">
                    {flotteCategories.map((cat) => {
                      const isActive = activeFlotteCategory === cat.id;
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveFlotteCategory(cat.id)}
                          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${isActive
                              ? 'text-white bg-gradient-to-r from-emerald-500 to-blue-600 shadow-md'
                              : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                          <Icon size={12} />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Grille des véhicules */}
                  {loadingFlotte ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                      <p className="text-gray-500 animate-pulse">Chargement de la flotte...</p>
                    </div>
                  ) : vehiculesFiltres.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar-v5">
                      {vehiculesFiltres.map((vehicule) => {
                        const isDisponible = vehicule.statut === 'DISPONIBLE';
                        return (
                          <motion.div
                            key={vehicule._id || vehicule.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative overflow-hidden rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-900/80 shadow-sm hover:shadow-xl hover:border-emerald-400/40 transition-all duration-300"
                          >
                            {/* Image */}
                            <div className="relative h-36 overflow-hidden bg-gray-100 dark:bg-gray-800">
                              <img
                                src={getFullAssetURL(vehicule.photo || (vehicule.photos && vehicule.photos[0]))}
                                alt={`${vehicule.marque} ${vehicule.modele}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              {/* Badge Catégorie */}
                              <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${categoryStyles[vehicule.categorie] || 'bg-gray-500/20 text-gray-600 border-gray-500/30'}`}>
                                {vehicule.categorie}
                              </div>
                              {/* Badge Statut */}
                              <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md border ${isDisponible
                                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                  : 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isDisponible ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                {isDisponible ? 'Disponible' : 'Loué'}
                              </div>
                            </div>

                            {/* Infos */}
                            <div className="p-3">
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                                {vehicule.marque} {vehicule.modele}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-0.5">
                                  <Users size={10} className="text-emerald-500" />
                                  {vehicule.places || vehicule.caracteristiques?.nb_places} pl.
                                </span>
                                <span className="w-px h-2.5 bg-gray-300 dark:bg-gray-600" />
                                <span className="flex items-center gap-0.5">
                                  <Fuel size={10} className="text-blue-500" />
                                  {vehicule.carburant || vehicule.caracteristiques?.type_carburant || 'Diesel'}
                                </span>
                                <span className="w-px h-2.5 bg-gray-300 dark:bg-gray-600" />
                                <span className="flex items-center gap-0.5">
                                  <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                  {vehicule.note}
                                </span>
                              </div>

                              {/* Prix + Bouton */}
                              <div className="flex items-end justify-between mt-3">
                                <div>
                                  <p className="text-lg font-extrabold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                                    {formatPrix(vehicule.prix_jour)}
                                    <span className="text-[9px] font-medium text-gray-400 ml-1">GNF/j</span>
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleReserverVehicule(vehicule)}
                                  disabled={!isDisponible}
                                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isDisponible
                                      ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                  <Calendar size={12} />
                                  Réserver
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400">
                      <Car size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Aucun véhicule dans cette catégorie</p>
                    </div>
                  )}
                </div>
              )}

              {/* Modal de Réservation Location */}
              <ReservationLocationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                vehicule={selectedVehicule}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Carte */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-white passenger-glass dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {shouldShowDriver ? t('booking.driver_en_route') : t('booking.interactive_map')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectionMode ? (
                      <span className="flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${selectionMode === 'pickup' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {t('booking.click_on_map_msg', { mode: selectionMode === 'pickup' ? t('booking.pickup_label') : t('booking.destination_label') })}
                      </span>
                    ) : shouldShowDriver ? (
                      <span className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2" />
                        {t('booking.driver_arriving', { eta: currentDriver.eta })}
                      </span>
                    ) : (
                      t('booking.map_tip')
                    )}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={locateUser}
                    disabled={isLoading.geolocation}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-medium flex items-center hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {isLoading.geolocation ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        {t('booking.currently_locating')}
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 mr-1" />
                        {t('booking.my_position')}
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden h-[350px] sm:h-[500px]">
                <MapContainer
                  center={isValidLatLng(mapCenter) ? mapCenter : [9.6412, -13.5784]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                  className="rounded-xl"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapController center={isValidLatLng(mapCenter) ? mapCenter : [9.6412, -13.5784]} zoom={16} />
                  <MapEvents
                    onPickupSelect={(latlng) => handleMapSelection('pickup', latlng)}
                    onDestinationSelect={(latlng) => handleMapSelection('destination', latlng)}
                    selectionMode={selectionMode}
                  />

                  {/* Marqueurs */}
                  {userLocation && isValidLatLng(userLocation) && (
                    <Marker position={userLocation} icon={leafletIcons.user}>
                      <Popup>
                        <div className="p-2">
                          <div className="font-bold text-blue-600">{t('booking.legend.position')}</div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {pickupLocation && isValidLatLng(pickupLocation) && (
                    <Marker position={pickupLocation} icon={leafletIcons.start}>
                      <Popup>
                        <div className="p-2">
                          <div className="font-bold text-green-600">{t('booking.legend.pickup')}</div>
                          <div className="text-sm text-gray-600 mt-1">{formData.pickup}</div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {destinationLocation && isValidLatLng(destinationLocation) && (
                    <Marker position={destinationLocation} icon={leafletIcons.end}>
                      <Popup>
                        <div className="p-2">
                          <div className="font-bold text-red-600">{t('booking.legend.destination')}</div>
                          <div className="text-sm text-gray-600 mt-1">{formData.destination}</div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {shouldShowDriver && currentDriver.location && isValidLatLng(currentDriver.location) && (
                    <Marker position={currentDriver.location} icon={leafletIcons.driver}>
                      <Popup>
                        <div className="p-2">
                          <div className="font-bold text-blue-600">{t('booking.legend.driver')}</div>
                          <div className="text-sm text-gray-600">{currentDriver.name}</div>
                          <div className="text-xs text-gray-500">
                            {currentDriver.vehicle.brand} {currentDriver.vehicle.model} • {currentDriver.vehicle.plate}
                          </div>
                          <div className="mt-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {t('booking.driver_arriving', { eta: currentDriver.eta })}
                            </span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {shouldShowDriver && currentDriver.location && isValidLatLng(currentDriver.location) && pickupLocation && isValidLatLng(pickupLocation) && (
                    <Polyline
                      positions={[currentDriver.location, pickupLocation]}
                      pathOptions={{ color: '#22c55e', weight: 5, opacity: 0.8, dashArray: '10, 15', lineCap: 'round' }}
                    />
                  )}
                </MapContainer>

                {/* Indicateur de mode */}
                {selectionMode && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl z-[1000] border-2 border-green-500"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${selectionMode === 'pickup' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                      <div>
                        <span className="font-bold text-gray-900">
                          {t('booking.map_mode', { type: selectionMode === 'pickup' ? t('booking.legend.pickup') : t('booking.legend.destination') })}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {t('booking.map_instruction')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Légende */}
              <div className="mt-6 flex items-center justify-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{t('booking.legend.pickup')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{t('booking.legend.destination')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700">{t('booking.legend.position')}</span>
                </div>
                {shouldShowDriver && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700">{t('booking.legend.driver')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div >

      {/* Historique des trajets */}
      < motion.div
        initial={{ opacity: 0, y: 20 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-10"
      >
        <Card hoverable>
          <CardContent padding="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('booking.recent_trips.title')}</h2>
                <p className="text-gray-500">{t('booking.recent_trips.subtitle')}</p>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowTripHistory(true)}
                icon={History}
              >
                {t('booking.recent_trips.view_all')}
              </Button>
            </div>
            <Table
              headers={[
                t('history.table.date'),
                t('history.table.pickup'),
                t('history.table.destination'),
                t('history.table.price'),
                t('history.table.status')
              ]}
              striped
              hoverable
            >
              {recentTrips.length > 0 ? (
                recentTrips.map((trip) => (
                  <TableRow key={trip.id} hoverable>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{trip.date}</p>
                          <p className="text-sm text-gray-500">{trip.time}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                        <span>{trip.departure}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-rose-500 rounded-full mr-3"></div>
                        <span>{trip.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-emerald-700">{trip.price}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={trip.status === 'completed' ? 'success' : 'danger'} size="sm">
                        {trip.status === 'completed' ? t('history.status.completed') : t('history.status.cancelled')}
                      </Badge>
                    </TableCell>

                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="text-center py-4 text-gray-500">{t('booking.recent_trips.no_recent')}</div>
                  </TableCell>
                </TableRow>
              )}
            </Table>
          </CardContent>
        </Card>
      </motion.div >

      {/* Modal d'historique complet */}
      < Modal
        isOpen={showTripHistory}
        onClose={() => setShowTripHistory(false)}
        title={t('booking.full_history_modal.title')}
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {t('booking.full_history_modal.desc')}
          </p>
          <div className="flex justify-between items-center">
            <Button variant="secondary" icon={Download}>
              {t('booking.full_history_modal.export_pdf')}
            </Button>
            <div className="flex space-x-2">
              <Button variant="ghost">{t('booking.full_history_modal.filter_all')}</Button>
              <Button variant="primary" size="small">{t('booking.full_history_modal.filter_month')}</Button>
              <Button variant="ghost" size="small">{t('booking.full_history_modal.filter_year')}</Button>
            </div>
          </div>
        </div>
      </Modal >
    </>
  );
};

export default BookingSection;

// src/components/passager/BookingSection.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Navigation, Car, Search, Check,
  Phone, Calendar, Download, Eye, History,
  Loader
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
import toast from 'react-hot-toast';
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

// Gestionnaire d'événements carte
function MapEvents({ onPickupSelect, onDestinationSelect, selectionMode }) {
  useMapEvent({
    click(e) {
      if (selectionMode === 'pickup') {
        onPickupSelect(e.latlng);
        toast.success('Point de départ sélectionné');
      } else if (selectionMode === 'destination') {
        onDestinationSelect(e.latlng);
        toast.success('Destination sélectionnée');
      }
    }
  });
  return null;
}

// Données de test (historique)
const recentTrips = [
  {
    id: 1,
    date: "Aujourd'hui",
    time: "14:30",
    departure: "Mamou",
    destination: "Conakry",
    price: "15 000 GNF",
    status: "completed",
  },
  {
    id: 2,
    date: "Hier",
    time: "08:15",
    departure: "Kindia",
    destination: "Aéroport",
    price: "25 000 GNF",
    status: "cancelled",
  },
];

const BookingSection = ({
  onBookTrip,
  currentTrip,
  currentDriver,
  tripStatus,
  isOnMapView,
  onShowTracking
}) => {
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

  // Initialiser les icônes Leaflet
  useEffect(() => {
    ensureLeafletIcons();
  }, []);

  // Initialiser les données si un trajet est en cours
  useEffect(() => {
    if (currentTrip) {
      setFormData({
        pickup: currentTrip.pickup || '',
        destination: currentTrip.destination || '',
        vehicleType: currentTrip.vehicleType || 'taxi'
      });
      if (currentTrip.pickupCoords) {
        setPickupLocation(currentTrip.pickupCoords);
        setMapCenter(currentTrip.pickupCoords);
      }
      if (currentTrip.destinationCoords) {
        setDestinationLocation(currentTrip.destinationCoords);
      }
    }
  }, [currentTrip]);

  // Centrer la carte sur le chauffeur si disponible
  useEffect(() => {
    if (currentDriver && currentDriver.location && mapRef.current) {
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
      toast.error('Veuillez autoriser la géolocalisation dans vos paramètres');
      return;
    }

    setIsLoading(prev => ({ ...prev, geolocation: true }));
    const toastId = toast.loading('Recherche de votre position...');

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
      toast.success('Position trouvée !');
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      toast.dismiss(toastId);
      let message = 'Impossible de vous localiser';
      switch (error.code) {
        case 1: message = 'Permission de localisation refusée'; break;
        case 2: message = 'Position indisponible'; break;
        case 3: message = 'Délai de localisation dépassé'; break;
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

  // Calcul du prix
  const calculatePrice = useCallback(() => {
    if (!pickupLocation || !destinationLocation) return null;
    const [lat1, lon1] = pickupLocation;
    const [lat2, lon2] = destinationLocation;
    const distance = GeolocationService.calculateDistance(lat1, lon1, lat2, lon2);

    const rates = {
      moto: { perKm: 400, min: 3000 },
      taxi: { perKm: 1200, min: 15000 },
      voiture: { perKm: 2000, min: 25000 }
    };

    const rate = rates[formData.vehicleType] || rates.taxi;
    const price = Math.max(Math.round(distance * rate.perKm), rate.min);

    return {
      distance: distance.toFixed(1),
      duration: Math.round(distance * 3),
      price: price.toLocaleString(),
      priceValue: price
    };
  }, [pickupLocation, destinationLocation, formData.vehicleType]);

  // Soumission du formulaire → pas d'envoi direct : on ouvre le modal de confirmation
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.pickup || !formData.destination || !pickupLocation || !destinationLocation) {
      toast.error('Veuillez spécifier le départ et la destination');
      return;
    }

    const calculatedPrice = calculatePrice();
    if (!calculatedPrice) {
      toast.error('Impossible de calculer le prix');
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
    (tripStatus === 'driver_found' || tripStatus === 'arrived') &&
    isOnMapView;

  // Déterminer si on doit afficher les contrôles de trajet
  const shouldShowTripControls = currentDriver &&
    (tripStatus === 'driver_found' || tripStatus === 'arrived');

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
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recherche de chauffeur en cours...</h3>
                <p className="text-gray-600 dark:text-gray-400">Nous recherchons le meilleur chauffeur pour vous</p>
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
              Vous pouvez naviguer librement pendant la recherche
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
          <Card hoverable padding="p-8">
            <CardHeader align="start" className="mb-8">
              <CardTitle size="lg">
                {isSearching ? 'Recherche en cours' : shouldShowDriver ? 'Votre trajet' : 'Réserver un trajet'}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {isSearching ? 'Patientez, nous cherchons un chauffeur...' : shouldShowDriver ? 'Votre chauffeur est en route' : 'Choisissez votre destination en toute simplicité'}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Départ */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-3">
                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      Lieu de départ
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
                          <Check className="w-3 h-3 mr-1" /> Mode sélection
                        </span>
                      ) : 'Sélection sur carte'}
                    </Button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.pickup}
                      onChange={(e) => handleAddressInput('pickup', e.target.value)}
                      className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none focus:shadow-lg"
                      placeholder="Où êtes-vous ?"
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
                      Destination
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
                        <span className="flex items-center"><Check className="w-3 h-3 mr-1" /> Mode sélection</span>
                      ) : 'Sélection sur carte'}
                    </Button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => handleAddressInput('destination', e.target.value)}
                      className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none focus:shadow-lg"
                      placeholder="Où allez-vous ?"
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
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Estimation du trajet</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        {priceData?.price || '—'} GNF
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Prix estimé</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {priceData?.distance || '—'} km
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Distance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {priceData?.duration || '—'} min
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Durée estimée</div>
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
                        Appeler le chauffeur
                      </button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={onShowTracking}
                        className="w-full py-4"
                        icon={Navigation}
                      >
                        Suivre en direct
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
                        En cours...
                      </span>
                    ) : (
                      'Voir les détails et confirmer'
                    )}
                  </Button>
                )}
              </form>
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
                    {shouldShowDriver ? 'Votre chauffeur en route' : 'Carte interactive'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectionMode ? (
                      <span className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${selectionMode === 'pickup' ? 'bg-green-500' : 'bg-red-500'}`} />
                        Cliquez pour sélectionner le {selectionMode === 'pickup' ? 'départ' : 'destination'}
                      </span>
                    ) : shouldShowDriver ? (
                      <span className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2" />
                        Votre chauffeur arrive dans {currentDriver.eta}
                      </span>
                    ) : (
                      'Cliquez sur "Sélection sur carte" pour choisir un point'
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
                        Localisation...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 mr-1" />
                        Ma position
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden h-[500px]">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                  className="rounded-xl"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapController center={mapCenter} zoom={16} />
                  <MapEvents
                    onPickupSelect={(latlng) => handleMapSelection('pickup', latlng)}
                    onDestinationSelect={(latlng) => handleMapSelection('destination', latlng)}
                    selectionMode={selectionMode}
                  />

                  {/* Marqueurs */}
                  {userLocation && (
                    <Marker position={userLocation} icon={leafletIcons.user}>
                      <Popup>
                        <div className="p-2">
                          <div className="font-bold text-blue-600">Votre position</div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {pickupLocation && (
                    <Marker position={pickupLocation} icon={leafletIcons.start}>
                      <Popup>
                        <div className="p-2">
                          <div className="font-bold text-green-600">Point de départ</div>
                          <div className="text-sm text-gray-600 mt-1">{formData.pickup}</div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {destinationLocation && (
                    <Marker position={destinationLocation} icon={leafletIcons.end}>
                      <Popup>
                        <div className="p-2">
                          <div className="font-bold text-red-600">Destination</div>
                          <div className="text-sm text-gray-600 mt-1">{formData.destination}</div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {shouldShowDriver && currentDriver.location && (
                    <Marker position={currentDriver.location} icon={leafletIcons.driver}>
                      <Popup>
                        <div className="p-2">
                          <div className="font-bold text-blue-600">Votre chauffeur</div>
                          <div className="text-sm text-gray-600">{currentDriver.name}</div>
                          <div className="text-xs text-gray-500">
                            {currentDriver.vehicle.brand} {currentDriver.vehicle.model} • {currentDriver.vehicle.plate}
                          </div>
                          <div className="mt-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Arrive dans {currentDriver.eta}
                            </span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
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
                          Mode {selectionMode === 'pickup' ? 'Départ' : 'Destination'}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Cliquez sur la carte pour définir le point
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
                  <span className="text-sm text-gray-700">Départ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Destination</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700">Votre position</span>
                </div>
                {shouldShowDriver && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700">Chauffeur</span>
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trajets récents</h2>
                <p className="text-gray-500">Vos dernières courses</p>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowTripHistory(true)}
                icon={History}
              >
                Voir l'historique
              </Button>
            </div>
            <Table
              headers={['DATE', 'DÉPART', 'DESTINATION', 'PRIX', 'STATUT', 'ACTIONS']}
              striped
              hoverable
            >
              {recentTrips.map((trip) => (
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
                      {trip.status === 'completed' ? 'Terminé' : 'Annulé'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="small" icon={Eye}>
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </CardContent>
        </Card>
      </motion.div >

      {/* Modal d'historique complet */}
      < Modal
        isOpen={showTripHistory}
        onClose={() => setShowTripHistory(false)}
        title="Historique complet des trajets"
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Consultez l'ensemble de vos trajets passés et téléchargez vos reçus.
          </p>
          <div className="flex justify-between items-center">
            <Button variant="secondary" icon={Download}>
              Exporter en PDF
            </Button>
            <div className="flex space-x-2">
              <Button variant="ghost">Tous</Button>
              <Button variant="primary" size="small">Ce mois</Button>
              <Button variant="ghost" size="small">Cette année</Button>
            </div>
          </div>
        </div>
      </Modal >
    </>
  );
};

export default BookingSection;

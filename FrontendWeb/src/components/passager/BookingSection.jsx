// src/components/passager/BookingSection.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Car, Calendar, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';

// Composants UI réutilisables
import Card, { CardHeader, CardTitle, CardContent } from '../admin/ui/Card';
import Progress from '../admin/ui/Progress';

// Services
import { GeolocationService } from '../../services/geolocation';

// Sous-modules de la réservation
import { useLocationRentalFleet } from './booking/useLocationRentalFleet';
import LocationRentalPanel from './booking/LocationRentalPanel';
import { useAddressSearch, isValidLatLng } from './booking/useAddressSearch';
import { useBookingPricing } from './booking/useBookingPricing';
import { useRecentTrips } from './booking/useRecentTrips';
import BookingForm from './booking/BookingForm';
import BookingMap from './booking/BookingMap';
import RecentTripsCard from './booking/RecentTripsCard';

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

  const {
    vehiculesFiltres, loadingFlotte, activeFlotteCategory, setActiveFlotteCategory,
    isModalOpen, setIsModalOpen, selectedVehicule, handleReserverVehicule,
  } = useLocationRentalFleet(serviceMode);

  const [formData, setFormData] = useState({
    pickup: '',
    destination: '',
    vehicleType: 'taxi',
  });

  const {
    pickupLocation, setPickupLocation,
    destinationLocation, setDestinationLocation,
    userLocation, mapCenter, setMapCenter,
    selectionMode, setSelectionMode,
    isLoading, suggestions,
    mapRef,
    locateUser,
    handleAddressInput,
    handleSelectSuggestion,
    handleMapSelection,
  } = useAddressSearch({ t, formData, setFormData, currentDriver, isOnMapView });

  const { calculatePrice } = useBookingPricing({
    pickupLocation, destinationLocation, vehicleType: formData.vehicleType,
  });

  const recentTrips = useRecentTrips();
  const [showTripHistory, setShowTripHistory] = useState(false);

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
                <BookingForm
                  t={t}
                  formData={formData}
                  onAddressInput={handleAddressInput}
                  selectionMode={selectionMode}
                  onSetSelectionMode={setSelectionMode}
                  suggestions={suggestions}
                  onSelectSuggestion={handleSelectSuggestion}
                  isLoading={isLoading}
                  shouldShowDriver={shouldShowDriver}
                  priceData={priceData}
                  shouldShowTripControls={shouldShowTripControls}
                  tripStatus={tripStatus}
                  currentDriver={currentDriver}
                  onShowTracking={onShowTracking}
                  onSubmit={handleSubmit}
                />
              )}

              {/* ─── MODE LOCATION : Grille des véhicules ─── */}
              {serviceMode === 'location' && (
                <LocationRentalPanel
                  vehiculesFiltres={vehiculesFiltres}
                  loadingFlotte={loadingFlotte}
                  activeFlotteCategory={activeFlotteCategory}
                  onCategoryChange={setActiveFlotteCategory}
                  onReserverVehicule={handleReserverVehicule}
                  isModalOpen={isModalOpen}
                  onCloseModal={() => setIsModalOpen(false)}
                  selectedVehicule={selectedVehicule}
                />
              )}
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
          <BookingMap
            t={t}
            mapCenter={mapCenter}
            mapRef={mapRef}
            selectionMode={selectionMode}
            onMapSelection={handleMapSelection}
            userLocation={userLocation}
            pickupLocation={pickupLocation}
            destinationLocation={destinationLocation}
            formData={formData}
            shouldShowDriver={shouldShowDriver}
            currentDriver={currentDriver}
            locateUser={locateUser}
            isLoadingGeolocation={isLoading.geolocation}
          />
        </motion.div>
      </div>

      {/* Historique des trajets */}
      <RecentTripsCard
        t={t}
        recentTrips={recentTrips}
        showTripHistory={showTripHistory}
        onShowHistory={() => setShowTripHistory(true)}
        onCloseHistory={() => setShowTripHistory(false)}
      />
    </>
  );
};

export default BookingSection;

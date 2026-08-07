import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { GeolocationService } from '../../../services/geolocation';

export const useAddressSearch = ({ t, formData, setFormData, currentDriver, isOnMapView }) => {
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
  const mapRef = useRef();
  const searchTimeoutRef = useRef();

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
  }, [hasLocationPermission, t, setFormData]);

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
  }, [setFormData]);

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
  }, [setFormData]);

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
  }, [setFormData]);

  return {
    pickupLocation, setPickupLocation,
    destinationLocation, setDestinationLocation,
    userLocation, mapCenter, setMapCenter,
    selectionMode, setSelectionMode,
    isLoading, setIsLoading,
    suggestions, setSuggestions,
    mapRef,
    locateUser,
    handleAddressInput,
    handleSelectSuggestion,
    handleMapSelection,
  };
};

// Helper pour éviter les crashs Leaflet (Invalid LatLng)
export const isValidLatLng = (loc) => {
  return Array.isArray(loc) && loc.length >= 2 && loc[0] != null && loc[1] != null && !isNaN(loc[0]) && !isNaN(loc[1]);
};

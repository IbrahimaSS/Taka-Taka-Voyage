import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export const useGeolocation = () => {
  const [userLocation, setUserLocation] = useState({ lat: 10.3676, lng: -12.5883 });
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      setHasLocationPermission(false);
      setIsLoadingLocation(false);
      toast.error("Géolocalisation non supportée par votre navigateur");
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        setHasLocationPermission(true);
        setIsLoadingLocation(false);
        toast.success("Position détectée avec succès", { id: "location-success" });
      },
      (error) => {
        setHasLocationPermission(false);
        setIsLoadingLocation(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Activez la géolocalisation dans votre navigateur", { id: "location-error" });
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Position indisponible. Vérifiez votre GPS", { id: "location-error" });
            break;
          case error.TIMEOUT:
            toast.error("Délai dépassé pour obtenir la position", { id: "location-error" });
            break;
          default:
            toast.error("Impossible d'obtenir votre position", { id: "location-error" });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const retryLocation = () => requestLocationPermission();

  // ===================== GEOLOCATION =====================
  useEffect(() => {
    requestLocationPermission();
    // eslint-disable-next-line
  }, []);

  return {
    userLocation,
    hasLocationPermission,
    isLoadingLocation,
    retryLocation,
  };
};

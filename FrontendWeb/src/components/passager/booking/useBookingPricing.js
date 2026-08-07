import { useState, useEffect, useCallback } from 'react';
import { GeolocationService } from '../../../services/geolocation';
import { platformService } from '../../../services/platformService';

export const useBookingPricing = ({ pickupLocation, destinationLocation, vehicleType }) => {
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
    const rate = rates[vehicleType] || rates.taxi || fallbackRates.taxi;

    if (!rate) return null;

    let price = (rate.basePrice || 0) + distance * (rate.perKm || 0) + duration * (rate.perMinute || 0);
    price = Math.max(Math.round(price), rate.min || 0);

    return {
      distance: distance.toFixed(1),
      duration,
      price: price.toLocaleString(),
      priceValue: price
    };
  }, [pickupLocation, destinationLocation, vehicleType, dynamicRates]);

  return { calculatePrice };
};

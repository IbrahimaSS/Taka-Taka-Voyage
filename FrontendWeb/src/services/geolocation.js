/**
 * services/geolocation.js
 * Unified Geolocation Service for Taka-Taka
 * Handles positioning, reverse geocoding, and distance calculations.
 */
export class GeolocationService {
  /**
   * Get current position once
   */
  static async getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (isNaN(latitude) || isNaN(longitude)) {
            reject(new Error('Coordonnées invalides reçues du GPS'));
          } else {
            resolve({ lat: latitude, lng: longitude });
          }
        },
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
          ...options
        }
      );
    });
  }

  /**
   * Watch position with specialized handler
   */
  static watchPosition(onSuccess, onError, options = {}) {
    if (!navigator.geolocation) {
      onError(new Error('Géolocalisation non supportée'));
      return null;
    }

    return navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!isNaN(latitude) && !isNaN(longitude)) {
          onSuccess({ lat: latitude, lng: longitude });
        }
      },
      onError,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
        ...options
      }
    );
  }

  /**
   * Calculate distance between two points (Haversine formula) in kilometers
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Reverse geocode coordinates to a human-readable address (Nominatim)
   */
  static async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const data = await response.json();
      return this.formatAddress(data);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  /**
   * Format address object from Nominatim data
   */
  static formatAddress(data) {
    if (!data || !data.address) return null;

    const { address } = data;
    const parts = [];

    if (address.road) parts.push(address.road);
    if (address.house_number) parts[0] = `${address.house_number} ${parts[0]}`;
    if (address.suburb) parts.push(address.suburb);
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }

    return parts.length > 0 ? parts.join(', ') : data.display_name;
  }

  /**
   * Search for addresses matching a query (Nominatim)
   */
  static async geocodeAddress(address) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=gn`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      return await response.json();
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }
}
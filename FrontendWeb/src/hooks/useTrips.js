import { useState, useEffect } from 'react';

const useTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    date: 'all',
    vehicle: 'all',
  });

  const mockTrips = [
    {
      id: 1,
      date: "Aujourd'hui, 14:30",
      driver: { name: "Mamadou Fela", vehicle: "Toyota Corolla", rating: 4.2 },
      departure: "Mamou",
      destination: "Kindia",
      price: "15 000 GNF",
      status: "completed",
      distance: "12.5 km",
      duration: "25 min",
      rating: 4.0,
    },
    // ... autres trajets
  ];

  useEffect(() => {
    // Simuler chargement des données
    setTimeout(() => {
      setTrips(mockTrips);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTrips = trips.filter(trip => {
    if (filters.status !== 'all' && trip.status !== filters.status) return false;
    if (filters.date !== 'all') {
      // Logique de filtrage par date
    }
    if (filters.vehicle !== 'all') {
      // Logique de filtrage par véhicule
    }
    return true;
  });

  const stats = {
    totalTrips: trips.length,
    totalDistance: trips.reduce((sum, trip) => sum + parseFloat(trip.distance), 0),
    totalSpent: trips.reduce((sum, trip) => sum + parseInt(trip.price), 0),
    averageRating: trips.length > 0 
      ? trips.reduce((sum, trip) => sum + (trip.rating || 0), 0) / trips.length
      : 0,
  };

  return {
    trips: filteredTrips,
    loading,
    filters,
    setFilters,
    stats,
    refreshTrips: () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    },
  };
};

export default useTrips;
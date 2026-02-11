import { create } from 'zustand';

/**
 * Store Zustand (version JS)
 * Données mock pour le dashboard chauffeur.
 */
export const useTripStore = create((set) => ({
  trips: [
    {
      id: 'TRP-001',
      passengerName: 'Mamadou Diallo',
      pickupAddress: 'Treichville, Carrefour de la Vie',
      destinationAddress: 'Plateau, Tour Postel 2001',
      distance: '8.5 km',
      estimatedTime: '25 min',
      estimatedFare: 12500,
      requestedTime: new Date('2024-01-15T08:30:00'),
      status: 'pending',
      priority: 'high',
      passengerRating: 4.8,
      notes: 'Client régulier'
    },
    {
      id: 'TRP-002',
      passengerName: 'Fatoumata Sylla',
      pickupAddress: 'Marcory, Rue des Jardins',
      destinationAddress: 'Cocody, Riviera Golf',
      distance: '12.3 km',
      estimatedTime: '35 min',
      estimatedFare: 18500,
      requestedTime: new Date('2024-01-15T09:15:00'),
      status: 'accepted',
      priority: 'medium',
      passengerRating: 4.5
    },
    {
      id: 'TRP-003',
      passengerName: 'Ibrahim Traoré',
      pickupAddress: 'Yopougon, Sicogi',
      destinationAddress: 'Adjamé, Rue 12',
      distance: '15.7 km',
      estimatedTime: '45 min',
      estimatedFare: 22500,
      requestedTime: new Date('2024-01-15T10:00:00'),
      status: 'in_progress',
      priority: 'high',
      passengerRating: 4.2
    },
    {
      id: 'TRP-004',
      passengerName: 'Aïssata Koné',
      pickupAddress: 'Koumassi, Marché',
      destinationAddress: 'Port-Bouët, Aéroport',
      distance: '9.8 km',
      estimatedTime: '28 min',
      estimatedFare: 14500,
      requestedTime: new Date('2024-01-15T11:30:00'),
      status: 'pending',
      priority: 'low'
    },
    {
      id: 'TRP-005',
      passengerName: 'Boubacar Keita',
      pickupAddress: 'Abobo, Gare routière',
      destinationAddress: 'Attécoubé, Anono',
      distance: '7.2 km',
      estimatedTime: '22 min',
      estimatedFare: 11500,
      requestedTime: new Date('2024-01-15T13:00:00'),
      status: 'completed',
      priority: 'medium',
      passengerRating: 4.9
    }
  ],

  handleAcceptTrip: (id) =>
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === id ? { ...trip, status: 'accepted' } : trip
      ),
    })),

  handleStartTrip: (id) =>
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === id ? { ...trip, status: 'in_progress' } : trip
      ),
    })),

  completeTrip: (id) =>
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === id ? { ...trip, status: 'completed' } : trip
      ),
    })),

  cancelTrip: (id) =>
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === id ? { ...trip, status: 'cancelled' } : trip
      ),
    })),

  // Ajouter une nouvelle course (depuis les demandes temps réel)
  addTrip: (trip) =>
    set((state) => ({
      trips: [trip, ...state.trips],
    })),

  // Mettre à jour le statut d'une course
  updateTripStatus: (id, status) =>
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === id ? { ...trip, status } : trip
      ),
    })),
}));


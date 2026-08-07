import { useState, useEffect } from 'react';
import { tripService } from '../../../services/tripService';

export const useRecentTrips = () => {
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

  return recentTrips;
};

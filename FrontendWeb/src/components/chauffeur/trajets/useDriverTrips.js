import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDriverContext } from '../../../context/DriverContext';
import { tripService } from '../../../services/tripService';
import { socketService } from '../../../services/socketService';
import { getFullAssetURL } from '../../../utils/urlHelper';

const mapBackendStatus = (statut) => {
  switch (statut) {
    case 'ACCEPTEE': return 'accepted';
    case 'ASSIGNEE': return 'in_progress';
    case 'ARRIVEE': return 'in_progress';
    case 'EN_COURS': return 'in_progress';
    case 'TERMINEE': return 'completed';
    case 'ANNULEE': case 'ANNULEE_AVEC_FRAIS': return 'cancelled';
    case 'EN_COURS_DE_RECUPERATION': return 'accepted';
    default: return 'pending';
  }
};

export const useDriverTrips = ({ t }) => {
  const { isOnline, activeTrip, acceptTripRequest, rejectTripRequest } = useDriverContext();
  const navigate = useNavigate();

  const [backendTrips, setBackendTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('pending');

  const fetchTrips = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);

      const [availableRes, pickupRes] = await Promise.all([
        tripService.getAvailableTrips(),
        tripService.getPickupTrips()
      ]);

      let allTrips = [];
      const formatPhotoUrl = (url) => getFullAssetURL(url);

      // 1. Traiter les réservations "EN_ATTENTE" (disponibles)
      if (availableRes.data && availableRes.data.succes) {
        const available = availableRes.data.courses.map(c => ({
          id: c._id,
          passengerName: c.passager ? `${c.passager.prenom} ${c.passager.nom}` : t('common.anonymous'),
          passengerRating: c.passager?.noteMoyenne || 5,
          passengerPhoto: formatPhotoUrl(c.passager?.photoUrl),
          pickupAddress: c.depart,
          destinationAddress: c.destination,
          distance: `${c.distanceKm} km`,
          estimatedTime: `${c.dureeMin} min`,
          estimatedFare: c.prix,
          status: 'pending',
          requestedTime: new Date(c.createdAt),
          typeVehicule: c.typeVehicule,
          typeCourse: c.typeCourse,
          priority: c.typeCourse === 'IMMEDIATE' ? 'high' : 'medium'
        }));
        allTrips = [...allTrips, ...available];
      }

      // 2. Traiter les réservations acceptées / en cours (ramassage)
      if (pickupRes.data && pickupRes.data.succes) {
        const pickup = pickupRes.data.courses.map(c => ({
          id: c._id,
          passengerName: c.passager ? `${c.passager.prenom} ${c.passager.nom}` : t('common.anonymous'),
          passengerRating: c.passager?.noteMoyenne || 5,
          passengerPhoto: formatPhotoUrl(c.passager?.photoUrl),
          pickupAddress: c.depart,
          destinationAddress: c.destination,
          distance: `${c.distanceKm} km`,
          estimatedTime: `${c.dureeMin} min`,
          estimatedFare: c.prix,
          status: mapBackendStatus(c.statut),
          requestedTime: new Date(c.createdAt),
          typeVehicule: c.typeVehicule,
          typeCourse: c.typeCourse,
          priority: c.typeCourse === 'IMMEDIATE' ? 'high' : 'medium'
        }));
        allTrips = [...allTrips, ...pickup];
      }

      setBackendTrips(allTrips);
    } catch (error) {
      console.error("Erreur lors de la récupération des trajets", error);
      toast.error(t('trips.error_loading'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTrips();

    // ÉCOUTEURS TEMPS RÉEL (Socket.io)
    // Dès qu'une action importante a lieu sur le serveur, on rafraîchit la liste
    const handleSocketUpdate = () => {
      console.log("🔄 Mise à jour temps réel reçue via Socket");
      fetchTrips(true);
    };

    socketService.on("course:demande", handleSocketUpdate);
    socketService.on("course:acceptee_confirmation", handleSocketUpdate);
    socketService.on("course:deja_prise", handleSocketUpdate);
    socketService.on("course:annulee", handleSocketUpdate);
    socketService.on("course:terminee", handleSocketUpdate);
    socketService.on("reservation:planifiee_creee", handleSocketUpdate);
    socketService.on("reservation:planifiee_acceptee", handleSocketUpdate);
    socketService.on("reservation:planifiee_prise", handleSocketUpdate);

    // Rafraîchir toutes les 60 secondes en fallback de sécurité
    const interval = setInterval(() => fetchTrips(true), 60000);

    return () => {
      clearInterval(interval);
      socketService.off("course:demande", handleSocketUpdate);
      socketService.off("course:acceptee_confirmation", handleSocketUpdate);
      socketService.off("course:deja_prise", handleSocketUpdate);
      socketService.off("course:annulee", handleSocketUpdate);
      socketService.off("course:terminee", handleSocketUpdate);
      socketService.off("reservation:planifiee_creee", handleSocketUpdate);
      socketService.off("reservation:planifiee_acceptee", handleSocketUpdate);
      socketService.off("reservation:planifiee_prise", handleSocketUpdate);
    };
  }, [fetchTrips]);

  // Redirection automatique vers le tracking une fois la course acceptée côté serveur
  useEffect(() => {
    if (activeTrip?.id && (activeTrip.status === 'accepted' || activeTrip.status === 'in_progress')) {
      console.log("🎯 [TRAJETS] Course active détectée, redirection tracking...");
      navigate('/chauffeur/tracking');
    }
  }, [activeTrip?.id, activeTrip?.status, navigate]);

  const handleAccept = useCallback((id) => {
    try {
      toast.loading(t('common.processing'), { id: 'accepting-trip' });
      acceptTripRequest(id);
    } catch (error) {
      toast.error("Erreur d'initialisation", { id: 'accepting-trip' });
    }
  }, [acceptTripRequest, t]);

  const handleRefuse = useCallback((id) => {
    try {
      rejectTripRequest(id);
      toast.success(t('common.success'));
      fetchTrips(true);
    } catch (error) {
      toast.error("Erreur de refus");
    }
  }, [rejectTripRequest, fetchTrips, t]);

  // Statistiques
  const stats = {
    total: backendTrips.length,
    pending: backendTrips.filter(t => t.status === 'pending').length,
    active: backendTrips.filter(t => t.status === 'accepted' || t.status === 'in_progress').length,
    totalEarnings: backendTrips
      .filter(t => t.status === 'completed')
      .reduce((sum, trip) => sum + trip.estimatedFare, 0)
  };

  // Filtrer les trajets
  const filteredTrips = backendTrips.filter(trip => {
    if (selectedStatus !== 'all' && trip.status !== selectedStatus) return false;
    return true;
  });

  return {
    isOnline,
    backendTrips,
    loading,
    refreshing,
    selectedStatus,
    setSelectedStatus,
    fetchTrips,
    handleAccept,
    handleRefuse,
    stats,
    filteredTrips,
    navigate,
  };
};

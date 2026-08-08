import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { usePassenger } from '../../context/PassengerContext';
import { tripService } from '../../services/tripService';
import socketService from '../../services/socketService';

// Gère la création d'une réservation : ouverture du modal de confirmation,
// envoi au backend, puis démarrage de la recherche d'un chauffeur (course immédiate)
// ou passage en planifiée.
export const useTripBooking = ({ clearTimers, searchTimeoutRef, setShowTripStatusModal }) => {
  const {
    currentTrip, setCurrentTrip,
    tripStatus, setTripStatus,
    setSelectedDriver: setCurrentDriver,
  } = usePassenger();

  const [showTripModal, setShowTripModal] = useState(false);

  const handleBookTrip = (tripData) => {
    setCurrentTrip(tripData);
    setShowTripModal(true);
  };

  const handleConfirmTrip = async (confirmedTripData, paymentResult = null) => {
    if (!currentTrip) throw new Error('Aucun trajet à confirmer');

    const momentPaiement = confirmedTripData.paymentTime === 'advance' ? 'MAINTENANT' : 'APRES';
    const typeCourse = confirmedTripData.tripType === 'now' ? 'IMMEDIATE' : 'PLANIFIEE';

    const paiementRequis = momentPaiement === 'MAINTENANT';
    if (paiementRequis && !paymentResult?.success) {
      throw new Error('Paiement requis avant de confirmer la réservation.');
    }

    const payload = {
      depart: currentTrip.depart ?? currentTrip.pickup,
      destination: currentTrip.destination,
      departLat: currentTrip.departLat ?? currentTrip.pickupCoords?.[0],
      departLng: currentTrip.departLng ?? currentTrip.pickupCoords?.[1],
      destinationLat: currentTrip.destinationLat ?? currentTrip.destinationCoords?.[0],
      destinationLng: currentTrip.destinationLng ?? currentTrip.destinationCoords?.[1],
      distanceKm: currentTrip.distanceKm,
      dureeMin: currentTrip.dureeMin,
      typeVehicule: confirmedTripData.vehicleType || currentTrip.vehicleType || 'taxi',
      prix: String(confirmedTripData.price ?? currentTrip.estimatedPrice ?? '').replace(/[^0-9]/g, ''),
      momentPaiement,
      typeCourse,
      date: confirmedTripData.scheduleDate, // Requis pour les réservations planifiées
      heure: confirmedTripData.scheduleTime, // Requis pour les réservations planifiées
      paymentResult: paiementRequis ? paymentResult : null,
    };

    const creatingToast = toast.loading('Création de la réservation...');
    try {
      const response =
        typeCourse === 'IMMEDIATE'
          ? await tripService.create(payload)
          : await tripService.createPlanned(payload);

      toast.dismiss(creatingToast);
      toast.success('Réservation créée !');

      const reservationId = response.data?.reservation?._id || response.data?.reservationId;

      setCurrentTrip((prev) => ({
        ...prev,
        ...confirmedTripData,
        ...payload,
        reservationId,
        id: reservationId || `TRIP-${Date.now()}`,
        typeCourse,
        // Garder le statut si déjà "driver_found" (via socket)
        status:
          prev?.status === 'driver_found'
            ? 'driver_found'
            : typeCourse === 'IMMEDIATE'
              ? 'searching'
              : 'scheduled',
        createdAt: prev?.createdAt || new Date().toISOString(),
      }));

      clearTimers();

      if (typeCourse === 'IMMEDIATE') {
        // Ne passer en 'searching' que si on n'a pas déjà trouvé un chauffeur (via socket)
        if (tripStatus !== 'driver_found' && tripStatus !== 'arrived') {
          toast.loading("🔍 Recherche d'un chauffeur...", { id: 'searching' });
          setTripStatus('searching');
        }

        searchTimeoutRef.current = setTimeout(() => {
          setTripStatus((prev) => {
            if (prev === 'searching') {
              toast.dismiss('searching');
              toast.error('Aucun chauffeur disponible. Veuillez réessayer.');

              if (reservationId) {
                // Appel API pour annuler la réservation et ré-créditer le solde du passager
                tripService.cancelAndRefund(reservationId).then(() => {
                  toast.success('Remboursement automatique effectué dans votre Portefeuille', { icon: '🔄' });
                }).catch(err => {
                  console.error("Erreur annulation/remboursement:", err);
                });
              }

              setCurrentTrip(null);
              setCurrentDriver(null);
              return 'idle';
            }
            return prev;
          });
        }, 120000);

        // join room RESERVATION_{id}
        if (reservationId) {
          socketService.onceConnected(() => {
            socketService.emit('reservation:join', { reservationId });
          });
        }
      } else {
        setTripStatus('scheduled');
        setShowTripStatusModal(true);
        toast.success('Course planifiée avec succès !');
      }
    } catch (error) {
      toast.dismiss(creatingToast);
      toast.dismiss('searching');
      throw error;
    }
  };

  // Fermer ce modal si une redirection vers le Wallet est déclenchée (depuis le modal de paiement)
  useEffect(() => {
    const handleGoToWallet = () => setShowTripModal(false);
    window.addEventListener('navigate-to-wallet', handleGoToWallet);
    return () => window.removeEventListener('navigate-to-wallet', handleGoToWallet);
  }, []);

  return { showTripModal, setShowTripModal, handleBookTrip, handleConfirmTrip };
};

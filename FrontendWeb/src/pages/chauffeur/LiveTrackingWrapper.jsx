import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDriverContext } from '../../context/DriverContext';
import TrajetEnTempReel from '../../components/suivisTrajet/TrajetEnTempReel';
import TrajetComplete from '../../components/suivisTrajet/TrajetComplete';
import { tripService } from '../../services/tripService';

const LiveTrackingWrapper = () => {
  const {
    acceptedTrips,
    driverLocation,
    setCurrentPickupTripId,
    setTripStep,
    setStatus
  } = useDriverContext();
  const navigate = useNavigate();
  const [showComplete, setShowComplete] = useState(false);
  const [completedTripData, setCompletedTripData] = useState(null);

  const mainTrip = acceptedTrips?.length > 0 ? acceptedTrips[0] : null;

  // S'il n'y a plus de trajet actif et qu'on n'est pas en train de voir l'écran de fin
  if (!mainTrip && !showComplete) return <Navigate to="/chauffeur/tracking" replace />;

  if (showComplete) {
    return (
      <TrajetComplete
        role="driver"
        trip={completedTripData || mainTrip}
        driver={{ name: "Vous", location: driverLocation }}
        onBack={() => setShowComplete(false)}
        onPaymentSuccess={() => {
          // Une fois payé, le chauffeur peut retourner au dashboard
          navigate("/chauffeur");
          // Libérer le chauffeur quand le trajet se termine (via socket)
          console.log("🏁 [ChauffeurApp] Trajet terminé, libération du statut (simulé)");
          setCurrentPickupTripId(null);
          setTripStep("idle");
          setStatus("available");
        }}
      />
    );
  }

  return (
    <TrajetEnTempReel
      role="driver"
      trip={mainTrip}
      driver={{
        name: "Vous",
        location: driverLocation,
        currentLocation: driverLocation,
        rating: 4.9,
        vehicle: { brand: "Toyota", model: "Van", plate: "TK-001-GK" },
      }}
      onBack={() => navigate("/chauffeur/tracking")}
      onEndTrip={async () => {
        // Priorité aux IDs Mongoose (_id) pour éviter les erreurs 400
        const tripId = mainTrip?._id || mainTrip?.reservationId || mainTrip?.id;

        if (tripId) {
          // Verrouiller les données avant de terminer
          setCompletedTripData(mainTrip);

          try {
            console.log("🏁 [ChauffeurApp] Tentative de clôture du trajet ID:", tripId);
            const response = await tripService.complete(tripId);
            console.log("✅ [ChauffeurApp] Trajet clôturé avec succès:", response.data);
          } catch (err) {
            console.error("❌ [ChauffeurApp] Erreur 400/500 lors de la clôture:", err.response?.data || err.message);
          }
        }
        setShowComplete(true);
      }}
    />
  );
};

export default LiveTrackingWrapper;

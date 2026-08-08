// components/passager/RealTimeTracking.jsx
import QRScannerWeb from '../common/QRScannerWeb';
import EmergencyButton from '../passager/EmergencyButton';
import FloatingDisputeButton from '../shared/FloatingDisputeButton';
import { useRealTimeTracking } from './tracking/useRealTimeTracking';
import TrackingHeader from './tracking/TrackingHeader';
import EmptyTripState from './tracking/EmptyTripState';
import TripProgressCard from './tracking/TripProgressCard';
import TrackingMap from './tracking/TrackingMap';
import ETACard from './tracking/ETACard';
import QuickActionsCard from './tracking/QuickActionsCard';
import PaymentDetailsCard from './tracking/PaymentDetailsCard';
import NotificationToast from './tracking/NotificationToast';

const RealTimeTracking = ({
  role = 'passenger',
  trip,
  driver,
  onBack,
  onEmergency,
  onContactDriver,
  onCancelTrip,
  onEndTrip,
  onShareTrip
}) => {
  const {
    driverCtx,
    driverPosition,
    passengerPosition,
    progress,
    isTripEnded,
    speed,
    currentTime,
    showNotification,
    notification,
    estimatedArrival,
    isSimulating,
    showScanner,
    setShowScanner,
    mapRef,
    remoteIsSimulatingRef,
    tripData,
    realTimeMetrics,
    handleContactDriver,
    handleEndTrip,
    handleShareTrip,
    handleQRScanSuccess,
    toggleSimulation,
  } = useRealTimeTracking({ role, trip, driver, onContactDriver, onCancelTrip, onEndTrip, onShareTrip });

  // Si aucun trajet n'est fourni, afficher un message
  if (!trip) {
    return <EmptyTripState onBack={onBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-100  bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-800  dark:bg-slate-900  dark:text-slate-100 font-poppins transition-colors duration-300">
      <TrackingHeader destinationName={tripData.destination.name} currentTime={currentTime} onBack={onBack} />

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <TripProgressCard
          isTripEnded={isTripEnded}
          tripData={tripData}
          progress={progress}
          realTimeMetrics={realTimeMetrics}
          estimatedArrival={estimatedArrival}
          speed={speed}
          role={role}
          driverCtx={driverCtx}
          trip={trip}
        />

        {/* Carte et Informations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte */}
          <div className="lg:col-span-2">
            <TrackingMap
              mapRef={mapRef}
              tripData={tripData}
              driverPosition={driverPosition}
              passengerPosition={passengerPosition}
              role={role}
              trip={trip}
              isSimulating={isSimulating}
              remoteIsSimulatingRef={remoteIsSimulatingRef}
              isTripEnded={isTripEnded}
              onToggleSimulation={toggleSimulation}
            />
          </div>

          {/* Panneau latéral */}
          <div className="space-y-6">
            <ETACard
              estimatedArrival={estimatedArrival}
              formattedDuration={realTimeMetrics?.formattedDuration}
              totalDistance={tripData.trip.totalDistance}
              totalDuration={tripData.trip.totalDuration}
            />

            <QuickActionsCard
              role={role}
              isTripEnded={isTripEnded}
              onContactDriver={handleContactDriver}
              onShareTrip={handleShareTrip}
              onOpenScanner={() => setShowScanner(true)}
              onEndTrip={handleEndTrip}
            />

            <PaymentDetailsCard price={tripData.trip.price} paymentMethod={tripData.trip.paymentMethod} />
          </div>
        </div>
      </div>

      <NotificationToast show={showNotification} notification={notification} />

      <FloatingDisputeButton
        currentTrip={trip}
        role={role === 'driver' ? 'chauffeur' : 'passager'}
        offset={10}
      />
      <EmergencyButton />

      {showScanner && (
        <QRScannerWeb
          onScanSuccess={handleQRScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

// Valeurs par défaut pour les props
RealTimeTracking.defaultProps = {
  trip: null,
  driver: null,
  onBack: () => console.log('Retour'),
  onEmergency: (data) => console.log('Urgence:', data),
  onContactDriver: (phone) => console.log('Contacter:', phone),
  onCancelTrip: () => console.log('Annuler trajet'),
  onEndTrip: () => console.log('Terminer trajet'),
  onShareTrip: (data) => console.log('Partager:', data)
};

export default RealTimeTracking;

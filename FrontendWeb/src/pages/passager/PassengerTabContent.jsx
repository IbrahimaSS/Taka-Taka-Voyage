import { Suspense, lazy } from 'react';
import { Users } from 'lucide-react';
import BookingSection from '../../components/passager/BookingSection';
import Loading from '../../components/admin/ui/Loading';

// BookingSection ("home") reste eager : c'est l'onglet par defaut affiche a
// la connexion. Les 9 autres ne sont charges qu'au clic de l'utilisateur sur
// l'onglet correspondant (un seul actif a la fois, comme des routes).
const TripsHistory = lazy(() => import('../../components/passager/TripsHistory'));
const RentalHistory = lazy(() => import('../../components/passager/RentalHistory'));
const Transactions = lazy(() => import('../../components/passager/Paiement'));
const Evaluations = lazy(() => import('../../components/passager/Evaluation'));
const Profile = lazy(() => import('../../components/passager/Profile'));
const Wallet = lazy(() => import('../../components/passager/Wallet'));
const Settings = lazy(() => import('../../components/passager/Settings'));
const Planning = lazy(() => import('../../components/passager/Planning'));
const Support = lazy(() => import('../../components/passager/Support'));

const PassengerTabContent = ({
  activeTab, onBookTrip, currentTrip, currentDriver, tripStatus, isOnMapView,
  onShowTracking, onGoToHome,
}) => {
  if (activeTab === 'home') {
    return (
      <BookingSection
        onBookTrip={onBookTrip}
        currentTrip={currentTrip}
        currentDriver={currentDriver}
        tripStatus={tripStatus}
        isOnMapView={isOnMapView}
        onShowTracking={onShowTracking}
      />
    );
  }

  return (
    <Suspense fallback={<Loading className="min-h-[60vh]" />}>
      {(() => {
        switch (activeTab) {
          case 'history':
          case 'history_vtc':
            return <TripsHistory />;
          case 'history_rental':
            return <RentalHistory />;
          case 'history_covoiturage':
            return (
              <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
                <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Covoiturage</h2>
                <p className="text-gray-500">Bientôt disponible sur votre application.</p>
              </div>
            );
          case 'payments':
            return <Transactions />;
          case 'evaluations':
            return <Evaluations />;
          case 'profile':
            return <Profile />;
          case 'wallet':
            return <Wallet />;
          case 'settings':
            return <Settings />;
          case 'planning':
            return <Planning onBookNewTrip={onGoToHome} />;
          case 'support':
            return <Support />;
          default:
            return <BookingSection onBookTrip={onBookTrip} />;
        }
      })()}
    </Suspense>
  );
};

export default PassengerTabContent;

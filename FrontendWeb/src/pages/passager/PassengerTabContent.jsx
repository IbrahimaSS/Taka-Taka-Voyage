import { Users } from 'lucide-react';
import BookingSection from '../../components/passager/BookingSection';
import TripsHistory from '../../components/passager/TripsHistory';
import RentalHistory from '../../components/passager/RentalHistory';
import Transactions from '../../components/passager/Paiement';
import Evaluations from '../../components/passager/Evaluation';
import Profile from '../../components/passager/Profile';
import Wallet from '../../components/passager/Wallet';
import Settings from '../../components/passager/Settings';
import Planning from '../../components/passager/Planning';
import Support from '../../components/passager/Support';

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
};

export default PassengerTabContent;

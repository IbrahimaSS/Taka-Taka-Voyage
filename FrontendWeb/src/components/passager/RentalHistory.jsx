import { AnimatePresence } from 'framer-motion';
import PremiumInvoice from '../admin/ui/PremiumInvoice';
import { useRentalHistory } from './rental/useRentalHistory';
import RentalFilterTabs from './rental/RentalFilterTabs';
import RentalEmptyState from './rental/RentalEmptyState';
import RentalCard from './rental/RentalCard';
import ReturnConfirmModal from './rental/ReturnConfirmModal';

const RentalHistory = () => {
  const {
    loading,
    activeFilter,
    setActiveFilter,
    confirmModal,
    setConfirmModal,
    selectedRentalForInvoice,
    setSelectedRentalForInvoice,
    filteredRentals,
    handleSignalerRetour,
    mapRentalToInvoice,
    getStatusStyle,
  } = useRentalHistory();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 animate-pulse font-medium">Chargement de vos locations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RentalFilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {filteredRentals.length === 0 ? (
        <RentalEmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRentals.map((rental) => (
              <RentalCard
                key={rental._id}
                rental={rental}
                statusStyle={getStatusStyle(rental.statut)}
                onSignalerRetour={() => setConfirmModal(rental._id)}
                onViewInvoice={() => setSelectedRentalForInvoice(rental)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <ReturnConfirmModal
        show={!!confirmModal}
        onCancel={() => setConfirmModal(null)}
        onConfirm={handleSignalerRetour}
      />

      {/* Affichage de la Facture Premium */}
      {selectedRentalForInvoice && (
        <PremiumInvoice
          payment={mapRentalToInvoice(selectedRentalForInvoice)}
          onClose={() => setSelectedRentalForInvoice(null)}
        />
      )}
    </div>
  );
};

export default RentalHistory;

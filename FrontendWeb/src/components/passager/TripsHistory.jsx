// components/passager/TripsHistory.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Composants UI réutilisables
import PremiumInvoice from '../admin/ui/PremiumInvoice';

// Context et services
import { usePassenger } from '../../context/PassengerContext';

import { useTripsHistory } from './history/useTripsHistory';
import TripsHistoryHeader from './history/TripsHistoryHeader';
import TripsStatsRow from './history/TripsStatsRow';
import TripsFilterBar from './history/TripsFilterBar';
import TripsTable from './history/TripsTable';
import TripsEmptyState from './history/TripsEmptyState';
import TripDetailsModal from './history/TripDetailsModal';

const TripsHistory = () => {
  const { t } = useTranslation();
  const { passenger } = usePassenger();

  const {
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    activeFilter, setActiveFilter,
    searchTerm, setSearchTerm,
    sortConfig, requestSort,
    statusFilters,
    filteredTrips, currentTrips,
    totalPages, startIndex, endIndex,
    stats,
    resetFilters,
  } = useTripsHistory();

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const handleContactDriver = (driverPhone) => {
    window.open(`tel:${driverPhone}`);
  };

  const handleShareTrip = (trip) => {
    const shareText = t('history.sharing.text', {
      date: trip.date,
      departure: trip.departure,
      destination: trip.destination,
      price: trip.price,
      rating: trip.rating
    });

    if (navigator.share) {
      navigator.share({
        title: 'Mon trajet TakaTaka',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success(t('history.sharing.copied'));
    }
  };

  const handleViewDetails = (trip) => {
    setSelectedTrip(trip);
    setShowDetailsModal(true);
  };

  const handleShowInvoice = (trip) => {
    // Fermer la modale de détails pour ne pas avoir d'overlay conflictuel
    setShowDetailsModal(false);

    // Transformer l'objet trajet pour qu'il soit compatible avec PremiumInvoice
    const formattedInvoice = {
      invoiceNumber: `INV-${trip.id.substring(0, 8)}`.toUpperCase(),
      date: trip.date,
      transactionId: trip.id,
      status: 'paid', // Historique passager = trajets complétés et payés
      method: trip.payment || 'ESPECES',
      amount: trip.price,
      passenger: {
        name: [passenger?.prenom, passenger?.nom].filter(Boolean).join(' ').trim() || '-',
        phone: passenger?.telephone || passenger?.phone || '-',
        email: passenger?.email || passenger?.mail || '-'
      },
      driver: {
        name: trip.driver?.name || 'Chauffeur TakaTaka',
        vehicle: trip.driver?.vehicle || 'Véhicule standard',
        phone: trip.driver?.phone || '-',
        email: trip.driver?.email || '-'
      },
      trip: {
        route: `${trip.departure} → ${trip.destination}`,
        distance: trip.distance ? (trip.distance.includes('km') ? trip.distance : `${trip.distance} km`) : '-',
        duration: trip.duration || '0 min'
      },
      fees: {
        platform: 'Incl.'
      }
    };
    setInvoiceData(formattedInvoice);
    setShowInvoice(true);
  };

  return (
    <div className="min-h-screen  pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <TripsHistoryHeader filteredTrips={filteredTrips} onResetFilters={resetFilters} />

        <TripsStatsRow stats={stats} />

        <TripsFilterBar
          statusFilters={statusFilters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <AnimatePresence mode="wait">
          {filteredTrips.length > 0 ? (
            <TripsTable
              currentTrips={currentTrips}
              sortConfig={sortConfig}
              onRequestSort={requestSort}
              onViewDetails={handleViewDetails}
              onShareTrip={handleShareTrip}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={filteredTrips.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
            />
          ) : (
            <TripsEmptyState onResetFilters={resetFilters} />
          )}
        </AnimatePresence>
      </div>

      {/* Modale de détails */}
      <TripDetailsModal
        trip={selectedTrip}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onShare={() => selectedTrip && handleShareTrip(selectedTrip)}
        onContact={() => selectedTrip?.driver?.phone && handleContactDriver(selectedTrip.driver.phone)}
        onShowInvoice={handleShowInvoice}
      />

      {/* Aperçu Facture */}
      <AnimatePresence>
        {showInvoice && (
          <PremiumInvoice
            payment={invoiceData}
            onClose={() => setShowInvoice(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripsHistory;

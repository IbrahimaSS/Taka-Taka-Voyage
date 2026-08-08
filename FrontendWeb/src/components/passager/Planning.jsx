// components/passager/Planning.jsx
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import planningService from '../../services/planningService';

import { usePlanningData } from './planning/usePlanningData';
import PlanningHeader from './planning/PlanningHeader';
import PlanningStatsRow from './planning/PlanningStatsRow';
import PlanningFilterBar from './planning/PlanningFilterBar';
import PlanningCalendarSidebar from './planning/PlanningCalendarSidebar';
import PlanningTripsList from './planning/PlanningTripsList';
import TripDetailsModal from './planning/TripDetailsModal';

const Planning = ({ onBookNewTrip }) => {
  const {
    scheduledTrips, stats, loading,
    searchTerm, setSearchTerm,
    selectedDate, setSelectedDate,
    calendarDate, setCalendarDate,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    activeFilter, setActiveFilter,
    activeVehicleFilter, setActiveVehicleFilter,
    tripDates,
    fetchPlanningData,
    resetFilters,
  } = usePlanningData();

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleTripClick = (trip) => {
    setSelectedTrip(trip);
    setShowModal(true);
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      const res = await planningService.cancelPlanning(tripId);
      if (res.succes) {
        toast.success('Trajet annulé avec succès');
        setShowModal(false);
        fetchPlanningData();
      }
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'annulation");
    }
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PlanningHeader scheduledTrips={scheduledTrips} onBookNewTrip={onBookNewTrip} />

        <PlanningStatsRow stats={stats} />

        <PlanningFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          activeVehicleFilter={activeVehicleFilter}
          onVehicleFilterChange={setActiveVehicleFilter}
        />

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <PlanningCalendarSidebar
            calendarDate={calendarDate}
            onCalendarChange={setCalendarDate}
            tripDates={tripDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onResetToday={() => { setCalendarDate(new Date()); setSelectedDate(null); }}
            onPageReset={() => setCurrentPage(1)}
          />

          <PlanningTripsList
            loading={loading}
            scheduledTrips={scheduledTrips}
            stats={stats}
            selectedDate={selectedDate}
            onTripClick={handleTripClick}
            onResetFilters={resetFilters}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <TripDetailsModal
        trip={selectedTrip}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onDelete={handleDeleteTrip}
        onDownload={() => {
          toast.success('Reçu téléchargé');
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default Planning;

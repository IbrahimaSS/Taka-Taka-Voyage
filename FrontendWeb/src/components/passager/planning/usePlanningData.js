import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import planningService from '../../../services/planningService';
import { socketService } from '../../../services/socketService';

export const usePlanningData = () => {
  const { i18n } = useTranslation();

  const [scheduledTrips, setScheduledTrips] = useState([]);
  const [stats, setStats] = useState({ totalTrajets: 0, confirmes: 0, enAttente: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeVehicleFilter, setActiveVehicleFilter] = useState('all');

  const fetchPlanningData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        statut: activeFilter === 'all' ? undefined : activeFilter,
        typeVehicule: activeVehicleFilter === 'all' ? undefined : activeVehicleFilter,
        q: searchTerm || undefined,
        dateFrom: selectedDate || undefined,
        dateTo: selectedDate || undefined
      };

      const res = await planningService.getPlanning(params);
      if (res.succes) {
        const formatted = res.plannings.map(t => ({
          id: t._id,
          date: new Date(t.datePlanifiee).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US'),
          time: new Date(t.datePlanifiee).toLocaleTimeString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          pickup: t.depart,
          destination: t.destination,
          vehicle: t.typeVehicule,
          passengers: t.passagers || 1,
          price: `${(t.prix || 0).toLocaleString()} FG`,
          status: t.statut,
          driver: t.chauffeur,
          distanceKm: t.distanceKm
        }));
        setScheduledTrips(formatted);
        setStats(res.stats);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du planning:", error);
      toast.error("Impossible de charger votre planning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanningData();

    const handleSocketUpdate = () => {
      console.log("🔄 Mise à jour planning passager reçue");
      fetchPlanningData();
    };

    socketService.on("reservation:planifiee_acceptee", handleSocketUpdate);
    socketService.on("course:annulee", handleSocketUpdate);

    return () => {
      socketService.off("reservation:planifiee_acceptee", handleSocketUpdate);
      socketService.off("course:annulee", handleSocketUpdate);
    };
  }, [currentPage, itemsPerPage, activeFilter, activeVehicleFilter, searchTerm, selectedDate]);

  const tripDates = useMemo(() => {
    return scheduledTrips.reduce((acc, trip) => {
      // Pour une meilleure précision du calendrier, on pourrait avoir besoin de tous les trajets (pas que la page actuelle)
      // Mais ici on utilise ce qu'on a. Idéalement le backend renverrait les jours occupés.
      const dateParts = trip.date.split('/');
      const d = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`).toDateString();
      if (!acc[d]) acc[d] = [];
      acc[d].push(trip.status);
      return acc;
    }, {});
  }, [scheduledTrips]);

  const resetFilters = () => {
    setActiveFilter('all');
    setActiveVehicleFilter('all');
    setSearchTerm('');
    setSelectedDate(null);
    setCalendarDate(new Date());
    toast.success('Filtres réinitialisés');
  };

  return {
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
  };
};

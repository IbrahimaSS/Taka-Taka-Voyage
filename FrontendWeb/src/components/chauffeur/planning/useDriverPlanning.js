import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../services/apiClient';
import { tripService } from '../../../services/tripService';
import { socketService } from '../../../services/socketService';
import { useDriverContext } from '../../../context/DriverContext';

export const useDriverPlanning = ({ t, i18n }) => {
  const navigate = useNavigate();
  const { refreshActiveTrips } = useDriverContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingReservation, setEditingReservation] = useState(null);
  const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 });
  const [reservationsData, setReservationsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewingDetails, setViewingDetails] = useState(null);

  const actionMenuRef = useRef(null);

  const fetchPlannings = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const response = await tripService.getDriverPlannings();
      if (response.data.succes) {
        const formatted = {};
        response.data.plannings.forEach(res => {
          const dateStr = new Date(res.datePlanifiee).toISOString().split('T')[0];
          if (!formatted[dateStr]) formatted[dateStr] = [];

          formatted[dateStr].push({
            id: res._id,
            client: res.passager ? `${res.passager.nom} ${res.passager.prenom}` : t('planning.unknown_passenger'),
            phone: res.passager?.telephone,
            time: new Date(res.datePlanifiee).toLocaleTimeString(i18n.language === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' }),
            from: res.depart,
            to: res.destination,
            status: res.statut === 'ACCEPTEE' ? 'confirmée' : res.statut.toLowerCase(),
            raw: res
          });
        });
        setReservationsData(formatted);
      }
    } catch (error) {
      console.error("Erreur chargement plannings:", error);
      if (!isSilent) toast.error("Impossible de charger votre planning");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlannings();

    const handleUpdate = () => {
      console.log("🔄 Mise à jour planning reçue");
      fetchPlannings(true);
    };

    socketService.on("reservation:planifiee_creee", handleUpdate);
    socketService.on("reservation:planifiee_acceptee", handleUpdate);
    socketService.on("reservation:planifiee_prise", handleUpdate);
    socketService.on("course:annulee", handleUpdate);

    return () => {
      socketService.off("reservation:planifiee_creee", handleUpdate);
      socketService.off("reservation:planifiee_acceptee", handleUpdate);
      socketService.off("reservation:planifiee_prise", handleUpdate);
      socketService.off("course:annulee", handleUpdate);
    };
  }, [fetchPlannings]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setEditingReservation(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Positionne le menu d'actions en le maintenant dans les limites du viewport
  // (evite qu'il soit coupe hors ecran sur mobile pres des bords)
  const handleActionClick = (event, reservationId) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 160; // correspond a w-40
    const margin = 8;
    const x = Math.max(margin, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - margin));
    setActionPosition({ x, y: rect.bottom + 5 });
    setEditingReservation(reservationId);
  };

  const handleCall = (phone) => {
    if (phone) {
      window.open(`tel:${phone}`);
    } else {
      toast.error(t('common.phone_not_available'));
    }
    setEditingReservation(null);
  };

  const handleStartTrip = async (reservationId) => {
    try {
      setLoading(true);

      // Appel API backend : ACCEPTEE → EN_COURS_DE_RECUPERATION
      // Le backend valide l'heure (15 min avant max) et transfère dans la file de ramassage
      const response = await apiClient.patch(`/chauffeur/planifiee/${reservationId}/commencer`);

      if (response.data.succes) {
        toast.success(response.data.message || 'Course planifiée démarrée !');

        // Rafraîchir le planning (la réservation disparaîtra car elle n'est plus ACCEPTEE)
        fetchPlannings(true);

        // Rafraîchir les courses actives dans le contexte chauffeur
        if (refreshActiveTrips) refreshActiveTrips();

        // Redirection vers l'écran de ramassage après un court délai
        setTimeout(() => {
          navigate('/chauffeur/tracking');
        }, 800);
      } else {
        toast.error(response.data.message || 'Impossible de démarrer');
      }
    } catch (error) {
      console.error("Erreur commencer planifiée:", error);
      const msg = error?.response?.data?.message || 'Erreur lors du démarrage';
      toast.error(msg);
    } finally {
      setLoading(false);
      setEditingReservation(null);
    }
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      setLoading(true);
      let response;
      if (newStatus === 'confirmée') {
        response = await tripService.accept(reservationId);
      } else {
        response = await tripService.cancel(reservationId, { reason: "Annulé par le chauffeur" });
      }

      if (response.data.succes) {
        toast.success(t('common.save_success'));
        fetchPlannings();
      } else {
        toast.error(response.data.message || t('common.error'));
      }
    } catch (error) {
      console.error("Erreur update status:", error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
      setEditingReservation(null);
    }
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  const getMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const firstDayOfWeek = firstDay.getDay();
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    for (let i = startOffset; i > 0; i--) {
      days.push(new Date(year, month, -i + 1));
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    const totalCells = 35;
    while (days.length < totalCells) {
      const nextDate = new Date(year, month + 1, days.length - lastDay.getDate() + 1);
      days.push(nextDate);
    }

    return days;
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysGrid = getMonthDays(currentYear, currentMonth);
  const weekDays = i18n.language === 'en'
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const selectedKey = formatDateKey(selectedDate);
  const selectedReservations = reservationsData[selectedKey] || [];

  return {
    currentDate,
    selectedDate,
    setSelectedDate,
    editingReservation,
    setEditingReservation,
    actionPosition,
    loading,
    viewingDetails,
    setViewingDetails,
    actionMenuRef,
    reservationsData,
    handleActionClick,
    handleCall,
    handleStartTrip,
    updateReservationStatus,
    formatDateKey,
    formatDisplayDate,
    isToday,
    isSameDay,
    currentMonth,
    daysGrid,
    weekDays,
    formatMonthYear,
    prevMonth,
    nextMonth,
    goToToday,
    selectedReservations,
  };
};

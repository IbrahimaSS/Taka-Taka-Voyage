import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../services/apiClient";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  Car as CarIcon,
  Phone,
  Play,
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Clock,
  MapPin,
  MoreVertical,
  CheckCircle,
  XCircle,
  Info,
  CreditCard,
  Navigation,
  Eye
} from "lucide-react";
import { tripService } from "../../services/tripService";
import { socketService } from "../../services/socketService";
import { useDriverContext } from "../../context/DriverContext";

const Planning = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { refreshActiveTrips, startPlannedTrip } = useDriverContext();
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

  const handleActionClick = (event, reservationId) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setActionPosition({
      x: rect.left - 120,
      y: rect.bottom + 5
    });
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

      // ✅ Appel API backend : ACCEPTEE → EN_COURS_DE_RECUPERATION
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmée': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'en attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'annulée': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
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

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            {t('planning.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t('planning.subtitle')}</p>
        </div>
        {loading && <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier COMPACT */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 dark:text-white" />
            </button>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {formatMonthYear(currentDate)}
            </h2>

            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 dark:text-white" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            {t('planning.today')}
          </button>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center font-medium text-gray-600 dark:text-gray-300 text-xs py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysGrid.map((date, index) => {
              const dayKey = formatDateKey(date);
              const hasReservations = reservationsData[dayKey];
              const isSelected = isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              const isCurrentMonth = date.getMonth() === currentMonth;

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    h-12 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all
                    ${isSelected
                      ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                  `}
                >
                  <div className="relative">
                    <span className={`
                      text-sm font-medium
                      ${isCurrentDay
                        ? 'text-blue-500 font-bold dark:text-blue-400'
                        : isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }
                    `}>
                      {date.getDate()}
                    </span>
                    {hasReservations && (
                      <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2
                        ${reservationsData[dayKey].some(r => r.status === 'confirmée') ? 'w-1.5 h-1.5 bg-green-500' :
                          'w-1.5 h-1.5 bg-yellow-500'} rounded-full`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-600 dark:text-gray-400">{t('planning.today')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-600 dark:text-gray-400">{t('planning.confirmed')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600 dark:text-gray-400">{t('planning.pending')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau des réservations détaillées */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  {formatDisplayDate(selectedDate)}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedReservations.filter(r => r.status === 'confirmée').length} {t('planning.confirmed')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedReservations.length} {t('planning.trips_found')}
                </span>
                <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <CarIcon className="w-4 h-4 text-blue-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-3">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 font-medium text-gray-700 dark:text-gray-300">{t('planning.passenger')}</div>
                <div className="col-span-2 font-medium text-gray-700 dark:text-gray-300">{t('planning.time')}</div>
                <div className="col-span-4 font-medium text-gray-700 dark:text-gray-300">{t('planning.trip')}</div>
                <div className="col-span-2 font-medium text-gray-700 dark:text-gray-300">{t('planning.status')}</div>
                <div className="col-span-1 font-medium text-gray-700 dark:text-gray-300"></div>
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
              {selectedReservations.length > 0 ? (
                selectedReservations.map((reservation) => (
                  <div key={reservation.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{reservation.client}</p>
                          <p className="text-[10px] text-gray-500 truncate">{reservation.id}</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-sm font-medium">{reservation.time}</span>
                        </div>
                      </div>
                      <div className="col-span-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-red-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{reservation.from}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{reservation.to}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      </div>
                      <div className="col-span-1 relative text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingDetails(reservation.raw)}
                          className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded text-blue-500 transition-colors"
                          title={t('common.details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => handleActionClick(e, reservation.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-400">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {editingReservation === reservation.id && (
                          <div
                            ref={actionMenuRef}
                            className="absolute z-10 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-40 overflow-hidden"
                            style={{ position: 'fixed', left: `${actionPosition.x - 20}px`, top: `${actionPosition.y}px` }}
                          >
                            <button
                              onClick={() => { setViewingDetails(reservation.raw); setEditingReservation(null); }}
                              className="flex items-center w-full px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                            >
                              <Info className="w-3.5 h-3.5 mr-2 text-primaryGreen-start" /> Détails
                            </button>
                            <button onClick={() => handleCall(reservation.phone)} className="flex items-center w-full px-3 py-2.5 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b border-gray-100 dark:border-gray-700 text-left">
                              <Phone className="w-3.5 h-3.5 mr-2" /> {t('planning.call')}
                            </button>
                            <button onClick={() => handleStartTrip(reservation.id)} className="flex items-center w-full px-3 py-2.5 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 border-b border-gray-100 dark:border-gray-700 text-left">
                              <Play className="w-3.5 h-3.5 mr-2" /> {t('planning.start')}
                            </button>
                            <button onClick={() => updateReservationStatus(reservation.id, 'confirmée')} className="flex items-center w-full px-3 py-2.5 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border-b border-gray-100 dark:border-gray-700 text-left text-left">
                              <CheckCircle className="w-3.5 h-3.5 mr-2" /> {t('common.confirm')}
                            </button>
                            <button onClick={() => updateReservationStatus(reservation.id, 'annulée')} className="flex items-center w-full px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 text-left">
                              <XCircle className="w-3.5 h-3.5 mr-2" /> {t('common.cancel')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t('planning.no_trips_found_title')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE DÉTAILS - PREMIUM UI */}
      {viewingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
            {/* Header Modal */}
            <div className="relative h-32 bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start p-6 flex items-end">
              <button
                onClick={() => setViewingDetails(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border-2 border-white overflow-hidden">
                  {viewingDetails.passager?.photo ? (
                    <img src={viewingDetails.passager.photo} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-blue-500" />
                  )}
                </div>
                <div className="text-white pb-1">
                  <h3 className="text-xl font-bold leading-tight">
                    {viewingDetails.passager?.prenom} {viewingDetails.passager?.nom}
                  </h3>
                  <p className="opacity-80 text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(viewingDetails.datePlanifiee).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Corps Modal */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Adresse et Trajet */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Départ</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{viewingDetails.depart}</p>
                  </div>
                </div>

                <div className="ml-3 border-l-2 border-dashed border-gray-200 dark:border-gray-700 h-6"></div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Destination</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{viewingDetails.destination}</p>
                  </div>
                </div>
              </div>

              {/* Infos Financières et Véhicule */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Prix Estimé</p>
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                    {(viewingDetails.prix || 0).toLocaleString()} GNF
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Véhicule</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200 capitalize flex items-center justify-center gap-1">
                    <CarIcon className="w-4 h-4 text-primaryGreen-start" />
                    {viewingDetails.typeVehicule?.toLowerCase() || 'Standard'}
                  </p>
                </div>
              </div>

              {/* Détails complémentaires */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">Méthode de Paiement</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded uppercase">
                    {viewingDetails.paiement?.methode || 'CASH'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Date de réservation</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {formatDisplayDate(new Date(viewingDetails.datePlanifiee))}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => handleCall(viewingDetails.passager?.telephone)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-800 border-2 border-primaryBlue-start text-primaryBlue-start hover:bg-primaryBlue-start hover:text-white rounded-xl font-bold transition-all active:scale-95"
              >
                <Phone className="w-4 h-4" /> Appeler
              </button>
              {viewingDetails.statut === 'ACCEPTEE' && (
                <button
                  onClick={() => handleStartTrip(viewingDetails._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start text-white rounded-xl font-bold transition-all shadow-lg shadow-primaryGreen-start/20 active:scale-95 border-0 hover:brightness-110"
                >
                  <Navigation className="w-4 h-4" /> Démarrer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planning;

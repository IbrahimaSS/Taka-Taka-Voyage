import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Car,
  MapPin,
  User,
  DollarSign,
  Calendar,
  Navigation,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDriverContext } from '../../context/DriverContext';
import Badge from '../../ui/Badge';
import { tripService } from '../../services/tripService';
import { socketService } from '../../services/socketService';
import { toast } from 'react-hot-toast';

const SERVER_URL = "http://localhost:5000";

const Trajets = () => {
  const { t, i18n } = useTranslation();
  const { isOnline, activeTrip, setActiveTrip } = useDriverContext();
  const navigate = useNavigate();

  // États pour les données
  const [backendTrips, setBackendTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // États pour les filtres
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchTrips = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);

      const [availableRes, pickupRes] = await Promise.all([
        tripService.getAvailableTrips(),
        tripService.getPickupTrips()
      ]);

      let allTrips = [];

      const formatPhotoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${SERVER_URL}${url}`;
      };

      // 1. Traiter les réservations "EN_ATTENTE" (disponibles)
      if (availableRes.data && availableRes.data.succes) {
        const available = availableRes.data.courses
          // FILTRE: Ne pas afficher les réservations prévues dans la file d'attente
          .filter(c => c.typeCourse !== 'PREVUE')
          .map(c => ({
            id: c._id,
            passengerName: c.passager ? `${c.passager.prenom} ${c.passager.nom}` : t('common.anonymous'),
            passengerRating: c.passager?.noteMoyenne || 5,
            passengerPhoto: formatPhotoUrl(c.passager?.photoUrl),
            pickupAddress: c.depart,
            destinationAddress: c.destination,
            distance: `${c.distanceKm} km`,
            estimatedTime: `${c.dureeMin} min`,
            estimatedFare: c.prix,
            status: 'pending',
            requestedTime: new Date(c.createdAt),
            typeVehicule: c.typeVehicule,
            typeCourse: c.typeCourse,
            priority: c.typeCourse === 'IMMEDIATE' ? 'high' : 'medium'
          }));
        allTrips = [...allTrips, ...available];
      }

      // 2. Traiter les réservations acceptées / en cours (ramassage)
      if (pickupRes.data && pickupRes.data.succes) {
        const pickup = pickupRes.data.courses.map(c => ({
          id: c._id,
          passengerName: c.passager ? `${c.passager.prenom} ${c.passager.nom}` : t('common.anonymous'),
          passengerRating: c.passager?.noteMoyenne || 5,
          passengerPhoto: formatPhotoUrl(c.passager?.photoUrl),
          pickupAddress: c.depart,
          destinationAddress: c.destination,
          distance: `${c.distanceKm} km`,
          estimatedTime: `${c.dureeMin} min`,
          estimatedFare: c.prix,
          status: mapBackendStatus(c.statut),
          requestedTime: new Date(c.createdAt),
          typeVehicule: c.typeVehicule,
          typeCourse: c.typeCourse,
          priority: c.typeCourse === 'IMMEDIATE' ? 'high' : 'medium'
        }));
        allTrips = [...allTrips, ...pickup];
      }

      setBackendTrips(allTrips);
    } catch (error) {
      console.error("Erreur lors de la récupération des trajets", error);
      toast.error(t('trips.error_loading'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTrips();

    // ÉCOUTEURS TEMPS RÉEL (Socket.io)
    // Dès qu'une action importante a lieu sur le serveur, on rafraîchit la liste
    const handleSocketUpdate = () => {
      console.log("🔄 Mise à jour temps réel reçue via Socket");
      fetchTrips(true);
    };

    socketService.on("course:demande", handleSocketUpdate);
    socketService.on("course:acceptee_confirmation", handleSocketUpdate);
    socketService.on("course:deja_prise", handleSocketUpdate);
    socketService.on("course:annulee", handleSocketUpdate);
    socketService.on("course:terminee", handleSocketUpdate);
    socketService.on("reservation:planifiee_creee", handleSocketUpdate);
    socketService.on("reservation:planifiee_acceptee", handleSocketUpdate);
    socketService.on("reservation:planifiee_prise", handleSocketUpdate);

    // Rafraîchir toutes les 60 secondes en fallback de sécurité
    const interval = setInterval(() => fetchTrips(true), 60000);

    return () => {
      clearInterval(interval);
      socketService.off("course:demande", handleSocketUpdate);
      socketService.off("course:acceptee_confirmation", handleSocketUpdate);
      socketService.off("course:deja_prise", handleSocketUpdate);
      socketService.off("course:annulee", handleSocketUpdate);
      socketService.off("course:terminee", handleSocketUpdate);
      socketService.off("reservation:planifiee_creee", handleSocketUpdate);
      socketService.off("reservation:planifiee_acceptee", handleSocketUpdate);
      socketService.off("reservation:planifiee_prise", handleSocketUpdate);
    };
  }, [fetchTrips]);

  const mapBackendStatus = (statut) => {
    switch (statut) {
      case 'ACCEPTEE': return 'accepted';
      case 'ASSIGNEE': return 'in_progress';
      case 'ARRIVEE': return 'in_progress';
      case 'EN_COURS': return 'in_progress';
      case 'TERMINEE': return 'completed';
      case 'ANNULEE': return 'cancelled';
      default: return 'pending';
    }
  };

  const handleAccept = async (id) => {
    try {
      const res = await tripService.acceptTrip(id);
      if (res.data && res.data.succes) {
        toast.success("Course acceptée ! Redirection...");
        // On met à jour l'activeTrip dans le contexte pour le tracking
        // setActiveTrip({ id, ... }); 
        navigate('/chauffeur/tracking');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'acceptation");
      fetchTrips(true);
    }
  };

  const handleRefuse = async (id) => {
    try {
      await tripService.refuseTrip(id);
      toast.success("Demande refusée");
      fetchTrips(true);
    } catch (error) {
      toast.error("Erreur lors de l'action");
    }
  };

  // Statistiques
  const stats = {
    total: backendTrips.length,
    pending: backendTrips.filter(t => t.status === 'pending').length,
    active: backendTrips.filter(t => t.status === 'accepted' || t.status === 'in_progress').length,
    completedToday: backendTrips.filter(t => t.status === 'completed' && isToday(t.requestedTime)).length,
    totalEarnings: backendTrips
      .filter(t => t.status === 'completed')
      .reduce((sum, trip) => sum + trip.estimatedFare, 0)
  };

  function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  // Filtrer les trajets
  const filteredTrips = backendTrips.filter(trip => {
    if (selectedStatus !== 'all' && trip.status !== selectedStatus) return false;
    return true;
  });

  // Configuration des statuts
  const statusConfig = {
    pending: {
      label: 'Demandes',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <Clock className="w-4 h-4" />,
      badge: 'warning'
    },
    accepted: {
      label: 'Acceptés',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <CheckCircle className="w-4 h-4" />,
      badge: 'info'
    },
    in_progress: {
      label: 'En cours',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: <Navigation className="w-4 h-4" />,
      badge: 'primary'
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {t('nav.mes_trajets')}
            {refreshing && <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t('trips.subtitle')}</p>
        </div>
        <button
          onClick={() => fetchTrips(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 transition-colors text-sm font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-gray-500 font-medium font-bold">{t('trips.loading_trips')}</p>
        </div>
      ) : (
        <>
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('trips.requests')}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('trips.active')}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('trips.earning_today')}</p>
                  <p className="text-2xl font-black text-green-600 mt-1">{(stats.totalEarnings || 0).toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR')} {t('common.currency_symbol_short')}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.status')}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-3 h-3 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'} rounded-full`} />
                    <span className={`text-sm font-bold ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                      {isOnline ? t('common.online') : t('common.offline')}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                  <RefreshCw className={`w-6 h-6 ${isOnline ? 'text-green-500' : 'text-gray-400'}`} />
                </div>
              </div>
            </div>

          </div>

          {/* Filtres */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${selectedStatus === 'all'
                ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50'
                }`}
            >
              {t('common.all')} ({stats.total})
            </button>
            {Object.entries(statusConfig).map(([status, config]) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${selectedStatus === status
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50'
                  }`}
              >
                {config.icon}
                {t(`trips.status.${status}`)}
                <span className={`px-1.5 py-0.5 rounded-lg text-[10px] ${selectedStatus === status ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  {backendTrips.filter(t => t.status === status).length}
                </span>
              </button>
            ))}
          </div>

          {/* Liste des trajets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTrips.map((trip) => {
              const config = statusConfig[trip.status] || { color: 'bg-gray-100', icon: <Car className="w-4 h-4" /> };

              return (
                <div
                  key={trip.id}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                >
                  {/* Top: Status & Fare */}
                  <div className="px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${config.color}`}>
                        {config.icon}
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {t('trips.active_trip_label')}
                      </span>
                    </div>
                    <div className="text-lg font-black text-blue-600">
                      {trip.estimatedFare.toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR')} {t('common.currency_symbol_short')}
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Passenger & Routing Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-700">
                          {trip.passengerPhoto ? (
                            <img
                              src={trip.passengerPhoto}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://ui-avatars.com/api/?name=" + trip.passengerName;
                              }}
                            />
                          ) : (
                            <User className="w-6 h-6 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white leading-tight">{trip.passengerName}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-amber-500 text-xs">★</span>
                            <span className="text-xs font-bold text-gray-500">{trip.passengerRating}/5</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{t('trips.request_time')}</p>
                        <p className="text-sm font-black text-gray-700 dark:text-gray-300">
                          {trip.requestedTime.toLocaleTimeString(i18n.language === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Path */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 flex flex-col items-center gap-1">
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full ring-4 ring-green-500/20" />
                          <div className="w-0.5 h-10 border-l-2 border-dashed border-gray-300 dark:border-gray-600" />
                          <MapPin className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex-1 space-y-5">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('trips.pickup')}</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{trip.pickupAddress}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('trips.destination')}</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{trip.destinationAddress}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl flex items-center gap-3">
                        <Navigation className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">{t('trips.distance')}</p>
                          <p className="text-xs font-black text-gray-900 dark:text-white">{trip.distance}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl flex items-center gap-3">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">{t('trips.duration')}</p>
                          <p className="text-xs font-black text-gray-900 dark:text-white">{trip.estimatedTime}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Actions */}
                    <div className="flex gap-3 pt-2">
                      {trip.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleAccept(trip.id)}
                            className="flex-1 py-3.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/30 hover:opacity-90 transition-all active:scale-95"
                          >
                            {t('trips.accept_trip')}
                          </button>
                          <button
                            onClick={() => handleRefuse(trip.id)}
                            className="px-6 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
                          >
                            {t('common.reject')}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => navigate('/chauffeur/tracking')}
                          className="flex-1 py-3.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-black text-sm shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-3"
                        >
                          <Navigation className="w-5 h-5" />
                          {t('trips.continue_trip')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTrips.length === 0 && (
            <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{t('trips.no_trips_found_title')}</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                {t('trips.no_trips_found_desc')}
              </p>
              <button
                onClick={() => fetchTrips(true)}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/30 hover:opacity-90 transition-all"
              >
                {t('trips.refresh_search')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Trajets;

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tripService } from '../../services/tripService';
import {
  CheckCircle,
  XCircle,
  MapPin,
  User,
  DollarSign,
  Loader2,
  Calendar,
  Navigation,
  Clock,
  ChevronDown,
  Star,
  ChevronRight,
  Route
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Composants UI réutilisables (si disponibles dans le projet)
import Button from '../admin/ui/Bttn';
import Badge from '../admin/ui/Badge';

import { adminService } from '../../services/adminService';

function HistoriqueTrajet({ chauffeurId = null }) {
  const { t, i18n } = useTranslation();
  const [historyTrips, setHistoryTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalTrips, setTotalTrips] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const getImageUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("data:") || avatar.startsWith("http")) return avatar;
    const baseUrl = API_URL.replace(/\/api$/, '');
    const cleanPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
    return `${baseUrl}${cleanPath}`;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // ✅ Fetch Real History
  const fetchHistory = useCallback(async (pageNum, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      let response;
      if (chauffeurId) {
        // Mode Admin : On regarde l'historique d'un chauffeur spécifique
        response = await adminService.getDriverTripHistory(chauffeurId, {
          page: pageNum,
          limit: 10
        });
      } else {
        // Mode Chauffeur : On regarde son propre historique
        response = await tripService.getDriverHistory({
          page: pageNum,
          limit: 10
        });
      }

      const { data } = response;

      if (data.succes) {
        // Normalisation des données car l'API admin et chauffeur diffèrent légèrement
        const rawData = chauffeurId ? data.trajets : data.data;
        const totalCount = chauffeurId ? data.pagination.total : data.total;

        const formattedTrips = rawData.map(t => {
          // Normalisation du statut
          let status = 'cancelled';
          const s = (t.statut || t.status || '').toUpperCase();
          if (s === 'TERMINEE' || s === 'COMPLETED' || s === 'SUCCESS' || s === 'TERMINE') {
            status = 'completed';
          }

          return {
            id: t._id || t.id,
            status,
            requestedTime: t.createdAt || t.requestedTime,
            passengerName: t.passager ? `${t.passager.prenom} ${t.passager.nom}` : (t.passengerName || "Inconnu"),
            passengerRating: (t.passager?.noteMoyenne) || t.passengerRating || 5,
            passengerPhoto: getImageUrl(t.passager?.photoUrl || t.passengerPhoto),
            pickupAddress: t.depart || t.pickupAddress,
            destinationAddress: t.destination || t.destinationAddress,
            distance: t.distanceKm ? `${parseFloat(t.distanceKm).toFixed(1)} km` : (t.distance || '0 km'),
            estimatedTime: t.dureeMin ? `${t.dureeMin} min` : (t.estimatedTime || '-'),
            estimatedFare: t.prix || t.estimatedFare || 0
          };
        });

        if (isLoadMore) {
          setHistoryTrips(prev => [...prev, ...formattedTrips]);
        } else {
          setHistoryTrips(formattedTrips);
        }

        setTotalTrips(totalCount);
        setHasMore(historyTrips.length + formattedTrips.length < totalCount);
      }
    } catch (err) {
      console.error("Error fetching driver history:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [API_URL, historyTrips.length, chauffeurId]);

  useEffect(() => {
    setHistoryTrips([]);
    setPage(1);
    fetchHistory(1);
  }, [chauffeurId]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistory(nextPage, true);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && page === 1) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-gray-500 font-medium animate-pulse">{t('history.loading_history_msg')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-1 md:px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
            <Route className="w-8 h-8 text-emerald-600" />
            {t('history.title')}
          </h1>
          <p
            className="text-gray-500 dark:text-gray-400 mt-1 font-medium"
            dangerouslySetInnerHTML={{ __html: t('history.total_trips_msg', { count: totalTrips }) }}
          />
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800/30">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{t('history.finished_services')}</span>
        </div>
      </div>

      {historyTrips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white dark:bg-gray-800 rounded-3xl p-16 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Navigation className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t('history.no_trips_found')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{t('history.no_trips_found_desc')}</p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence mode='popLayout'>
              {historyTrips.map((trip, index) => (
                <motion.div
                  key={trip.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index % 10) * 0.05 }}
                  className="group relative bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 overflow-hidden"
                >
                  {/* Status Overlay background subtle gradient */}
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 -mr-10 -mt-10 pointer-events-none ${trip.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />

                  {/* HEADER */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        {trip.status === 'completed' ? (
                          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-lg">
                            <XCircle className="w-4 h-4 text-red-600" />
                          </div>
                        )}
                        <span className={`text-xs font-black uppercase tracking-wider ${trip.status === 'completed'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-500 dark:text-red-400'
                          }`}>
                          {trip.status === 'completed' ? t('history.success') : t('history.cancelled_label')}
                        </span>
                      </div>
                      <div className="flex items-center text-[11px] font-bold text-gray-400 dark:text-gray-500 ml-0.5">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        {formatDateTime(trip.requestedTime)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-400 mb-1">{t('history.total_fare')}</div>
                      <div className="text-xl font-black text-gray-800 dark:text-white flex items-center justify-end gap-1">
                        {trip.estimatedFare?.toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR')}
                        <span className="text-[10px] text-emerald-600 ml-0.5">{t('common.currency_symbol_short')}</span>
                      </div>
                    </div>
                  </div>

                  {/* PASSAGER INFO CARD - GLASSMORPHISM STYLE */}
                  <div className="bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl p-4 mb-5 border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors group-hover:bg-gray-50 dark:group-hover:bg-gray-900/60">
                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white dark:border-gray-700">
                      {trip.passengerPhoto ? (
                        <img
                          src={trip.passengerPhoto}
                          alt={trip.passengerName}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-lg font-black tracking-tighter">
                          {getInitials(trip.passengerName)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-800 dark:text-white leading-tight">
                          {trip.passengerName}
                        </p>
                        <div className="flex items-center bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg border border-amber-100 dark:border-amber-800/30">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                          <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                            {trip.passengerRating || '5.0'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{t('history.validated_passenger')}</p>
                    </div>
                  </div>

                  {/* ITINÉRAIRE DÉTAILLÉ */}
                  <div className="relative space-y-4 mb-6 pl-2">
                    {/* Vertical line connector */}
                    <div className="absolute left-[13px] top-[14px] bottom-[14px] w-0.5 border-l-2 border-dashed border-gray-200 dark:border-gray-700" />

                    <div className="flex items-start gap-4">
                      <div className="relative z-10 w-3 h-3 rounded-full bg-emerald-500 mt-1 ring-4 ring-emerald-500/20" />
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-0.5">{t('history.depart')}</p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 line-clamp-1 leading-relaxed">
                          {trip.pickupAddress}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="relative z-10 w-3 h-3 rounded-full bg-blue-500 mt-1 ring-4 ring-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      <div className="flex-1 text-right md:text-left">
                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-0.5">{t('history.arrival')}</p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 line-clamp-1 leading-relaxed">
                          {trip.destinationAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* METRICS - ULTRA-LIGHT MINIMALIST STYLE */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50/20 dark:bg-blue-900/10 rounded-2xl p-3 flex flex-col items-center justify-center border border-blue-100/30 dark:border-blue-800/20 transition-all duration-300 group-hover:bg-blue-50/40">
                      <span className="text-[9px] font-black text-blue-500/80 dark:text-blue-400/80 uppercase tracking-tighter mb-0.5">{t('history.distance_label')}</span>
                      <span className="text-sm font-black text-blue-900/90 dark:text-blue-100">{trip.distance}</span>
                    </div>
                    <div className="bg-indigo-50/20 dark:bg-indigo-900/10 rounded-2xl p-3 flex flex-col items-center justify-center border border-indigo-100/30 dark:border-indigo-800/20 transition-all duration-300 group-hover:bg-indigo-50/40">
                      <span className="text-[9px] font-black text-indigo-500/80 dark:text-indigo-400/80 uppercase tracking-tighter mb-0.5">{t('history.duration_label')}</span>
                      <span className="text-sm font-black text-indigo-900/90 dark:text-indigo-100">{trip.estimatedTime}</span>
                    </div>
                    <div className="bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl p-3 flex flex-col items-center justify-center border border-emerald-100/40 dark:border-emerald-800/20 transition-all duration-300 group-hover:bg-emerald-50/50">
                      <span className="text-[9px] font-black text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-tighter mb-0.5">{t('history.net_gain')}</span>
                      <span className="text-sm font-black text-emerald-900/90 dark:text-emerald-50">{(trip.estimatedFare * 0.8)?.toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR')}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* LOAD MORE / PAGINATION CONTROL */}
          <div className="flex flex-col items-center pt-8 pb-12">
            {hasMore ? (
              <Button
                variant="perso"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="group relative px-8 py-3 rounded-2xl font-black uppercase text-sm tracking-widest overflow-hidden transition-all active:scale-95"
              >
                {loadingMore ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center gap-2">
                    {t('history.load_more')}
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                  </span>
                )}
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {t('history.end_of_history')}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default HistoriqueTrajet;

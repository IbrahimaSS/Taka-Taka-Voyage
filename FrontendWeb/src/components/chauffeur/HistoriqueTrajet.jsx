import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tripService } from '../../services/tripService';
import {
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  Route
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Composants UI réutilisables (si disponibles dans le projet)
import Button from '../admin/ui/Bttn';
import HistoryTripCard from './history/HistoryTripCard';

import { adminService } from '../../services/adminService';
import { getFullAssetURL } from '../../utils/urlHelper';

function HistoriqueTrajet({ chauffeurId = null }) {
  const { t, i18n } = useTranslation();
  const [historyTrips, setHistoryTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalTrips, setTotalTrips] = useState(0);

  const getImageUrl = (avatar) => getFullAssetURL(avatar);

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
  }, [historyTrips.length, chauffeurId]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl p-6 text-center shadow-sm"
          >
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-400">0</h3>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">{t('history.completed_services', 'Trajets terminés')}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-2xl p-6 text-center shadow-sm"
          >
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <h3 className="text-3xl font-black text-red-700 dark:text-red-400">0</h3>
            <p className="text-sm font-bold text-red-600 dark:text-red-500 uppercase tracking-wider">{t('history.cancelled_services_full', 'Trajets annulés')}</p>
          </motion.div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence mode='popLayout'>
              {historyTrips.map((trip, index) => (
                <HistoryTripCard
                  key={trip.id || index}
                  trip={trip}
                  index={index}
                  t={t}
                  i18n={i18n}
                  formatDateTime={formatDateTime}
                />
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

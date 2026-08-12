import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Bell, Car, DollarSign, Calendar } from 'lucide-react';
import { useDriverContext } from '../../context/DriverContext';
import { tripService } from '../../services/tripService';
import { useTranslation } from 'react-i18next';
import StatCard from '../admin/layout/StatCard';
import LocationCard from './dashboard/LocationCard';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  // Contexte chauffeur pour le temps réel
  const { isOnline, tripRequests } = useDriverContext();
  const pendingRequestsCount = tripRequests?.length || 0;

  // État pour les statistiques
  const [stats, setStats] = useState({
    onlineSince: "0min",
    requestsReceived: 0,
    tripsCompleted: 0,
    dailyRevenue: 0
  });

  // Fetch Dashboard Stats (rafraichi toutes les minutes, source unique de verite
  // pour onlineSince - une simulation locale par increment existait en plus et
  // rentrait en concurrence avec ce fetch sur le meme intervalle de 60s, causant
  // un bref affichage d'une valeur incorrecte avant d'etre ecrasee par la vraie)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await tripService.getDriverDashboardStats();
        if (response.data.succes) {
          const data = response.data.data;
          setStats({
            onlineSince: data.dureeEnLigne || "0min",
            requestsReceived: data.stats.demandesRecuesAujourdHui || 0,
            tripsCompleted: data.stats.coursesEffectueesAujourdHui || 0,
            dailyRevenue: data.stats.revenusJournaliers || 0
          });
        }
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      }
    };

    fetchStats();

    // Refresh stats every minute
    const intervalData = setInterval(fetchStats, 60000);
    return () => clearInterval(intervalData);
  }, []);

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{t('nav.tableau_de_bord')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.activity_overview')}</p>
      </div>

      {/* Les 4 cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          title={t('dashboard.online_since')}
          value={stats.onlineSince}
          // description={isOnline ? t('common.online') : t('common.offline')}
        />
        <StatCard
          icon={Bell}
          title={t('dashboard.requests_received')}
          value={stats.requestsReceived}
          description={t('common.today')}
        />
        <StatCard
          icon={Car}
          title={t('dashboard.trips_completed_today')}
          value={stats.tripsCompleted}
          description={t('common.today')}
        />
        <StatCard
          icon={DollarSign}
          title={t('dashboard.daily_revenue')}
          compactValue
          rawValue={stats.dailyRevenue}
          unit={t('common.currency_symbol_short')}
          description={t('common.today')}
        />
      </div>

      {/* Section actions rapides */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white">{t('dashboard.quick_actions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/chauffeur/trips"
            className="relative flex items-center justify-center gap-2 p-4 min-h-[44px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Bell className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-800 dark:text-white">{t('dashboard.view_requests')}</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-lg animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </Link>

          <Link
            to="/chauffeur/planning"
            className="flex items-center justify-center gap-2 p-4 min-h-[44px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Calendar className="w-5 h-5 text-green-500" />
            {/*  Mon planing */}
            <span className="font-medium text-gray-800 dark:text-white">Mes Planings</span>
          </Link>

          <Link
            to="/chauffeur/revenues"
            className="flex items-center justify-center gap-2 p-4 min-h-[44px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <DollarSign className="w-5 h-5 text-amber-500" />
            <span className="font-medium text-gray-800 dark:text-white">{t('dashboard.view_revenues')}</span>
          </Link>
        </div>
      </div>
      <LocationCard />
    </div>
  );
}

// src/components/sections/Dashboard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Car, Route, Wallet, TrendingUp, TrendingDown,
  Clock, CheckCircle, AlertCircle, Calendar,
  ArrowRight, MoreVertical, Download, Filter,
  ChevronUp, ChevronDown, DollarSign, MapPin, UserCheck
} from 'lucide-react';
import StatCard from '../layout/StatCard';
import ChartCard from '../ui/ChartCard';
import { chartConfigs } from '../../../hooks/useCharts';
import { Link } from 'react-router-dom';
import Button from '../ui/Bttn';
import { adminService } from '../../../services/adminService';
import { useAuth } from '../../../context/AuthContext';
import { useEffect } from 'react';

// TODO API (admin/dashboard):
// Remplacer les stats et donnees simulees par des appels backend
// Exemple: GET API_ROUTES.admin.dashboard
const Dashboard = ({ showToast }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [dashboardData, setDashboardData] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, tripsData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentTrips()
        ]);

        if (statsData.succes) setDashboardData(statsData.donnees);
        if (tripsData.succes) setTrips(tripsData.donnees || []);
      } catch (error) {
        showToast('Erreur', 'Impossible de charger les données du tableau de bord', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast]);

  const stats = [
    {
      title: 'Les Utilisateurs actifs',
      value: dashboardData?.utilisateurs?.total?.toLocaleString() || '0',
      icon: Users,
      color: 'green',
      trend: (dashboardData?.utilisateurs?.evolution || 0) >= 0 ? 'up' : 'down',
      percentage: Math.abs(dashboardData?.utilisateurs?.evolution || 0),
      progress: 78,
      description: `+${dashboardData?.utilisateurs?.nouveaux || 0} cette semaine`,
      iconBg: 'from-emerald-500/20 to-emerald-600/10'
    },
    {
      title: 'Les Chauffeurs actifs',
      value: dashboardData?.chauffeurs?.actifs?.toLocaleString() || '0',
      icon: Car,
      color: 'blue',
      trend: (dashboardData?.chauffeurs?.evolution || 0) >= 0 ? 'up' : 'down',
      percentage: Math.abs(dashboardData?.chauffeurs?.evolution || 0),
      progress: 65,
      description: `${dashboardData?.chauffeurs?.nouveauxJour || 0} nouveaux aujourd'hui`,
      iconBg: 'from-blue-500/20 to-blue-600/10'
    },
    {
      title: 'Les Trajets du jour',
      value: dashboardData?.trajets?.aujourdhui?.toLocaleString() || '0',
      icon: Route,
      color: 'purple',
      trend: (dashboardData?.trajets?.evolution || 0) >= 0 ? 'up' : 'down',
      percentage: Math.abs(dashboardData?.trajets?.evolution || 0),
      progress: 45,
      description: `En ${(dashboardData?.trajets?.evolution || 0) >= 0 ? 'hausse' : 'baisse'} de ${Math.abs(dashboardData?.trajets?.evolution || 0)}%`,
      iconBg: 'from-purple-500/20 to-purple-600/10'
    },
    {
      title: 'Le Revenus totaux',
      value: (dashboardData?.revenus?.total / 1000000).toFixed(1) + 'M' || '0M',
      icon: Wallet,
      color: 'amber',
      trend: (dashboardData?.revenus?.evolution || 0) >= 0 ? 'up' : 'down',
      percentage: Math.abs(dashboardData?.revenus?.evolution || 0),
      progress: 85,
      description: `Objectif: ${(dashboardData?.revenus?.objectif / 1000000).toFixed(0)}M GNF`,
      iconBg: 'from-amber-500/20 to-amber-600/10'
    },
  ];

  const recentTrips = trips.map(t => ({
    id: t.code || t._id.substring(0, 8),
    passenger: `${t.passager?.prenom} ${t.passager?.nom}`.trim() || 'Anonyme',
    driver: t.chauffeur ? `${t.chauffeur?.prenom} ${t.chauffeur?.nom}`.trim() : 'Non assigné',
    pickup: t.pointDepart?.adresse || 'Inconnu',
    dropoff: t.pointArrivee?.adresse || 'Inconnu',
    amount: (t.prix || 0).toLocaleString() + ' GNF',
    status: t.statut?.toLowerCase(),
    time: new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    duration: t.dureeEstimee ? `${t.dureeEstimee} min` : '--',
    rating: t.note || null
  }));

  const pendingDrivers = [
    { id: 1, name: 'Mohamed Keita', date: '10 min', documents: 3, status: 'pending' },
    { id: 2, name: 'Fatoumata Bamba', date: '25 min', documents: 2, status: 'pending' },
    { id: 3, name: 'Oumar Camara', date: '1h 30min', documents: 4, status: 'review' },
    { id: 4, name: 'Aïcha Diarra', date: '2h', documents: 3, status: 'review' },
  ];



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-500 to-blue-600 p-8 text-white"
      >
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-white dark:bg-gray-800 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium opacity-90">Live Dashboard</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
                Bonjour, <span className="text-amber-200">{user?.prenom} {user?.nom}</span>
              </h1>
              <p className="text-lg opacity-90">
                Surveillez et gérez votre plateforme en temps réel. <span className="font-semibold">15 nouvelles activités</span> aujourd'hui.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden lg:block">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 opacity-80" />
                  <span className="text-sm font-medium">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Système opérationnel</span>
                </div>
              </div>

            </div>
          </div>


        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl"></div>
      </motion.div>

      {/* Time Range Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Aperçu des performances</h2>
          <p className="text-gray-500 dark:text-gray-400">Suivez les métriques clés de votre plateforme</p>
        </div>

      </motion.div>

      {/* Main Stats Grid */}
      <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className=''
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 "
      >
        <ChartCard
          title="Revenus mensuels"
          subtitle={`Évolution des revenus sur ${timeRange}`}
          chartConfig={chartConfigs.monthlyRevenue}
          height="320px"
          action={
            <button className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          }
        />
        <ChartCard
          title="Répartition des revenus"
          subtitle="Par type de service et région"
          chartConfig={chartConfigs.revenueDistribution}
          height="320px"
          action={
            <button className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              <Filter className="w-4 h-4" />
              Filtrer
            </button>
          }
        />
      </motion.div>

      {/* Bottom Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-1 gap-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-900 p-4"
      >
        {/* Recent Trips */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-900">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Route className="w-5 h-5 text-emerald-600" />
                Trajets récents
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Les derniers trajets effectués sur la plateforme</p>
            </div>
            <div className="flex items-center gap-3">

              <Link
                to="/trajets"

              >
                <Button variant='perso'>Voir tous - </Button>

              </Link>
            </div>
          </div>
        </div>

        <div className="p-1 ">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-900/20 dark:border-gray-900">
                  <th className="pb-3 pl-6 font-medium">Trajet ID</th>
                  <th className="pb-3 font-medium">Passager</th>
                  <th className="pb-3 font-medium">Chauffeur</th>
                  <th className="pb-3 font-medium">Montant</th>
                  <th className="pb-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip, index) => (
                  <motion.tr
                    key={trip.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-900/20 dark:border-gray-900 hover:bg-gray-50/80 dark:hover:bg-gray-900/20 transition-colors"
                  >
                    <td className="py-4 pl-6">
                      <div className="font-medium text-gray-800 dark:text-gray-100">{trip.id}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {trip.time}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-gray-800 dark:text-gray-100">{trip.passenger}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {trip.pickup} → {trip.dropoff}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-gray-700 dark:text-gray-200">{trip.driver}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {trip.amount}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{trip.duration}</div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${trip.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        trip.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          trip.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                        {trip.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                        {trip.status === 'completed' && 'Terminé'}
                        {trip.status === 'in-progress' && 'En cours'}
                        {trip.status === 'pending' && 'En attente'}
                        {trip.status === 'cancelled' && 'Annulé'}
                      </span>
                    </td>

                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div >
    </div>

  );
};

export default Dashboard;

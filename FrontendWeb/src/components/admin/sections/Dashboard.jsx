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
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // États pour les graphiques
  const [revenueChartData, setRevenueChartData] = useState(chartConfigs.monthlyRevenue);
  const [distributionChartData, setDistributionChartData] = useState(chartConfigs.revenueDistribution);

  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, tripsResponse, validationsResponse, revenueResponse, distributionResponse] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentTrips(),
          adminService.getPendingValidations(4),
          adminService.getMonthlyRevenue({ mode: 'mensuel', periode: 365 }),
          adminService.getRevenueByVehicleType()
        ]);

        if (statsResponse.data?.succes) setDashboardData(statsResponse.data.stats);
        if (tripsResponse.data?.succes) setTrips(tripsResponse.data.trajets || []);
        if (validationsResponse.data?.succes) setPendingDrivers(validationsResponse.data.chauffeurs || []);

        // Mise à jour du graphique des revenus mensuels
        if (revenueResponse.data?.succes && revenueResponse.data.evolution) {
          const labels = revenueResponse.data.evolution.map(d => d.label);
          const data = revenueResponse.data.evolution.map(d => d.revenus);

          setRevenueChartData(prev => ({
            ...prev,
            data: {
              ...prev.data,
              labels,
              datasets: [{
                ...prev.data.datasets[0],
                data
              }]
            }
          }));
        }

        // Mise à jour du graphique de répartition
        if (distributionResponse.data?.succes && distributionResponse.data.repartition) {
          const labels = distributionResponse.data.repartition.map(d => d.type);
          const data = distributionResponse.data.repartition.map(d => d.montant);
          const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']; // Couleurs fixes pour l'instant

          setDistributionChartData(prev => ({
            ...prev,
            data: {
              labels,
              datasets: [{
                ...prev.data.datasets[0],
                data,
                backgroundColor: colors.slice(0, data.length)
              }]
            }
          }));
        }

      } catch (error) {
        console.error('Erreur dashboard:', error);
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
      value: (dashboardData?.utilisateursTotal || 0).toLocaleString(),
      icon: Users,
      color: 'green',
      trend: 'neutral',
      percentage: 0,
      progress: 78,
      description: 'Total inscrits',
      iconBg: 'from-emerald-500/20 to-emerald-600/10'
    },
    {
      title: 'Les Chauffeurs actifs',
      value: (dashboardData?.chauffeursActifs || 0).toLocaleString(),
      icon: Car,
      color: 'blue',
      trend: 'neutral',
      percentage: 0,
      progress: 65,
      description: 'Chauffeurs en ligne',
      iconBg: 'from-blue-500/20 to-blue-600/10'
    },
    {
      title: 'Les Trajets totaux',
      value: (dashboardData?.trajetsEffectues || 0).toLocaleString(),
      icon: Route,
      color: 'purple',
      trend: 'neutral',
      percentage: 0,
      progress: 45,
      description: 'Tous les trajets',
      iconBg: 'from-purple-500/20 to-purple-600/10'
    },
    {
      title: 'Les Revenus totaux',
      value: (dashboardData?.revenusTotal / 1000000).toFixed(1) + 'M',
      icon: Wallet,
      color: 'amber',
      trend: 'neutral',
      percentage: 0,
      progress: 85,
      description: `Objectif: -- M GNF`,
      iconBg: 'from-amber-500/20 to-amber-600/10'
    },
  ];

  const recentTrips = trips.map(t => ({
    id: t._id ? t._id.substring(0, 8).toUpperCase() : 'N/A',
    passenger: t.passager ? `${t.passager.prenom} ${t.passager.nom}` : 'Anonyme',
    driver: t.chauffeur ? `${t.chauffeur.prenom} ${t.chauffeur.nom}` : 'Non assigné',
    pickup: t.depart?.adresse || 'Non spécifié',
    dropoff: t.destination?.adresse || 'Non spécifié',
    amount: (t.prix || 0).toLocaleString() + ' GNF',
    status: t.statut?.toLowerCase(),
    time: new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    duration: t.dureeMin ? `${t.dureeMin} min` : '--',
    rating: t.note || null
  }));




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
          chartConfig={revenueChartData}
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
          chartConfig={distributionChartData}
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
      {/* Recent Trips & Pending Validations Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">

        {/* Recent Trips - Takes up 2 columns */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-900 p-4">
          <div className="p-6 border-b border-gray-100 dark:border-gray-900">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Route className="w-5 h-5 text-emerald-600" />
                  Trajets récents
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Les derniers trajets effectués</p>
              </div>
              <Link to="/trajets">
                <Button variant='perso'>Voir tous</Button>
              </Link>
            </div>
          </div>

          <div className="p-1 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-900/20 dark:border-gray-900">
                  <th className="pb-3 pl-6 font-medium">ID</th>
                  <th className="pb-3 font-medium">Passager</th>
                  <th className="pb-3 font-medium">Chauffeur</th>
                  <th className="pb-3 font-medium">Montant</th>
                  <th className="pb-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.length > 0 ? recentTrips.map((trip, index) => (
                  <motion.tr
                    key={trip.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-900/10 dark:border-gray-900 hover:bg-gray-50/80 dark:hover:bg-gray-900/20 transition-colors"
                  >
                    <td className="py-4 pl-6 font-medium text-gray-800 dark:text-gray-100 text-xs">{trip.id}</td>
                    <td className="py-4">
                      <div className="font-medium text-gray-800 dark:text-gray-100 text-sm">{trip.passenger}</div>
                    </td>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-200">{trip.driver}</td>
                    <td className="py-4 font-bold text-gray-800 dark:text-gray-100 text-sm">{trip.amount}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium uppercase ${trip.status === 'completed' || trip.status === 'terminee' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        trip.status === 'en_route' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          trip.status === 'searching' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                        {trip.status === 'terminee' || trip.status === 'completed' ? 'Terminé' : trip.status}
                      </span>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">Aucun trajet récent</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Validations - Takes up 1 column */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-900 p-4 h-fit">
          <div className="p-6 border-b border-gray-100 dark:border-gray-900">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-500" />
                  Validations ({pendingDrivers.length})
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Chauffeurs en attente</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {pendingDrivers.length > 0 ? pendingDrivers.map((driver, index) => (
              <motion.div
                key={driver._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold overflow-hidden">
                    {driver.utilisateur?.photoUrl ? (
                      <img src={driver.utilisateur.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs">{driver.utilisateur?.prenom?.[0]}{driver.utilisateur?.nom?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{driver.utilisateur?.prenom} {driver.utilisateur?.nom}</h4>
                    <p className="text-xs text-gray-500">{new Date(driver.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Link to={`/admin/validations/${driver._id}`}>
                  <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-8">Examiner</Button>
                </Link>
              </motion.div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-50" />
                <p>Toutes les demandes sont traitées !</p>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link to="/admin/validations" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Voir toutes les demandes →</Link>
            </div>
          </div>
        </div>

      </div>
    </div>

  );
};

export default Dashboard;

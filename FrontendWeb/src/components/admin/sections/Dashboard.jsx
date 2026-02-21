// src/components/sections/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Car, Route, Wallet,
  Clock, CheckCircle, AlertCircle, Calendar,
  ArrowRight, MapPin, XCircle, Download
} from 'lucide-react';
import StatCard from '../layout/StatCard';
import ChartCard from '../ui/ChartCard';
import { chartConfigs } from '../../../hooks/useCharts';
import { Link } from 'react-router-dom';
import Button from '../ui/Bttn';
import { adminService } from '../../../services/adminService';
import { useAuth } from '../../../context/AuthContext';

const Dashboard = ({ showToast }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [dashboardData, setDashboardData] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, tripsRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentTrips()
        ]);

        if (statsRes.data.succes) setDashboardData(statsRes.data.stats);
        if (tripsRes.data.succes) setTrips(tripsRes.data.trajets || []);
      } catch (error) {
        showToast('Erreur', 'Impossible de charger les données du tableau de bord', 'error');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast]);

  const stats = [
    {
      title: 'Passagers Inscrits',
      value: dashboardData?.passagersTotal?.toLocaleString() || '0',
      icon: Users,
      color: 'green',
      trend: 'up',
      percentage: 12,
      progress: 78,
      description: `Comptes passagers actifs`,
      iconBg: 'from-emerald-500/20 to-emerald-600/10'
    },
    {
      title: 'Chauffeurs Actifs',
      value: dashboardData?.chauffeursActifs?.toLocaleString() || '0',
      icon: Car,
      color: 'blue',
      trend: 'up',
      percentage: 8,
      progress: 65,
      description: `Chauffeurs en ligne/validés`,
      iconBg: 'from-blue-500/20 to-blue-600/10'
    },
    {
      title: 'Trajets Effectués',
      value: dashboardData?.trajetsEffectues?.toLocaleString() || '0',
      icon: Route,
      color: 'purple',
      trend: 'up',
      percentage: 15,
      progress: 45,
      description: `Historique complet`,
      iconBg: 'from-purple-500/20 to-purple-600/10'
    },
    {
      title: 'Revenus Totaux',
      value: dashboardData?.revenusTotal ? (dashboardData.revenusTotal).toLocaleString() + ' GNF' : '0 GNF',
      icon: Wallet,
      color: 'amber',
      trend: 'up',
      percentage: 5,
      progress: 85,
      description: `Revenus encaissés`,
      iconBg: 'from-amber-500/20 to-amber-600/10'
    },
  ];

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";

    switch (status) {
      case 'TERMINEE':
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700`}>
            <CheckCircle className="w-3 h-3 mr-1" /> Terminé
          </span>
        );
      case 'EN_COURS':
        return (
          <span className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800`}>
            <Route className="w-3 h-3 mr-1" /> En cours
          </span>
        );
      case 'EN_ATTENTE':
        return (
          <span className={`${baseClasses} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800`}>
            <Clock className="w-3 h-3 mr-1" /> En attente
          </span>
        );
      case 'ACCEPTEE':
        return (
          <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800`}>
            Accepté
          </span>
        );
      case 'ARRIVEE':
        return (
          <span className={`${baseClasses} bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800`}>
            Arrivé
          </span>
        );
      case 'ANNULEE':
        return (
          <span className={`${baseClasses} bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800`}>
            <XCircle className="w-3 h-3 mr-1" /> Annulé
          </span>
        );
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}>{status}</span>;
    }
  };

  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const getInitials = (user) => {
    if (!user) return '?';
    const first = user.prenom?.charAt(0) || '';
    const last = user.nom?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const formatVehicle = (vehicule, requestedType) => {
    // 1. Essayer de constuire la chaine complète (Marque Modele Plaque)
    if (vehicule) {
      const marque = vehicule.marque || '';
      const modele = vehicule.modele || '';
      const plaque = vehicule.immatriculation || '';

      if (marque || modele) {
        return `${marque} ${modele} ${plaque ? `• ${plaque}` : ''}`.trim();
      }

      // 2. Sinon, utiliser le type générique du véhicule du chauffeur (ex: MOTO)
      if (vehicule.type) return vehicule.type;
    }

    // 3. En dernier recours, utiliser le type de véhicule demandé lors de la réservation
    return requestedType || 'Véhicule non renseigné';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-500 to-blue-600 p-8 text-white shadow-lg"
      >
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
              <span className="text-sm font-medium opacity-90 tracking-wide uppercase">Tableau de Bord Live</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              Bonjour, <span className="text-amber-200">{user?.prenom || 'Admin'}</span>
            </h1>
            <p className="text-lg opacity-90 max-w-xl">
              Voici ce qui se passe sur votre plateforme aujourd'hui.
            </p>
          </div>
          <div className="hidden lg:block text-right">
            <div className="flex items-center justify-end gap-2 mb-2 opacity-80">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <ChartCard
          title="Revenus Mensuels"
          subtitle={`Évolution sur ${timeRange === 'month' ? 'le mois' : "l'année"}`}
          chartConfig={chartConfigs.monthlyRevenue}
          height="320px"
          action={
            <button className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          }
        />
        <ChartCard
          title="Répartition des Services"
          subtitle="Par type de véhicule et zone"
          chartConfig={chartConfigs.revenueDistribution}
          height="320px"
        />
      </motion.div>

      {/* Recent Trips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Route className="w-5 h-5 text-emerald-600" />
              Trajets Récents
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Les 5 dernières courses effectuées sur la plateforme
            </p>
          </div>
          <Link to="/admin/trajets">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              Voir tout l'historique
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Trajet</th>
                <th className="px-6 py-4">Passager</th>
                <th className="px-6 py-4">Chauffeur</th>
                <th className="px-6 py-4">Détails</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {trips.length > 0 ? (
                trips.map((trip, index) => {
                  const passengerName = trip.passager ? `${trip.passager.prenom} ${trip.passager.nom}` : 'Utilisateur supprimé';
                  const driverName = trip.chauffeur ? `${trip.chauffeur.prenom} ${trip.chauffeur.nom}` : null;
                  const dateFormatted = new Date(trip.createdAt).toLocaleString('fr-FR', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  });

                  return (
                    <motion.tr
                      key={trip._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-gray-400 mb-1">#{trip._id.slice(-6).toUpperCase()}</span>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {dateFormatted}
                          </div>
                        </div>
                      </td>
                      {/* Passager - AVEC INITIALES FALLBACK */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold overflow-hidden border border-emerald-200 dark:border-emerald-800">
                            <span className="z-0">{getInitials(trip.passager)}</span>
                            {trip.passager?.photoUrl && (
                              <img
                                src={getAvatarUrl(trip.passager.photoUrl)}
                                alt={passengerName}
                                className="absolute inset-0 w-full h-full object-cover z-10"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white text-sm">{passengerName}</div>
                            {trip.passager?.telephone && (
                              <div className="text-xs text-gray-500">{trip.passager.telephone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Chauffeur - AVEC INITIALES FALLBACK */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {trip.chauffeur ? (
                            <>
                              <div className="relative h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold overflow-hidden border border-blue-200 dark:border-blue-800">
                                <span className="z-0">{getInitials(trip.chauffeur)}</span>
                                {trip.chauffeur?.photoUrl && (
                                  <img
                                    src={getAvatarUrl(trip.chauffeur.photoUrl)}
                                    alt={driverName}
                                    className="absolute inset-0 w-full h-full object-cover z-10"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white text-sm">{driverName}</div>
                                {trip.chauffeur && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Car className="w-3 h-3" />
                                    {formatVehicle(trip.chauffeur.vehicule, trip.typeVehicule)}
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 opacity-60">
                              <div className="w-8 h-8 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center">
                                <Car className="w-4 h-4 text-gray-400" />
                              </div>
                              <span className="text-xs text-gray-500 italic">
                                {trip.statut === 'ANNULEE' ? '-' : 'En recherche...'}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="font-bold text-gray-900 dark:text-white text-sm">
                            {(trip.prix || 0).toLocaleString()} GNF
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {trip.distanceKm} km • {trip.dureeMin} min
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(trip.statut)}
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex flex-col items-center justify-center">
                      <Route className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-lg font-medium">Aucun trajet récent</p>
                      <p className="text-sm opacity-80">Les nouvelles courses apparaîtront ici.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

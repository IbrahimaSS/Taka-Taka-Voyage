// src/components/sections/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { getFullAssetURL } from '../../../utils/urlHelper';

const Dashboard = ({ showToast }) => {
  const { t, i18n } = useTranslation();
  const [timeRange, setTimeRange] = useState('month');
  const [dashboardData, setDashboardData] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evolutionData, setEvolutionData] = useState(null);
  const [repartitionData, setRepartitionData] = useState(null);
  const { user } = useAuth();



  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          adminService.getDashboardStats(),
          adminService.getRecentTrips(),
          adminService.getMonthlyRevenue({ periode: 6, mode: 'mensuel' }),
          adminService.getRevenueByVehicleType()
        ]);

        const [statsRes, tripsRes, evolutionRes, repartitionRes] = results;

        if (statsRes.status === 'fulfilled' && statsRes.value.data.succes) {
          setDashboardData(statsRes.value.data.stats);
        }

        if (tripsRes.status === 'fulfilled' && tripsRes.value.data.succes) {
          setTrips(tripsRes.value.data.trajets || []);
        }

        if (evolutionRes.status === 'fulfilled' && evolutionRes.value.data.succes) {
          setEvolutionData(evolutionRes.value.data.evolution);
        }

        if (repartitionRes.status === 'fulfilled' && repartitionRes.value.data.succes) {
          setRepartitionData(repartitionRes.value.data.repartition);
        } else if (repartitionRes.status === 'rejected') {
          console.error("Erreur répartition:", repartitionRes.reason);
        }
      } catch (error) {
        showToast(t('common.error') || 'Erreur', t('dashboard.error_loading') || 'Impossible de charger les données du tableau de bord', 'error');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast, t]);

  // Génération dynamique des configurations de graphiques
  const monthlyRevenueConfig = React.useMemo(() => {
    // Si pas de données, retour config par défaut
    if (!evolutionData) return chartConfigs.monthlyRevenue;

    // Pour éviter que le graphe "disparaisse" quand il n'y a qu'un point (un seul mois),
    // on va s'assurer d'avoir au moins les 6 derniers mois, même avec des 0.
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      // Calculer le mois de manière robuste
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const isoLabel = d.toISOString().substring(0, 7); // Format YYYY-MM pour la recherche

      // Label pour l'affichage (ex: "Jan 2024")
      const displayLabel = d.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'short',
        year: 'numeric'
      });

      const existingData = evolutionData.find(ed => ed.label === isoLabel);
      last6Months.push({
        label: displayLabel,
        revenus: existingData?.revenus || 0,
        commissions: existingData?.commissions || 0
      });
    }

    return {
      ...chartConfigs.monthlyRevenue,
      data: {
        labels: last6Months.map(d => d.label),
        datasets: [
          {
            ...chartConfigs.monthlyRevenue.data.datasets[0],
            label: t('payments.total_revenue') || 'Revenus Totaux',
            data: last6Months.map(d => d.revenus),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            ...chartConfigs.monthlyRevenue.data.datasets[0],
            label: t('payments.platform_commission') || 'Commissions Plateforme',
            data: last6Months.map(d => d.commissions),
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      }
    };
  }, [evolutionData, t, i18n.language]);

  const serviceDistributionConfig = React.useMemo(() => {
    if (!repartitionData || repartitionData.length === 0) return chartConfigs.revenueDistribution;
    return {
      ...chartConfigs.revenueDistribution,
      data: {
        labels: repartitionData.map(d => d.type || 'Inconnu'),
        datasets: [{
          ...chartConfigs.revenueDistribution.data.datasets[0],
          data: repartitionData.map(d => d.montant)
        }]
      }
    };
  }, [repartitionData]);

  const stats = [
    {
      title: t('dashboard.registered_passengers') || 'Passagers Inscrits',
      value: dashboardData?.passagersTotal?.toLocaleString() || '0',
      icon: Users,
      color: 'green',
      trend: 'up',
      percentage: 12,
      progress: 78,
      description: t('dashboard.active_passengers_desc') || `Comptes passagers actifs`,
      iconBg: 'from-emerald-500/20 to-emerald-600/10'
    },
    {
      title: t('dashboard.active_drivers') || 'Chauffeurs Actifs',
      value: dashboardData?.chauffeursActifs?.toLocaleString() || '0',
      icon: Car,
      color: 'blue',
      trend: 'up',
      percentage: 8,
      progress: 65,
      description: t('dashboard.online_drivers_desc') || `Chauffeurs en ligne/validés`,
      iconBg: 'from-blue-500/20 to-blue-600/10'
    },
    {
      title: t('dashboard.trips_completed') || 'Trajets Effectués',
      value: dashboardData?.trajetsEffectues?.toLocaleString() || '0',
      icon: Route,
      color: 'purple',
      trend: 'up',
      percentage: 15,
      progress: 45,
      description: t('dashboard.full_history_desc') || `Historique complet`,
      iconBg: 'from-purple-500/20 to-purple-600/10'
    },
    {
      title: t('dashboard.total_revenue') || 'Revenus Totaux',
      value: dashboardData?.revenusTotal ? (dashboardData.revenusTotal).toLocaleString() + ` ${t('common.currency_symbol') || 'GNF'}` : `0 ${t('common.currency_symbol') || 'GNF'}`,
      icon: Wallet,
      color: 'amber',
      trend: 'up',
      percentage: 5,
      progress: 85,
      description: t('dashboard.collected_revenue_desc') || `Revenus encaissés`,
      iconBg: 'from-amber-500/20 to-amber-600/10'
    },
  ];

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";

    switch (status) {
      case 'TERMINEE':
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700`}>
            <CheckCircle className="w-3 h-3 mr-1" /> {t('trips.status.completed') || 'Terminé'}
          </span>
        );
      case 'EN_COURS':
        return (
          <span className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800`}>
            <Route className="w-3 h-3 mr-1" /> {t('trips.status.in_progress') || 'En cours'}
          </span>
        );
      case 'EN_ATTENTE':
        return (
          <span className={`${baseClasses} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800`}>
            <Clock className="w-3 h-3 mr-1" /> {t('trips.status.pending') || 'En attente'}
          </span>
        );
      case 'ACCEPTEE':
        return (
          <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800`}>
            {t('trips.status.accepted') || 'Accepté'}
          </span>
        );
      case 'ARRIVEE':
        return (
          <span className={`${baseClasses} bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800`}>
            {t('trips.status.arrived') || 'Arrivé'}
          </span>
        );
      case 'ANNULEE':
        return (
          <span className={`${baseClasses} bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800`}>
            <XCircle className="w-3 h-3 mr-1" /> {t('trips.status.cancelled') || 'Annulé'}
          </span>
        );
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}>{status}</span>;
    }
  };

  const getMethodBadge = (method) => {
    const baseClasses = "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase";

    const getMethod = (m) => {
      if (!m) return 'cash';
      const lower = m.toLowerCase();
      if (lower.includes('orange')) return 'orange';
      if (lower.includes('mtn')) return 'mtn';
      if (lower.includes('wave')) return 'wave';
      if (lower.includes('carte') || lower.includes('card')) return 'card';
      if (lower.includes('mobile') || lower.includes('money')) return 'orange'; // Fallback visuel
      if (lower.includes('portefeuille') || lower.includes('wallet')) return 'card';
      return 'cash';
    };

    const m = getMethod(method);

    switch (m) {
      case 'orange':
        return <span className={`${baseClasses} bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800`}>Orange Money</span>;
      case 'mtn':
        return <span className={`${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800`}>MTN Money</span>;
      case 'card':
        return <span className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800`}>Carte</span>;
      default:
        return <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800`}>Espèces</span>;
    }
  };

  const getServiceLabel = (service) => {
    if (!service) return '-';
    const s = service.toUpperCase();
    if (s === 'MOTO' || s === 'MOTO_TAXI') return t('services.moto_taxi') || 'Moto-taxi';
    if (s === 'TAXI' || s === 'TAXI_PARTAGE') return t('services.taxi_partage') || 'Taxi partagé';
    if (s === 'VOITURE' || s === 'VOITURE_PRIVEE' || s === 'PARTICULIER') return t('services.voiture_privee') || 'Voiture privée';
    if (s === 'BUS') return 'Bus';
    return service;
  };

  const getAvatarUrl = (path) => getFullAssetURL(path);

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
    return requestedType || t('dashboard.vehicle_not_specified') || 'Véhicule non renseigné';
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
              <span className="text-sm font-medium opacity-90 tracking-wide uppercase">{t('dashboard.live_dashboard') || 'Tableau de Bord Live'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              {t('dashboard.greeting') || 'Bonjour'}, <span className="text-amber-200">{user?.prenom || 'Admin'}</span>
            </h1>
            <p className="text-lg opacity-90 max-w-xl">
              {t('dashboard.welcome_msg') || "Voici ce qui se passe sur votre plateforme aujourd'hui."}
            </p>
          </div>
          <div className="hidden lg:block text-right">
            <div className="flex items-center justify-end gap-2 mb-2 opacity-80">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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
          title={t('dashboard.monthly_revenue') || 'Revenus Mensuels'}
          subtitle={`${t('dashboard.evolution_on') || 'Évolution sur'} ${timeRange === 'month' ? (t('dashboard.the_month') || 'le mois') : (t('dashboard.the_year') || "l'année")}`}
          chartConfig={monthlyRevenueConfig}
          height="320px"
          action={
            <button className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          }
        />
        <ChartCard
          title={t('dashboard.service_distribution') || 'Répartition des Services'}
          subtitle={t('dashboard.by_vehicle_and_zone') || 'Par type de véhicule et zone'}
          chartConfig={serviceDistributionConfig}
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
              {t('dashboard.recent_trips') || 'Trajets Récents'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {t('dashboard.last_5_rides') || 'Les 5 dernières courses effectuées sur la plateforme'}
            </p>
          </div>
          <Link to="/admin/trajets">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              {t('dashboard.view_full_history') || "Voir tout l'historique"}
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">{t('dashboard.trip') || 'Trajet'}</th>
                <th className="px-6 py-4">{t('nav.passagers') || 'Passager'}</th>
                <th className="px-6 py-4">{t('nav.chauffeurs') || 'Chauffeur'}</th>
                <th className="px-6 py-4">{t('common.service') || 'Service'}</th>
                <th className="px-6 py-4">{t('payments.method') || 'Mode'}</th>
                <th className="px-6 py-4 text-right">{t('dashboard.details') || 'Détails'}</th>
                <th className="px-6 py-4">{t('dashboard.status') || 'Statut'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {trips.length > 0 ? (
                trips.map((trip, index) => {
                  const passengerName = trip.passager ? `${trip.passager.prenom} ${trip.passager.nom}` : (t('dashboard.deleted_user') || 'Utilisateur supprimé');
                  const driverName = trip.chauffeur ? `${trip.chauffeur.prenom} ${trip.chauffeur.nom}` : null;
                  const dateFormatted = new Date(trip.createdAt).toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
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
                                {trip.statut === 'ANNULEE' ? '-' : (t('dashboard.searching') || 'En recherche...')}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700 uppercase">
                          {getServiceLabel(trip.typeVehicule)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getMethodBadge(trip.paiement?.methode || trip.paiement?.mode)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col gap-1 items-end">
                          <div className="font-bold text-gray-900 dark:text-white text-sm">
                            {(trip.prix || 0).toLocaleString()} {t('common.currency_symbol') || 'GNF'}
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
                      <p className="text-lg font-medium">{t('dashboard.no_recent_trips') || 'Aucun trajet récent'}</p>
                      <p className="text-sm opacity-80">{t('dashboard.new_rides_msg') || 'Les nouvelles courses apparaîtront ici.'}</p>
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

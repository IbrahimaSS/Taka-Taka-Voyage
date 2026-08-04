import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatCard from '../layout/StatCard';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Table, { TableRow, TableCell } from '../ui/Table';
import Button from '../ui/Bttn';
import Badge from '../ui/Badge';
import Tabs from '../ui/Tabs';
import Pagination from '../ui/Pagination';
import Modal from '../ui/Modal';
import {
  Route, PlayCircle, XCircle, DollarSign,
  RefreshCw, Filter, MapPin, User, Car,
  CheckCircle, Clock, AlertCircle,
  Eye, ChevronLeft, ChevronRight, List,
  ArrowRight, Search, MoreVertical, Download,
  Calendar, ChevronDown, BarChart3, Activity,
  FileText, ExternalLink, Share2, Trash2,
  Edit2, Save, Upload, Grid, Maximize2,
  Percent, Navigation, Phone, Mail,
  Star as StarIcon, MessageSquare, Shield,
  Archive, ArchiveRestore, FileSpreadsheet,
  FilePieChart, Target, Users, Plus, X,
  Camera, Video, PhoneCall, Smartphone,
  TrendingUp, TrendingDown, Award, Compass,
  Zap, Battery, Wifi, Map as MapIcon,
  Layers, Database, Cpu, Satellite,
  Copy, CreditCard
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { leafletIcons } from '../../maps/leafletIcons';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../../services/adminService';
import ExportDropdown from '../ui/ExportDropdown';
import { exportToCSV, exportToPDF, exportToWord } from '../../../utils/exporters';
import { mapBackendTripToFrontend } from './trajets/tripMapper';
import FollowModal from './trajets/FollowModal';
import { getAvatarUrl, getUserAvatarInitials } from './trajets/tripHelpers';
import { getStatusBadge, getPaymentBadge } from './trajets/tripBadges';
import TripActions from './trajets/TripActions';
import TripCard from './trajets/TripCard';
import TripDetailsModal from './trajets/TripDetailsModal';

// TODO API (admin/trajets):
// Remplacer les donnees simulees et les actions locales par des appels backend
// Exemple: GET API_ROUTES.trips.list, PATCH /trips/:id (status), etc.
const Trips = ({ showToast }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [timeFilter, setTimeFilter] = useState('today');
  const [filters, setFilters] = useState({
    departure: '',
    destination: '',
    date: '',
    status: 'all',
    vehicleType: 'all',
    amountRange: 'all'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followTrip, setFollowTrip] = useState(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiStats, setApiStats] = useState(null);

  // Configuration des colonnes pour l'exportation
  const exportColumns = useMemo(() => [
    { header: "N°", accessor: (t, i) => i + 1 },
    { header: t('trips.date'), accessor: 'date' },
    { header: t('trips.passenger'), accessor: (t) => t.passenger.name },
    { header: t('trips.driver'), accessor: (t) => t.driver.name },
    { header: t('trips.route'), accessor: 'route' },
    { header: t('trips.distance'), accessor: 'distance' },
    { header: t('trips.duration'), accessor: 'duration' },
    { header: t('trips.amount'), accessor: 'amount' },
    { header: t('common.status'), accessor: 'status' },
  ], [t]);

  const exportMenuRef = useRef(null);

  const [tripsData, setTripsData] = useState([]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tripsParams, statsResponse] = await Promise.all([
          adminService.getTrips({ limit: 100 }), // Fetching latest 100 trips for now
          adminService.getTripStats()
        ]);

        if (tripsParams.data.succes) {
          const mappedTrips = tripsParams.data.trajets.map(mapBackendTripToFrontend);
          setTripsData(mappedTrips);
        }

        if (statsResponse.data.succes) {
          setApiStats(statsResponse.data.stats);
        }
      } catch (error) {
        console.error("Erreur chargement trajets:", error);
        showToast('Erreur', 'Impossible de charger les trajets', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const LocationMarker = () => {
    const [position, setPosition] = useState(null);
    const map = useMap();
    useEffect(() => {
      map.locate().on("locationfound", function (e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      });
    }, [map]);
    return position === null ? null : (
      <Marker position={position} icon={leafletIcons.user}>
        <Popup>Vous êtes ici (Admin)</Popup>
      </Marker>
    );
  };

  // Tabs avec statistiques en temps réel (basé sur tripsData chargé)
  const tabs = [
    {
      id: 'all',
      label: t('history.status.all'),
      icon: Layers,
      count: tripsData.length,
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'in-progress',
      label: t('history.status.in_progress'),
      icon: PlayCircle,
      count: tripsData.filter(t => t.status === 'in-progress').length,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'completed',
      label: t('history.status.completed'),
      icon: CheckCircle,
      count: tripsData.filter(t => t.status === 'completed').length,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'pending',
      label: t('history.status.pending'),
      icon: Clock,
      count: tripsData.filter(t => t.status === 'pending').length,
      color: 'from-amber-500 to-yellow-600'
    },
    {
      id: 'cancelled',
      label: t('history.status.cancelled'),
      icon: XCircle,
      count: tripsData.filter(t => t.status === 'cancelled').length,
      color: 'from-rose-500 to-pink-600'
    },
  ];

  // Statistiques
  const stats = useMemo(() => [
    {
      title: t('trips.active_trips'),
      value: apiStats ? apiStats.trajetsEnCours.toString() : tripsData.filter(t => t.status === 'in-progress').length.toString(),
      icon: Activity,
      color: "blue",
      trend: "up",
      percentage: 0,
      progress: 85,
      iconBg: 'from-blue-500/20 to-blue-600/10'
    },
    {
      title: t('trips.today_revenue'),
      value: apiStats ? `${apiStats.revenusJournaliers.toLocaleString()} GNF` : '0 GNF',
      icon: TrendingUp,
      color: "emerald",
      trend: "up",
      percentage: 0,
      progress: 92,
      iconBg: 'from-emerald-500/20 to-emerald-600/10'
    },
    {
      title: t('trips.total_distance'),
      value: apiStats && apiStats.distanceTotale ? `${apiStats.distanceTotale.toFixed(1)} km` : '0.0 km',
      icon: Navigation,
      color: "purple",
      trend: "up",
      percentage: 0,
      progress: 78,
      iconBg: 'from-purple-500/20 to-purple-600/10'
    }
  ], [tripsData, apiStats, t]);

  // Filtrer les données
  const filteredTrips = useMemo(() => {
    let trips = tripsData; // Removed archived filter for now as backend doesn't seem to have archived flag

    return trips.filter(trip => {
      // Filtre par onglet
      if (activeTab !== 'all' && trip.status !== activeTab) return false;

      // Filtre par recherche
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          trip.id.toLowerCase().includes(searchLower) ||
          trip.route.toLowerCase().includes(searchLower) ||
          trip.passenger.name.toLowerCase().includes(searchLower) ||
          trip.driver.name.toLowerCase().includes(searchLower)
        );
      }

      // Filtres supplémentaires
      if (filters.status !== 'all' && trip.status !== filters.status) return false;
      if (filters.vehicleType !== 'all' && !trip.vehicle.type.toLowerCase().includes(filters.vehicleType.toLowerCase())) return false;
      if (filters.date && trip.date !== filters.date) return false;
      if (filters.departure && !trip.startLocation.district.toLowerCase().includes(filters.departure.toLowerCase())) return false;
      if (filters.destination && !trip.endLocation.district.toLowerCase().includes(filters.destination.toLowerCase())) return false;

      return true;
    });
  }, [tripsData, activeTab, search, filters]);

  // Pagination
  const paginatedTrips = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTrips.slice(startIndex, endIndex);
  }, [filteredTrips, currentPage, pageSize]);

  // Fonctions utilitaires
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleStartFollow = (trip) => {
    setFollowTrip(trip);
    setShowFollowModal(true);
  };

  const handleStopFollow = () => {
    setShowFollowModal(false);
    setTimeout(() => {
      setFollowTrip(null);
    }, 300);
  };

  const handleExport = (format) => {
    const data = selectedTrips.length > 0 ? tripsData.filter(t => selectedTrips.includes(t.id)) : filteredTrips;
    const fileName = `trajets_${new Date().toISOString().split('T')[0]}`;
    const title = t('trips.title');

    const columns = exportColumns; // Assuming exportColumns is defined

    const options = {
      data,
      columns,
      fileName,
      title,
      onToast: (t, m, s) => showToast(t, m, s)
    };

    switch (format) {
      case 'csv': exportToCSV(options); break;
      case 'pdf': exportToPDF(options); break;
      case 'word':
      case 'doc':
        exportToWord(options);
        break;
      default: exportToPDF(options);
    }
    setShowExportMenu(false);
  };

  const handleSelectTrip = (tripId, checked) => {
    setSelectedTrips(prev =>
      checked
        ? [...prev, tripId]
        : prev.filter(id => id !== tripId)
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTrips(paginatedTrips.map(t => t.id));
    } else {
      setSelectedTrips([]);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('trips.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('trips.subtitle')}</p>
        </div>

      </motion.div>

      {/* Statistiques */}


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard key={index} {...stat} />
          </motion.div>
        ))}
      </div>


      {/* Carte interactive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 dark:border-gray-900/40 rounded-2xl shadow-sm border border-gray-100  overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-900/40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-emerald-600" />
                Carte des trajets en temps réel
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{tripsData.filter(t => t.status === 'in-progress').length} trajets actifs actuellement</p>
            </div>
            <div className="flex items-center gap-3">

              <Button
                variant="perso"
                icon={Compass}

              >
                Suivre
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Carte Leaflet en temps réel */}
          <div className="h-96 rounded-xl relative overflow-hidden z-0">
            <MapContainer
              center={[5.3600, -4.0083]} // Default Abidjan
              zoom={12}
              style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
              whenCreated={(map) => {
                // Locate admin on load
                map.locate({ setView: true, maxZoom: 14 });
                map.on('locationfound', (e) => {
                  // Logic to show admin marker is handled by component state if needed,
                  // but react-leaflet handles events.
                  // We will use a separate LocationMarker component if we want strict state control,
                  // but generic locate works for "setView".
                });
              }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Admin Location Marker (using browser geolocation via simple effect inside or generic approach) */}
              <LocationMarker />

              {/* Active Trips Markers */}
              {tripsData
                .filter(t => t.status === 'in-progress')
                .map((trip) => (
                  <Marker
                    key={trip.id}
                    position={[trip.startLocation.lat, trip.startLocation.lng]}
                    icon={leafletIcons.driver}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-full ${trip.driver.avatarColor} flex items-center justify-center`}>
                            <Car className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{trip.driver.name}</p>
                            <p className="text-xs text-gray-500">{trip.vehicle.plate}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          <p><strong>De:</strong> {trip.startLocation.address}</p>
                          <p><strong>Vers:</strong> {trip.endLocation.address}</p>
                        </div>
                        <Button
                          size="xs"
                          variant="primary"
                          className="w-full"
                          onClick={() => handleStartFollow(trip)}
                          icon={PlayCircle}
                        >
                          Suivre en direct
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>

            <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur dark:bg-gray-800/90 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  {tripsData.filter(t => t.status === 'in-progress').length} {t('trips.active_trips')}
                </span>
              </div>
            </div>
          </div>


        </div>
      </motion.div>

      {/* Barre de recherche et filtres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 dark:border-gray-900/40 rounded-2xl shadow-sm border border-gray-100  p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder={t('trips.search_placeholder')}
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 dark:border-gray-900/40 border-2 border-gray-200 dark:border-gray-900/40 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-lg"
                >
                  <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className='text-sm'
            >
              {t('trips.advanced_filters')}
            </Button>
            <ExportDropdown
              data={selectedTrips.length > 0 ? tripsData.filter(t => selectedTrips.includes(t.id)) : filteredTrips}
              columns={exportColumns}
              fileName="trajets_taka_taka"
              title={t('trips.title')}
              showToast={(title, msg, type) => showToast(title, msg, type)}
            />
          </div>
        </div>

        {/* Filtres avancés */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-900/40"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Date</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="w-full border border-gray-300 dark:bg-gray-800  dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Statut</label>
                  <select
                    className="w-full border dark:bg-gray-800  border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="all">{t('common.all_status')}</option>
                    <option value="pending">{t('trips.status.pending')}</option>
                    <option value="in-progress">{t('trips.status.in_progress')}</option>
                    <option value="completed">{t('trips.status.completed')}</option>
                    <option value="cancelled">{t('trips.status.cancelled')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Type véhicule</label>
                  <select
                    className="w-full border dark:bg-gray-800  border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    value={filters.vehicleType}
                    onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
                  >
                    <option value="all">Tous les types</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Peugeot">Peugeot</option>
                    <option value="Honda">Honda</option>
                    <option value="Kia">Kia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Départ</label>
                  <input
                    type="text"
                    placeholder="Lieu de départ"
                    value={filters.departure}
                    onChange={(e) => handleFilterChange('departure', e.target.value)}
                    className="w-full border dark:bg-gray-800  border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Destination</label>
                  <input
                    type="text"
                    placeholder="Lieu d'arrivée"
                    value={filters.destination}
                    onChange={(e) => handleFilterChange('destination', e.target.value)}
                    className="w-full border dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  icon={RefreshCw}
                  onClick={() => {
                    setFilters({
                      departure: '',
                      destination: '',
                      date: '',
                      status: 'all',
                      vehicleType: 'all',
                      amountRange: 'all'
                    });
                    setSearch('');
                    setCurrentPage(1);
                  }}
                >
                  Réinitialiser
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    showToast({
                      type: 'success',
                      title: 'Filtres appliqués',
                      message: 'Les filtres ont été appliqués avec succès'
                    });
                  }}
                >
                  Appliquer les filtres
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Onglets */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-900/40 overflow-hidden">
        <div className="border-b border-gray-100 dark:border-gray-900/40">
          <div className="flex justify-between items-center px-6 py-4">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(tab) => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              variant="modern"
              className='overflow-x-auto text-sm'

            />
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                icon={viewMode === 'table' ? Grid : List}
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              >
                {viewMode === 'table' ? t('trips.grid_view') : t('trips.table_view')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu - Tableau ou Grille */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onSelect={() => { setSelectedTrip(trip); setShowTripDetails(true); }}
              onFollow={handleStartFollow}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-900/40 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-900/40">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('trips.title')}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {selectedTrips.length > 0 && `${selectedTrips.length} sélectionné(s) • `}
                  {paginatedTrips.length} affiché(s) sur {filteredTrips.length}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Afficher :</span>
                <select
                  className="border border-gray-300 dark:bg-gray-800 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-500 transition"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-gray-900/20 dark:border-gray-900">
                <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-900/40">
                  <th className="pb-4 pl-6 font-semibold">N°</th>
                  <th className="pb-4 font-semibold">{t('trips.route')}</th>
                  <th className="pb-4 font-semibold">{t('trips.passenger')}</th>
                  <th className="pb-4 font-semibold">{t('trips.driver')}</th>
                  <th className="pb-4 font-semibold">{t('trips.amount')}</th>
                  <th className="pb-4 font-semibold">{t('common.status')}</th>
                  <th className="pb-4 pr-6 font-semibold text-right">{t('trips.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTrips.map((trip, index) => (
                  <motion.tr
                    key={trip.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-900/20 dark:border-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors"
                  >
                    <td className="py-4 pl-6">
                      <div className="font-medium text-gray-800 dark:text-gray-100">{(currentPage - 1) * pageSize + index + 1}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {trip.date} à {trip.time}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <p className="font-medium text-gray-800 dark:text-gray-100">{trip.route}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {trip.distance} • {trip.duration}
                        </p>

                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="relative w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 overflow-hidden mr-3">
                          <span className="z-0">{getUserAvatarInitials(trip.passenger)}</span>
                          {trip.passenger.photoUrl && (
                            <img
                              src={getAvatarUrl(trip.passenger.photoUrl)}
                              alt={trip.passenger.name}
                              className="absolute inset-0 w-full h-full object-cover z-10"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">{trip.passenger.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{trip.passenger.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="relative w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800 overflow-hidden mr-3">
                          <span className="z-0">{getUserAvatarInitials(trip.driver)}</span>
                          {trip.driver.photoUrl && (
                            <img
                              src={getAvatarUrl(trip.driver.photoUrl)}
                              alt={trip.driver.name}
                              className="absolute inset-0 w-full h-full object-cover z-10"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">{trip.driver.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{trip.driver.vehicleType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 dark:text-gray-100">{trip.amount}</span>
                        <div className="mt-1">
                          {getPaymentBadge(trip.paymentMethod, t)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      {getStatusBadge(trip.status, t)}
                      {trip.efficiency > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{trip.efficiency}% {t('trips.efficiency')}</div>
                      )}
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <TripActions
                        trip={trip}
                        onViewDetails={() => { setSelectedTrip(trip); setShowTripDetails(true); }}
                        onFollow={handleStartFollow}
                        showToast={showToast}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTrips.length > 0 && (
            <div className="p-6 border-t border-gray-100 dark:border-gray-900/40">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredTrips.length / pageSize)}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                totalItems={filteredTrips.length}
                showInfo={true}
              />
            </div>
          )}

          {paginatedTrips.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Route className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">{t('trips.no_trips_found')}</p>
              <p className="text-gray-400 dark:text-gray-500">
                {t('common.try_modifying_filters')}
              </p>
              <Button
                variant="outline"
                icon={RefreshCw}
                className="mt-6"
                onClick={() => {
                  setSearch('');
                  setFilters({
                    departure: '',
                    destination: '',
                    date: '',
                    status: 'all',
                    vehicleType: 'all',
                    amountRange: 'all'
                  });
                }}
              >
                {t('common.reset_filters') || 'Réinitialiser les filtres'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      <TripDetailsModal
        trip={selectedTrip}
        isOpen={showTripDetails}
        onClose={() => setShowTripDetails(false)}
        onFollow={handleStartFollow}
        showToast={showToast}
      />
      <FollowModal
        trip={followTrip}
        isOpen={showFollowModal}
        onClose={handleStopFollow}
        onFinish={() => {
          showToast({
            type: 'success',
            title: t('trips.trip_ended'),
            message: t('trips.trip_ended_msg')
          });
          handleStopFollow();
        }}
        showToast={showToast}
      />
    </div>
  );
};


export default Trips;

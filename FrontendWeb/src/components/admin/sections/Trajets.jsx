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
import LiveTripMap from '../../maps/LiveTripMap';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { leafletIcons } from '../../maps/leafletIcons';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../../services/adminService';
import { socketService } from '../../../services/socketService';
import { GeolocationService } from '../../../services/geolocation';
import ExportDropdown from '../ui/ExportDropdown';
import { exportToCSV, exportToPDF, exportToWord } from '../../../utils/exporters';
import { getFullAssetURL } from '../../../utils/urlHelper';

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

  // Helpers pour les avatars
  const getAvatarUrl = (path) => getFullAssetURL(path);

  const getUserAvatarInitials = (person) => {
    if (!person) return '?';
    if (person.firstName || person.lastName) {
      return `${person.firstName?.charAt(0) || ''}${person.lastName?.charAt(0) || ''}`.toUpperCase() || '?';
    }
    if (person.name) {
      const parts = person.name.split(' ');
      if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      return person.name.charAt(0).toUpperCase();
    }
    return '?';
  };

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

  const mapBackendTripToFrontend = (trip) => {
    const getStatus = (statut) => {
      switch (statut) {
        case 'TERMINEE': return 'completed';
        case 'EN_COURS': case 'ACCEPTEE': case 'ASSIGNEE': case 'ARRIVEE': return 'in-progress';
        case 'EN_ATTENTE': return 'pending';
        case 'ANNULEE': return 'cancelled';
        default: return 'pending';
      }
    };

    const getVehicleType = (v, requested) => {
      if (v && (v.marque || v.modele)) return `${v.marque || ''} ${v.modele || ''}`.trim();
      if (v && v.type) return v.type;
      return requested || 'Standard';
    };

    return {
      id: trip.reference || `TR-${trip._id.slice(-6).toUpperCase()}`,
      _id: trip._id,
      time: new Date(trip.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      route: `${(trip.depart || '').split(',').slice(0, 2).join(', ').replace(' ! ', ', ')} - ${(trip.destination || '').split(',').slice(0, 2).join(', ').replace(' ! ', ', ')}`,
      distance: `${trip.distanceKm} km`,
      duration: `${trip.dureeMin} min`,
      passenger: {
        firstName: trip.passager?.prenom || '',
        lastName: trip.passager?.nom || '',
        name: trip.passager ? `${trip.passager.prenom} ${trip.passager.nom}` : 'Utilisateur supprimé',
        phone: trip.passager?.telephone || '-',
        email: trip.passager?.email || '-',
        rating: trip.passager?.noteMoyenne ?? 5,
        tripsCount: trip.passager?.nombreTrajets || 0,
        memberSince: trip.passager?.createdAt ? new Date(trip.passager.createdAt).toLocaleDateString() : '-',
        avatarColor: 'bg-emerald-100 text-emerald-600',
        photoUrl: trip.passager?.photoUrl
      },
      driver: trip.chauffeur ? {
        firstName: trip.chauffeur.prenom || '',
        lastName: trip.chauffeur.nom || '',
        name: `${trip.chauffeur.prenom} ${trip.chauffeur.nom}`,
        phone: trip.chauffeur.telephone,
        rating: trip.chauffeur.noteMoyenne ?? 5,
        vehicleType: (() => {
          const marque = trip.chauffeur.vehicule?.marque || '';
          const modele = trip.chauffeur.vehicule?.modele || '';
          if (!marque && !modele) return trip.typeVehicule || 'Standard';
          if (modele.toLowerCase().startsWith(marque.toLowerCase())) return modele;
          return `${marque} ${modele}`.trim();
        })(),
        yearsExperience: trip.chauffeur.valideLe ? Math.max(0, Math.floor((new Date() - new Date(trip.chauffeur.valideLe)) / (1000 * 60 * 60 * 24 * 365))) : 0,
        experienceStr: trip.chauffeur.valideLe ? (
          (() => {
            const diff = new Date() - new Date(trip.chauffeur.valideLe);
            const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
            if (months < 1) return "< 1 mois";
            if (months < 12) return `${months} mois`;
            return `${Math.floor(months / 12)} ans`;
          })()
        ) : '0 ans',
        completedTrips: trip.chauffeur.nombreTrajets || 0,
        avatarColor: 'bg-blue-100 text-blue-600',
        photoUrl: trip.chauffeur.photoUrl,
        vehicle: trip.chauffeur.vehicule
      } : {
        firstName: '',
        lastName: '',
        name: 'En attente...',
        phone: '-',
        rating: 0,
        vehicleType: '-',
        yearsExperience: 0,
        experienceStr: '0 ans',
        completedTrips: 0,
        avatarColor: 'bg-gray-100 text-gray-400'
      },
      vehicle: {
        type: trip.chauffeur?.vehicule?.type || trip.typeVehicule || 'Standard',
        model: trip.chauffeur?.vehicule?.modele || '-',
        plate: trip.chauffeur?.vehicule?.immatriculation || '-',
        color: trip.chauffeur?.vehicule?.couleur || '-',
        year: '-',
        capacity: trip.chauffeur?.vehicule?.places || 4,
        fuelType: '-',
        features: []
      },
      amount: `${(trip.prix || 0).toLocaleString()} GNF`,
      paymentMethod: trip.paiement?.methode || trip.paiement?.mode || 'CASH',
      status: getStatus(trip.statut),
      date: new Date(trip.createdAt).toISOString().split('T')[0],
      rawDate: new Date(trip.createdAt),
      startTime: new Date(trip.createdAt).toLocaleTimeString(),
      endTime: null,
      startLocation: {
        lat: (trip.departCoords?.coordinates?.[1] && trip.departCoords.coordinates[1] !== 0) ? trip.departCoords.coordinates[1] : 9.509, // Fallback Conakry
        lng: (trip.departCoords?.coordinates?.[0] && trip.departCoords.coordinates[0] !== 0) ? trip.departCoords.coordinates[0] : -13.712,
        address: trip.depart,
        city: 'Guinée',
        district: trip.depart,
        zone: '-'
      },
      endLocation: {
        lat: (trip.destinationCoords?.coordinates?.[1] && trip.destinationCoords.coordinates[1] !== 0) ? trip.destinationCoords.coordinates[1] : 9.509,
        lng: (trip.destinationCoords?.coordinates?.[0] && trip.destinationCoords.coordinates[0] !== 0) ? trip.destinationCoords.coordinates[0] : -13.712,
        address: trip.destination,
        city: 'Guinée',
        district: trip.destination,
        zone: '-'
      },
      distanceKm: trip.distanceKm,
      durationMin: trip.dureeMin,
      fareBreakdown: {
        base: Math.round((trip.prix || 0) * 0.20), // 20% estimé
        distance: Math.round((trip.prix || 0) * 0.60), // 60% estimé
        time: Math.round((trip.prix || 0) * 0.20), // 20% estimé
        total: trip.prix || 0,
        commission: Math.round((trip.prix || 0) * 0.15),
        platformFee: 0,
        driverEarnings: Math.round((trip.prix || 0) * 0.85)
      },
      rating: null,
      notes: '',
      archived: false,
      starred: false,
      createdAt: trip.createdAt,
      updatedAt: trip.createdAt,
      efficiency: 0,
      carbonSaved: '0 kg'
    };
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
  const getStatusBadge = (status) => {
    const config = {
      completed: { label: t('trips.status.completed'), color: 'emerald', icon: CheckCircle },
      'in-progress': { label: t('trips.status.in_progress'), color: 'blue', icon: PlayCircle },
      pending: { label: t('trips.status.pending'), color: 'amber', icon: Clock },
      cancelled: { label: t('trips.status.cancelled'), color: 'rose', icon: XCircle }
    };

    const { label, color, icon: Icon } = config[status] || config.pending;
    return (
      <Badge className={`bg-${color}-50 text-${color}-700 border border-${color}-200`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getPaymentBadge = (method) => {
    const getMethod = (m) => {
      if (!m) return 'cash';
      const lower = m.toLowerCase();
      if (lower.includes('orange')) return 'orange';
      if (lower.includes('mtn')) return 'mtn';
      if (lower.includes('wave')) return 'wave';
      if (lower.includes('carte') || lower.includes('card')) return 'card';
      if (lower.includes('mobile') || lower.includes('money')) return 'orange'; // Fallback visuel (Orange par défaut)
      if (lower.includes('portefeuille') || lower.includes('wallet')) return 'card';
      return 'cash';
    };

    const m = getMethod(method);

    const config = {
      'cash': { label: t('payments.cash') || 'Espèces', color: 'emerald', icon: DollarSign },
      'orange': { label: t('payments.orange_money') || 'Orange Money', color: 'orange', icon: Phone },
      'mtn': { label: t('payments.mobile_money') || 'MTN Money', color: 'blue', icon: Smartphone },
      'wave': { label: t('payments.wave') || 'Wave', color: 'purple', icon: Zap },
      'card': { label: t('payments.card') || 'Carte', color: 'gray', icon: CreditCard },
    };

    const { label, color, icon: Icon } = config[m] || config.cash;
    return (
      <Badge className={`bg-${color}-50 text-${color}-700 border border-${color}-200`} size="sm">
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

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

  // Composant Actions pour tableau
  const TripActions = ({ trip }) => {
    const [showActions, setShowActions] = useState(false);

    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="small"
          icon={MoreVertical}
          onClick={() => setShowActions(!showActions)}
          className="hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 "
        />

        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-900 z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                <button
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                  onClick={() => {
                    setSelectedTrip(trip);
                    setShowTripDetails(true);
                    setShowActions(false);
                  }}
                >
                  <Eye className="w-4 h-4 mr-3 text-blue-500" />
                  {t('trips.view_details')}
                </button>

                {trip.status === 'in-progress' && (
                  <button
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                    onClick={() => {
                      handleStartFollow(trip);
                      setShowActions(false);
                    }}
                  >
                    <PlayCircle className="w-4 h-4 mr-3 text-green-500" />
                    {t('trips.follow_live')}
                  </button>
                )}

                <button
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                  onClick={() => {
                    showToast({
                      type: 'info',
                      title: t('booking.call_driver'),
                      message: `Appel vers ${trip.driver.phone}...`
                    });
                    setShowActions(false);
                  }}
                >
                  <Phone className="w-4 h-4 mr-3 text-emerald-500" />
                  {t('trips.call_driver')}
                </button>

                <div className="border-t border-gray-100 dark:border-gray-900/40 my-1"></div>

                <button
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(trip.id);
                    showToast({
                      type: 'success',
                      title: t('common.saved'),
                      message: t('trips.copy_id')
                    });
                    setShowActions(false);
                  }}
                >
                  <Copy className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                  {t('trips.copy_id')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Composant de carte de trajet (vue grille)
  const TripCard = ({ trip }) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-900 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
        onClick={() => {
          setSelectedTrip(trip);
          setShowTripDetails(true);
        }}
      >
        {/* En-tête avec status */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-900">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs">
                  {trip.id}
                </Badge>
                {getStatusBadge(trip.status)}
              </div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 group-hover:text-emerald-700 transition-colors">
                {trip.route}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{trip.time} • {trip.distance} • {trip.duration}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{trip.amount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{trip.paymentMethod}</div>
            </div>
          </div>

          {/* Points sur la ligne */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <div className="w-24 h-1 bg-emerald-300 mx-2"></div>
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{trip.efficiency || 0}% efficacité</div>
          </div>
        </div>

        {/* Passager et Chauffeur */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4">
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
                <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{trip.passenger.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Passager</p>
              </div>
            </div>
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
                <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{trip.driver.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Chauffeur</p>
              </div>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-900 grid grid-cols-2 gap-3">
            <div className="flex items-center text-sm">
              <Navigation className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
              <span className="text-gray-700 dark:text-gray-200">{trip.startLocation.district}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
              <span className="text-gray-700 dark:text-gray-200">{trip.endLocation.district}</span>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-900 bg-gray-50/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-2" />
              {trip.date}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="small"
                icon={Eye}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTrip(trip);
                  setShowTripDetails(true);
                }}
              />
              {trip.status === 'in-progress' && (
                <Button
                  variant="ghost"
                  size="small"
                  icon={PlayCircle}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartFollow(trip);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Modale de détails améliorée
  const TripDetailsModal = () => {
    if (!selectedTrip) return null;

    return (
      <Modal
        isOpen={showTripDetails}
        onClose={() => setShowTripDetails(false)}
        title={
          <div className="flex items-center  gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Route className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('trips.details_title')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('trips.details_subtitle')}</p>
            </div>
          </div>
        }
        size="xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 ">
          {/* En-tête amélioré */}
          <div className="bg-slate-200/30 dark:bg-gray-800 rounded-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{selectedTrip.route}</h2>
                <div className="flex items-center flex-wrap gap-2">
                  <Badge className="bg-gray-800 text-white">{selectedTrip.id}</Badge>
                  {getStatusBadge(selectedTrip.status)}
                  {getPaymentBadge(selectedTrip.paymentMethod)}
                  {selectedTrip.starred && (
                    <Badge className="bg-amber-50 text-amber-700 border border-amber-200">
                      <StarIcon className="w-3 h-3 mr-1" />
                      Favori
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{selectedTrip.amount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total du trajet</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('trips.distance')}</div>
                <div className="font-bold text-gray-800 dark:text-gray-100">{selectedTrip.distance}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('trips.duration')}</div>
                <div className="font-bold text-gray-800 dark:text-gray-100">{selectedTrip.duration}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('trips.date')}</div>
                <div className="font-bold text-gray-800 dark:text-gray-100">{selectedTrip.date}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('trips.start_time')}</div>
                <div className="font-bold text-gray-800 dark:text-gray-100">{selectedTrip.time}</div>
              </div>
            </div>
          </div>

          {/* Carte et itinéraire */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <MapIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  {t('trips.route_and_follow')}
                </CardTitle>
                {selectedTrip.status === 'in-progress' && (
                  <Button
                    variant="primary"
                    size="small"
                    icon={PlayCircle}
                    onClick={() => handleStartFollow(selectedTrip)}
                  >
                    {t('trips.follow_live')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl relative overflow-hidden">
                {/* Points sur la carte */}
                <div className="absolute top-6 left-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-white">{t('trips.depart')}</p>
                      <p className="text-xs text-gray-300">{selectedTrip.startLocation.address}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-6 right-6">
                  <div className="flex items-center">
                    <div className="mr-2 text-right">
                      <p className="text-sm font-medium text-white">{t('trips.arrival')}</p>
                      <p className="text-xs text-gray-300">{selectedTrip.endLocation.address}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  </div>
                </div>

                {/* Ligne de trajet */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-4/5">
                    <div className="w-full h-1 bg-gradient-to-r from-emerald-500 to-rose-500 rounded-full"></div>
                    {selectedTrip.status === 'in-progress' && (
                      <div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      >
                        <Car className="w-6 h-6 text-blue-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passager et Chauffeur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-emerald-600" />
                  {t('commissions.passenger_info')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xl font-bold border border-emerald-200 dark:border-emerald-800 overflow-hidden">
                    <span className="z-0">{getUserAvatarInitials(selectedTrip.passenger)}</span>
                    {selectedTrip.passenger.photoUrl && (
                      <img
                        src={getAvatarUrl(selectedTrip.passenger.photoUrl)}
                        alt={selectedTrip.passenger.name}
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{selectedTrip.passenger.name}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(selectedTrip.passenger.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">{selectedTrip.passenger.rating}/5</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTrip.passenger.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTrip.passenger.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Trajets</p>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTrip.passenger.tripsCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Membre depuis</p>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTrip.passenger.memberSince}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="w-5 h-5 mr-2 text-blue-600" />
                  {t('commissions.driver_info')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xl font-bold border border-blue-200 dark:border-blue-800 overflow-hidden">
                    <span className="z-0">{getUserAvatarInitials(selectedTrip.driver)}</span>
                    {selectedTrip.driver.photoUrl && (
                      <img
                        src={getAvatarUrl(selectedTrip.driver.photoUrl)}
                        alt={selectedTrip.driver.name}
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{selectedTrip.driver.name}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(selectedTrip.driver.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">{selectedTrip.driver.rating}/5</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTrip.driver.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Véhicule</p>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTrip.driver.vehicleType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Expérience</p>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTrip.driver.experienceStr}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Trajets</p>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTrip.driver.completedTrips}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Véhicule et finance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="w-5 h-5 mr-2 text-purple-600" />
                  Détails du véhicule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Modèle</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTrip.vehicle.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Plaque</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTrip.vehicle.plate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Couleur</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTrip.vehicle.color}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Capacité</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTrip.vehicle.capacity} places</p>
                    </div>
                  </div>
                  {selectedTrip.vehicle.features && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Équipements</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTrip.vehicle.features.map((feature, idx) => (
                          <Badge key={idx} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Détails financiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Tarif de base:</span>
                    <span className="font-medium">{selectedTrip.fareBreakdown.base} GNF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Distance:</span>
                    <span className="font-medium">{selectedTrip.fareBreakdown.distance} GNF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Temps:</span>
                    <span className="font-medium">{selectedTrip.fareBreakdown.time} GNF</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-900/40 pt-3 mt-3">
                    <div className="flex justify-between font-bold">
                      <span>{t('trips.total_fare')}:</span>
                      <span className="text-green-600">{selectedTrip.fareBreakdown.total} GNF</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <span>{t('trips.platform_commission')} (15%):</span>
                      <span className="text-rose-600">-{selectedTrip.fareBreakdown.commission} GNF</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{t('payments.processing_fees')}:</span>
                      <span>-{selectedTrip.fareBreakdown.platformFee} GNF</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-900/40 pt-3 mt-3">
                      <div className="flex justify-between font-bold">
                        <span>{t('trips.driver_earnings')}:</span>
                        <span className="text-blue-600">{selectedTrip.fareBreakdown.driverEarnings} GNF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-900/40">
            <Button
              variant="outline"
              onClick={() => setShowTripDetails(false)}
            >
              Fermer
            </Button>
            <Button
              variant="perso"
              icon={Share2}
              onClick={() => {
                navigator.clipboard.writeText(selectedTrip.id);
                showToast({
                  type: 'success',
                  title: 'Copié',
                  message: 'ID du trajet copié dans le presse-papier'
                });
              }}
            >
              Partager
            </Button>
          </div>
        </div>
      </Modal>
    );
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
            <TripCard key={trip.id} trip={trip} />
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
                          {getPaymentBadge(trip.paymentMethod)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      {getStatusBadge(trip.status)}
                      {trip.efficiency > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{trip.efficiency}% {t('trips.efficiency')}</div>
                      )}
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <TripActions trip={trip} />
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
      <TripDetailsModal />
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

// Extracted Modals to prevent re-renders inside main component
const FollowModal = ({ trip, isOpen, onClose, onFinish, showToast }) => {
  const { t } = useTranslation();
  const [realTimeProgress, setRealTimeProgress] = useState(0);
  const [driverPosition, setDriverPosition] = useState(null);
  const [metrics, setMetrics] = useState({ distanceTraveled: 0, distanceRemaining: 0, durationElapsed: 0 });
  const [trackingStatus, setTrackingStatus] = useState('initializing'); // initializing, connected, receiving, error

  useEffect(() => {
    if (isOpen && trip) {
      const roomID = trip._id;
      const joinRoom = () => {
        socketService.emit('reservation:join', { reservationId: roomID });
        setTrackingStatus('connected');
      };

      joinRoom();
      socketService.on('connect', joinRoom);

      const onJoinRefused = (data) => {
        setTrackingStatus('error');
        showToast({ type: 'error', title: t('trips.tracking_error_title'), message: data.message || t('trips.access_denied') });
      };

      const onJoinOk = (data) => {
        if (data.reservationId === roomID) setTrackingStatus('receiving');
      };

      socketService.on('reservation:join:refused', onJoinRefused);
      socketService.on('reservation:join:ok', onJoinOk);

      if (trip.startLocation) {
        setDriverPosition({ lat: trip.startLocation.lat, lng: trip.startLocation.lng });
      }

      const handlePositionUpdate = (data) => {
        if (data && String(data.reservationId) === String(roomID) && data.lat != null && data.lng != null) {
          if (trackingStatus !== 'receiving') setTrackingStatus('receiving');
          const newPos = { lat: parseFloat(data.lat), lng: parseFloat(data.lng) };
          setDriverPosition(newPos);

          if (trip.startLocation && trip.endLocation) {
            const calcTotalDist = GeolocationService.calculateDistance(
              trip.startLocation.lat, trip.startLocation.lng,
              trip.endLocation.lat, trip.endLocation.lng
            );
            const rawDist = String(trip.distance || "0").replace(/[^\d.-]/g, '');
            let totalDist = parseFloat(rawDist) || calcTotalDist || 1;
            if (totalDist < 0.1) totalDist = calcTotalDist || 1;

            const distToDest = GeolocationService.calculateDistance(newPos.lat, newPos.lng, trip.endLocation.lat, trip.endLocation.lng);
            let progress = totalDist > 0 ? ((totalDist - distToDest) / totalDist) * 100 : 0;
            if (distToDest < 0.2) progress = 100;
            progress = Math.min(100, Math.max(0, progress));

            setRealTimeProgress(Math.round(progress));
            setMetrics({
              distanceTraveled: Math.max(0, totalDist - distToDest).toFixed(1),
              distanceRemaining: distToDest.toFixed(1),
              durationElapsed: Math.round((progress / 100) * (parseFloat(String(trip.duration || "0").replace(/[^\d.-]/g, '')) || 10))
            });
          }
        }
      };

      const handleTripEnd = (data) => {
        if (data.reservationId === roomID) {
          showToast({ type: 'success', title: 'Trajet terminé', message: 'Le chauffeur est arrivé.' });
          onFinish();
        }
      };

      socketService.on('position:chauffeur', handlePositionUpdate);
      socketService.on('course:arrive_destination', handleTripEnd);
      socketService.on('course:finit_avec_paiement', handleTripEnd);

      return () => {
        socketService.off('connect', joinRoom);
        socketService.off('reservation:join:refused', onJoinRefused);
        socketService.off('reservation:join:ok', onJoinOk);
        socketService.off('position:chauffeur', handlePositionUpdate);
        socketService.off('course:arrive_destination', handleTripEnd);
        socketService.off('course:finit_avec_paiement', handleTripEnd);
      };
    }
  }, [isOpen, trip, onFinish, showToast]);

  if (!trip) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
            <Satellite className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('trips.live_tracking_admin')}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('trips.trip')} {trip.id}</p>
              <span className={`w-2 h-2 rounded-full ${trackingStatus === 'receiving' ? 'bg-emerald-500 animate-pulse' :
                trackingStatus === 'connected' ? 'bg-blue-500' :
                  trackingStatus === 'error' ? 'bg-rose-500' : 'bg-gray-400'
                }`} />
              <span className="text-[10px] uppercase font-bold text-gray-400">{t(`trips.tracking_${trackingStatus}`) || trackingStatus}</span>
            </div>
          </div>
        </div>
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* Carte de suivi en temps réel */}
        <LiveTripMap
          trip={trip}
          progress={realTimeProgress}
          currentLocation={driverPosition}
          height={320}
        />

        {/* Métriques de suivi */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{realTimeProgress}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('trips.progression')}</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {metrics.distanceTraveled} km
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('trips.traveled')}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {metrics.durationElapsed} min
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('trips.elapsed')}</div>
          </div>
        </div>

        {/* Debug Info (Collapsible or just small text for now) */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-900 mt-4">
          <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
            <span>{t('trips.diagnostic')}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  console.log("🔄 [Admin] Manual re-join triggered");
                  socketService.emit('reservation:join', { reservationId: trip._id });
                }}
                className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-[9px]"
              >
                {t('trips.rejoin')}
              </button>
              <span className={trackingStatus === 'receiving' ? 'text-emerald-500' : 'text-amber-500'}>{t(`trips.tracking_${trackingStatus}`) || trackingStatus}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono">
            <div className="text-gray-400">Room ID: <span className="text-gray-700 dark:text-gray-300 truncate inline-block w-24 align-bottom">{trip._id}</span></div>
            <div className="text-gray-400">Socket: <span className="text-gray-700 dark:text-gray-300 truncate inline-block w-24 align-bottom">{socketService.socket?.id || 'Déconnecté'}</span></div>
            <div className="text-gray-400">Status: <span className="text-gray-700 dark:text-gray-300">{trackingStatus}</span></div>
            <div className="text-gray-400">Métr.: <span className="text-gray-700 dark:text-gray-300">{trip.startLocation && trip.endLocation ? 'OK' : 'Manquant'}</span></div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('trips.progression')}</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{realTimeProgress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${realTimeProgress}%` }}
            />
          </div>
        </div>

        {/* Informations */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3 text-white">
                <User size={18} />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{trip.passenger.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('trips.passenger')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="small"
              icon={Phone}
              onClick={() => {
                showToast({
                  type: 'info',
                  title: 'Appel',
                  message: `Appel vers ${trip.passenger.phone}...`
                });
              }}
            />
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mr-3 text-white">
                <Car size={18} />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{trip.driver.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chauffeur • {trip.vehicle.plate || trip.vehicle.type}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="small"
              icon={Phone}
              onClick={() => {
                showToast({
                  type: 'info',
                  title: t('common.call') || 'Appel',
                  message: t('common.calling_phone', { phone: trip.driver.phone }) || `Appel vers ${trip.driver.phone}...`
                });
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fermer
          </Button>
          <Button
            variant="primary"
            onClick={onFinish}
          >
            Forcer Fin Trajet
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default Trips;

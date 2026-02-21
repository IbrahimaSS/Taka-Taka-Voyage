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
  Copy
} from 'lucide-react';
import LiveTripMap from '../../maps/LiveTripMap';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { leafletIcons } from '../../maps/leafletIcons';
import { adminService } from '../../../services/adminService';
import { socketService } from '../../../services/socketService';
import { GeolocationService } from '../../../services/geolocation';

// TODO API (admin/trajets):
// Remplacer les donnees simulees et les actions locales par des appels backend
// Exemple: GET API_ROUTES.trips.list, PATCH /trips/:id (status), etc.
const Trips = ({ showToast }) => {
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
  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${cleanPath}`;
  };

  const getInitials = (person) => {
    if (!person) return '?';
    // Si l'objet a firstName/lastName (notre mapping)
    if (person.firstName || person.lastName) {
      return `${person.firstName?.charAt(0) || ''}${person.lastName?.charAt(0) || ''}`.toUpperCase();
    }
    // Fallback sur le nom complet si seulement name est dispo
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
      route: `${trip.depart} → ${trip.destination}`,
      distance: `${trip.distanceKm} km`,
      duration: `${trip.dureeMin} min`,
      passenger: {
        firstName: trip.passager?.prenom || '',
        lastName: trip.passager?.nom || '',
        name: trip.passager ? `${trip.passager.prenom} ${trip.passager.nom}` : 'Utilisateur supprimé',
        phone: trip.passager?.telephone || '-',
        email: trip.passager?.email || '-',
        rating: 5,
        tripsCount: 0,
        memberSince: '-',
        avatarColor: 'bg-emerald-100 text-emerald-600',
        photoUrl: trip.passager?.photoUrl
      },
      driver: trip.chauffeur ? {
        firstName: trip.chauffeur.prenom || '',
        lastName: trip.chauffeur.nom || '',
        name: `${trip.chauffeur.prenom} ${trip.chauffeur.nom}`,
        phone: trip.chauffeur.telephone,
        rating: 5,
        vehicleType: getVehicleType(trip.chauffeur.vehicule, trip.typeVehicule),
        yearsExperience: 0,
        completedTrips: 0,
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
        completedTrips: 0,
        avatarColor: 'bg-gray-100 text-gray-400'
      },
      vehicle: {
        type: trip.chauffeur?.vehicule?.type || trip.typeVehicule || 'Standard',
        plate: trip.chauffeur?.vehicule?.immatriculation || '-',
        color: trip.chauffeur?.vehicule?.couleur || '-',
        year: '-',
        capacity: trip.chauffeur?.vehicule?.places || 4,
        fuelType: '-',
        features: []
      },
      amount: `${(trip.prix || 0).toLocaleString()} GNF`,
      paymentMethod: 'Espèces', // Default for now
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
        base: 0,
        distance: 0,
        time: 0,
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
      label: 'Tous les trajets',
      icon: Layers,
      count: tripsData.length,
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'in-progress',
      label: 'En cours',
      icon: PlayCircle,
      count: tripsData.filter(t => t.status === 'in-progress').length,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'completed',
      label: 'Terminés',
      icon: CheckCircle,
      count: tripsData.filter(t => t.status === 'completed').length,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'pending',
      label: 'En attente',
      icon: Clock,
      count: tripsData.filter(t => t.status === 'pending').length,
      color: 'from-amber-500 to-yellow-600'
    },
    {
      id: 'cancelled',
      label: 'Annulés',
      icon: XCircle,
      count: tripsData.filter(t => t.status === 'cancelled').length,
      color: 'from-rose-500 to-pink-600'
    },
  ];

  // Statistiques
  const stats = useMemo(() => [
    {
      title: "Trajets actifs",
      value: apiStats ? apiStats.trajetsEnCours.toString() : tripsData.filter(t => t.status === 'in-progress').length.toString(),
      icon: Activity,
      color: "blue",
      trend: "up",
      percentage: 0,
      progress: 85,
      iconBg: 'from-blue-500/20 to-blue-600/10'
    },
    {
      title: "Revenus aujourd'hui",
      value: apiStats ? `${apiStats.revenusJournaliers.toLocaleString()} GNF` : '0 GNF',
      icon: TrendingUp,
      color: "emerald",
      trend: "up",
      percentage: 0,
      progress: 92,
      iconBg: 'from-emerald-500/20 to-emerald-600/10'
    },
    {
      title: "Distance totale",
      value: apiStats && apiStats.distanceTotale ? `${apiStats.distanceTotale.toFixed(1)} km` : '0.0 km',
      icon: Navigation,
      color: "purple",
      trend: "up",
      percentage: 0,
      progress: 78,
      iconBg: 'from-purple-500/20 to-purple-600/10'
    }
  ], [tripsData, apiStats]);

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
      completed: { label: 'Terminé', color: 'emerald', icon: CheckCircle },
      'in-progress': { label: 'En cours', color: 'blue', icon: PlayCircle },
      pending: { label: 'En attente', color: 'amber', icon: Clock },
      cancelled: { label: 'Annulé', color: 'rose', icon: XCircle }
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
    const config = {
      'Espèces': { label: 'Espèces', color: 'emerald', icon: DollarSign },
      'Mobile Money': { label: 'Mobile Money', color: 'blue', icon: Smartphone },
      'Orange Money': { label: 'Orange Money', color: 'orange', icon: Phone },
      'Wave': { label: 'Wave', color: 'purple', icon: Zap },
    };

    const { label, color, icon: Icon } = config[method] || { label: method, color: 'gray', icon: DollarSign };
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
    showToast({
      type: 'success',
      title: 'Export réussi',
      message: `Les données ont été exportées en ${format.toUpperCase()}`,
    });
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
                  Voir détails
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
                    Suivre en direct
                  </button>
                )}

                <button
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                  onClick={() => {
                    showToast({
                      type: 'info',
                      title: 'Appel',
                      message: `Appel vers ${trip.driver.phone}...`
                    });
                    setShowActions(false);
                  }}
                >
                  <Phone className="w-4 h-4 mr-3 text-emerald-500" />
                  Appeler le chauffeur
                </button>

                <div className="border-t border-gray-100 dark:border-gray-900/40 my-1"></div>

                <button
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(trip.id);
                    showToast({
                      type: 'success',
                      title: 'Copié',
                      message: 'ID du trajet copié dans le presse-papier'
                    });
                    setShowActions(false);
                  }}
                >
                  <Copy className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                  Copier l'ID
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
                <span className="z-0">{getInitials(trip.passenger)}</span>
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
                <span className="z-0">{getInitials(trip.driver)}</span>
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
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Détails du trajet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Informations complètes et suivi</p>
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
                <div className="text-sm text-gray-500 dark:text-gray-400">Distance</div>
                <div className="font-bold text-gray-800 dark:text-gray-100">{selectedTrip.distance}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Durée</div>
                <div className="font-bold text-gray-800 dark:text-gray-100">{selectedTrip.duration}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Date</div>
                <div className="font-bold text-gray-800 dark:text-gray-100">{selectedTrip.date}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Heure</div>
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
                  Itinéraire et suivi
                </CardTitle>
                {selectedTrip.status === 'in-progress' && (
                  <Button
                    variant="primary"
                    size="small"
                    icon={PlayCircle}
                    onClick={() => handleStartFollow(selectedTrip)}
                  >
                    Suivre en direct
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
                      <p className="text-sm font-medium text-white">Départ</p>
                      <p className="text-xs text-gray-300">{selectedTrip.startLocation.address}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-6 right-6">
                  <div className="flex items-center">
                    <div className="mr-2 text-right">
                      <p className="text-sm font-medium text-white">Arrivée</p>
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
                  Informations du passager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xl font-bold border border-emerald-200 dark:border-emerald-800 overflow-hidden">
                    <span className="z-0">{getInitials(selectedTrip.passenger)}</span>
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
                  Informations du chauffeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xl font-bold border border-blue-200 dark:border-blue-800 overflow-hidden">
                    <span className="z-0">{getInitials(selectedTrip.driver)}</span>
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
                        <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTrip.driver.yearsExperience} ans</p>
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
                      <p className="font-medium text-gray-800 dark:text-gray-100">{selectedTrip.vehicle.type}</p>
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
                      <span>Total passager:</span>
                      <span className="text-green-600">{selectedTrip.fareBreakdown.total} GNF</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <span>Commission (15%):</span>
                      <span className="text-rose-600">-{selectedTrip.fareBreakdown.commission} GNF</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Frais plateforme:</span>
                      <span>-{selectedTrip.fareBreakdown.platformFee} GNF</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-900/40 pt-3 mt-3">
                      <div className="flex justify-between font-bold">
                        <span>Gains chauffeur:</span>
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Gestion des trajets</h1>
          <p className="text-gray-500 dark:text-gray-400">Surveillez et gérez tous les trajets en temps réel</p>
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
                  {tripsData.filter(t => t.status === 'in-progress').length} véhicules en circulation
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
                placeholder="Rechercher un trajet par ID, passager, chauffeur ou itinéraire..."
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
              Filtres
            </Button>
            <div className="relative" ref={exportMenuRef}>
              <Button
                variant="outline"
                icon={Download}
                onClick={() => setShowExportMenu(!showExportMenu)}
                className='text-sm'
              >
                Exporter

              </Button>

              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white  rounded-xl shadow-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-900/40 z-50 overflow-hidden"
                  >
                    <div className="p-2">
                      <button
                        onClick={() => handleExport('pdf')}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 transition-colors"
                      >
                        <FileText className="w-4 h-4 mr-3 text-red-500" />
                        Export PDF
                      </button>
                      <button
                        onClick={() => handleExport('excel')}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 transition-colors"
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-3 text-green-500" />
                        Export Excel
                      </button>
                      <button
                        onClick={() => handleExport('csv')}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 transition-colors"
                      >
                        <Database className="w-4 h-4 mr-3 text-blue-500" />
                        Export CSV
                      </button>
                      <button
                        onClick={() => handleExport('json')}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 transition-colors"
                      >
                        <FilePieChart className="w-4 h-4 mr-3 text-purple-500" />
                        Export JSON
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="in-progress">En cours</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
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
                {viewMode === 'table' ? 'Grille' : 'Tableau'}
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
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Historique des trajets</h3>
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
                  <th className="pb-4 font-semibold">Itinéraire</th>
                  <th className="pb-4 font-semibold">Passager</th>
                  <th className="pb-4 font-semibold">Chauffeur</th>
                  <th className="pb-4 font-semibold">Montant</th>
                  <th className="pb-4 font-semibold">Statut</th>
                  <th className="pb-4 pr-6 font-semibold text-right">Actions</th>
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
                        <div className="flex items-center mt-1">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Direct</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="relative w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 overflow-hidden mr-3">
                          <span className="z-0">{getInitials(trip.passenger)}</span>
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
                          <span className="z-0">{getInitials(trip.driver)}</span>
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
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{trip.efficiency}% efficacité</div>
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
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">Aucun trajet trouvé</p>
              <p className="text-gray-400 dark:text-gray-500">
                Essayez de modifier vos filtres ou de rafraîchir la liste
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
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      <TripDetailsModal />
      {/* Modales */}
      <TripDetailsModal />
      <FollowModal
        trip={followTrip}
        isOpen={showFollowModal}
        onClose={handleStopFollow}
        onFinish={() => {
          showToast({
            type: 'success',
            title: 'Trajet terminé',
            message: 'Le trajet a été marqué comme terminé'
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
        showToast({ type: 'error', title: 'Erreur Suivi', message: data.message || 'Accès refusé' });
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
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Suivi en direct (Admin)</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Trajet {trip.id}</p>
              <span className={`w-2 h-2 rounded-full ${trackingStatus === 'receiving' ? 'bg-emerald-500 animate-pulse' :
                trackingStatus === 'connected' ? 'bg-blue-500' :
                  trackingStatus === 'error' ? 'bg-rose-500' : 'bg-gray-400'
                }`} />
              <span className="text-[10px] uppercase font-bold text-gray-400">{trackingStatus}</span>
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
            <div className="text-sm text-gray-600 dark:text-gray-400">Progression</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {metrics.distanceTraveled} km
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Parcourus</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {metrics.durationElapsed} min
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Ecoulés (est.)</div>
          </div>
        </div>

        {/* Debug Info (Collapsible or just small text for now) */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-900 mt-4">
          <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
            <span>Diagnostic temps réel</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  console.log("🔄 [Admin] Manual re-join triggered");
                  socketService.emit('reservation:join', { reservationId: trip._id });
                }}
                className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-[9px]"
              >
                Rejoindre
              </button>
              <span className={trackingStatus === 'receiving' ? 'text-emerald-500' : 'text-amber-500'}>{trackingStatus}</span>
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
            <span className="text-gray-600 dark:text-gray-400">Progression du trajet</span>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Passager</p>
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
                  title: 'Appel',
                  message: `Appel vers ${trip.driver.phone}...`
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

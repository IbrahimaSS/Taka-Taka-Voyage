// components/passager/TripsHistory.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, User, MapPin, Tag, Circle, Star,
  Download, Filter, ChevronLeft, ChevronRight,
  Eye, RotateCcw, Search, X, TrendingUp,
  BarChart3, PieChart, FileText, Share2,
  Phone, MessageCircle, CheckCircle, Clock,
  Car, Users, Navigation, Award, Zap,
  ChevronDown, MoreVertical, SortAsc, SortDesc,
  Printer, Smartphone, Grid, Motorbike, CreditCard, Receipt
} from 'lucide-react';

// Composants UI réutilisables
import Button from '../admin/ui/Bttn';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import Table, { TableRow, TableCell, TableHeader } from '../admin/ui/Table';
import Badge from '../admin/ui/Badge';
import Modal from '../admin/ui/Modal';
import Pagination from '../admin/ui/Pagination';
import ExportDropdown from '../admin/ui/ExportDropdown';
import PremiumInvoice from '../admin/ui/PremiumInvoice';

// Context et services
import { usePassenger } from '../../context/PassengerContext';
import { tripService } from '../../services/tripService'; // ✅ Import service
import { toast } from 'react-hot-toast';
import PaymentModal from './PaymentModal';

// --- Composants Internes ---

const StatCard = ({ label, value, icon: Icon, colorClass, onClick }) => (
  <Card hoverable padding="p-6" onClick={onClick} className="cursor-pointer">
    <div className="flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </Card>
);

const FilterChip = ({ active, onClick, icon: Icon, label }) => (
  <Button
    variant={active ? 'primary' : 'secondary'}
    size="small"
    onClick={onClick}
    icon={Icon}
    className={active ? '' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300'}
  >
    {label}
  </Button>
);

const TripStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const config = {
    completed: {
      variant: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400',
      icon: CheckCircle,
      label: t('history.status.completed')
    },
    cancelled: {
      variant: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-700 dark:text-red-400',
      icon: X,
      label: t('history.status.cancelled')
    },
    pending: {
      variant: 'warning',
      icon: Clock,
      label: t('history.status.pending')
    },
    in_progress: {
      variant: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400',
      icon: Navigation,
      label: t('history.status.in_progress')
    }
  };

  const { variant, icon: Icon, label } = config[status] || config.pending;

  return (
    <Badge size="sm" className={`bg-${variant} inline-flex items-center`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
};

const TripDetailsModal = ({ trip, isOpen, onClose, onShare, onContact, onPay, onShowInvoice }) => {
  const { t } = useTranslation();
  const getAvatarUrl = (path) => {
    if (!path) return null;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    const first = parts[0]?.charAt(0) || '';
    const last = parts[1]?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('history.details.title')}
      size="lg"
    >
      {trip && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-700 dark:to-gray-700/50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('history.details.date_time')}</p>
              <p className="font-semibold text-gray-900 dark:text-white">{trip.date}</p>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-emerald-900/10 p-4 rounded-xl font-poppins">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('history.details.status')}</p>
              <TripStatusBadge status={trip.status} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('history.details.pickup')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{trip.departure}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-rose-600 dark:text-rose-400 mr-3 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('history.details.destination')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{trip.destination}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('history.details.driver')}</p>
              <div className="flex items-center mt-2 group">
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-emerald-200 to-blue-200 dark:from-emerald-900/30 dark:to-blue-900/30 flex items-center justify-center mr-3 ring-2 ring-emerald-500/20 overflow-hidden">
                  <span className="z-0 font-bold text-xs">{getInitials(trip.driver?.name)}</span>
                  {trip.driver?.photo && (
                    <img
                      src={getAvatarUrl(trip.driver.photo)}
                      alt={trip.driver.name}
                      className="absolute inset-0 w-full h-full object-cover z-10"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{trip.driver?.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">{trip.driver?.vehicle}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl flex flex-col justify-center shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('history.details.price_paid')}</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{trip.price}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl shadow-sm border border-amber-100/50 dark:border-amber-800/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('history.details.rating_given')}</p>
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(trip.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-lg font-bold text-amber-600 dark:text-amber-500">
                  {trip.rating?.toFixed(1)}/5
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl shadow-sm border border-purple-100/50 dark:border-purple-800/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('history.details.distance')}</p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-1">{trip.distance}</p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              {t('history.details.close')}
            </Button>
            <Button
              variant="warning"
              onClick={() => onShowInvoice(trip)}
              icon={Receipt}
              className="flex-1"
            >
              {t('history.details.invoice')}
            </Button>
            <Button
              variant="primary"
              onClick={onShare}
              icon={Share2}
              className="flex-1"
            >
              {t('history.details.share')}
            </Button>
            <Button
              variant="primary"
              onClick={onContact}
              icon={Phone}
              className="flex-1"
            >
              {t('history.details.contact')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

const TripsHistory = () => {
  const { t } = useTranslation();
  const getAvatarUrl = (path) => {
    if (!path) return null;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    const first = parts[0]?.charAt(0) || '';
    const last = parts[1]?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const { passenger } = usePassenger(); // ✅ Keep user context if needed, remove trips

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState('all');
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // ✅ Fetch Real History
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const { data } = await tripService.getPassengerHistory({
          page: currentPage,
          limit: 50 // Fetch enough for client-side filtering or handle server-side later
        });

        if (data.succes) {
          const formattedTrips = data.trajets.map(t_raw => ({
            id: t_raw._id,
            date: new Date(t_raw.createdAt).toLocaleString(undefined, {
              day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
            }),
            status: t_raw.statut === 'TERMINEE' ? 'completed' : 'cancelled',
            departure: t_raw.depart || (t_raw.pointDepart && t_raw.pointDepart.adresse) || (t_raw.reservation && t_raw.reservation.depart) || 'Non défini',
            destination: t_raw.destination || (t_raw.pointDestination && t_raw.pointDestination.adresse) || (t_raw.reservation && t_raw.reservation.destination) || 'Non défini',
            price: `${(t_raw.prix || t_raw.montantTotal || 0).toLocaleString()} GNF`,
            distance: String(t_raw.distanceKm || t_raw.distance || 0).includes('km') ? (t_raw.distanceKm || t_raw.distance || '0 km') : `${t_raw.distanceKm || t_raw.distance || 0} km`,
            rating: t_raw.note || 0,
            driver: (() => {
              const driverCandidates = [t_raw.chauffeur, t_raw.driver, t_raw.reservation?.chauffeur, t_raw.reservation?.driver].filter(c => c && typeof c === 'object');

              // 1. NOM COMPLET (Fusion intelligente Prénom + Nom)
              let dName = '';
              let fName = '';
              let lName = '';
              let fullN = '';

              driverCandidates.forEach(c => {
                const u = c.utilisateur || c.user || c;
                if (u.prenom && !fName) fName = String(u.prenom).trim();
                if (u.nom && !lName) lName = String(u.nom).trim();
                if ((u.nomComplet || u.name || u.display_name) && !fullN) fullN = String(u.nomComplet || u.name || u.display_name).trim();
              });

              if (fullN && fullN.includes(' ')) dName = fullN;
              else if (fName && lName) dName = `${fName} ${lName}`;
              else dName = fullN || fName || lName || '';

              if (!dName || dName.length < 3) dName = t_raw.driverName || t_raw.chauffeurName || 'Chauffeur TakaTaka';

              // 2. TÉLÉPHONE (Scanner Nucléaire)
              let dPhone = '-';
              const pKeys = [
                'telephone', 'phone', 'tel', 'mobile', 'phoneNumber', 'num_tel',
                'driverPhone', 'chauffeurPhone', 'tel_chauffeur', 'driver_phone',
                'chauffeur_phone', 'whatsapp'
              ];

              const sObjects = [
                ...driverCandidates,
                ...driverCandidates.map(c => c.utilisateur || c.user),
                t_raw,
                t_raw.reservation,
                t_raw.reservation?.chauffeur,
                t_raw.reservation?.driver
              ].filter(o => o && typeof o === 'object');

              for (const obj of sObjects) {
                for (const k of pKeys) {
                  const val = obj[k];
                  if (val && String(val).trim().length > 3 && !['N/A', '-', 'NULL', 'UNDEFINED'].includes(String(val).toUpperCase().trim())) {
                    dPhone = String(val).trim();
                    break;
                  }
                }
                if (dPhone !== '-') break;
              }

              // 3. VÉHICULE
              let dVeh = 'Véhicule standard';
              for (const c of driverCandidates) {
                const v = c.vehicule || c.vehicle || t_raw.vehicule || t_raw.vehicle;
                if (v && typeof v === 'object') {
                  const vStr = [v.marque, v.modele, v.immatriculation || v.plaque].filter(Boolean).join(' ').trim();
                  if (vStr.length > 1) { dVeh = vStr; break; }
                  else if (v.type && typeof v.type === 'string') { dVeh = v.type; break; }
                } else if (typeof v === 'string' && v.trim().length > 2) {
                  dVeh = v.trim(); break;
                }
              }

              // 4. EMAIL
              let dEmail = '-';
              const eKeys = ['email', 'mail', 'courriel'];
              for (const obj of sObjects) {
                for (const k of eKeys) {
                  const val = obj[k];
                  if (val && typeof val === 'string' && val.includes('@')) {
                    dEmail = val.trim();
                    break;
                  }
                }
                if (dEmail !== '-') break;
              }

              return {
                name: dName,
                vehicle: dVeh,
                rating: 5,
                phone: dPhone,
                email: dEmail,
                photo: driverCandidates[0]?.photoUrl || driverCandidates[0]?.utilisateur?.photoUrl
              };
            })(),
            payment: t_raw.paiement_methode || t_raw.paymentMethod || 'Espèces',
            duration: String(t_raw.dureeMin || t_raw.duree || t_raw.duration || 0).includes('min') ? (t_raw.dureeMin || t_raw.duree || t_raw.duration || '0 min') : `${t_raw.dureeMin || t_raw.duree || t_raw.duration || 0} min`,
            rawDate: t_raw.createdAt
          }));
          setTrips(formattedTrips);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentPage]); // Reload when page changes if server pagination used, here we fetch 50 and filter locally for now

  const vehicleFilters = [
    { id: 'all', label: t('history.vehicle.all'), icon: Grid },
    { id: 'Taxi', label: t('history.vehicle.taxi'), icon: Car },
    { id: 'Moto-taxi', label: t('history.vehicle.moto'), icon: Motorbike },
    { id: 'Voiture privée', label: t('history.vehicle.private'), icon: Smartphone },
  ];

  const statusFilters = [
    { id: 'all', label: t('history.status.all'), icon: BarChart3 },
    { id: 'completed', label: t('history.status.completed'), icon: CheckCircle },
    { id: 'cancelled', label: t('history.status.cancelled'), icon: X },
    { id: 'pending', label: t('history.status.pending'), icon: Clock },
  ];

  const dateFilters = [
    { id: 'all', label: t('history.date.all'), icon: Calendar },
    { id: 'today', label: t('history.date.today'), icon: Calendar },
    { id: 'week', label: t('history.date.week'), icon: Calendar },
    { id: 'month', label: t('history.date.month'), icon: Calendar },
  ];

  const sortedTrips = useMemo(() => {
    const sortableItems = [...trips];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'date') {
          aValue = new Date(a.date.split(',')[0]);
          bValue = new Date(b.date.split(',')[0]);
        }

        if (sortConfig.key === 'price') {
          aValue = parseInt(a.price.replace(/[^0-9]/g, ''));
          bValue = parseInt(b.price.replace(/[^0-9]/g, ''));
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [trips, sortConfig]);

  const filteredTrips = useMemo(() => {
    return sortedTrips.filter(trip => {
      const matchesSearch = searchTerm === '' ||
        trip.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.departure?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = activeFilter === 'all' || trip.status === activeFilter;
      const matchesVehicle = selectedVehicleType === 'all' ||
        trip.driver?.vehicle?.toLowerCase().includes(selectedVehicleType.toLowerCase());

      return matchesSearch && matchesStatus && matchesVehicle;
    });
  }, [sortedTrips, searchTerm, activeFilter, selectedVehicleType]);

  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrips = filteredTrips.slice(startIndex, endIndex);

  const stats = useMemo(() => {
    const total = filteredTrips.length;
    const completed = filteredTrips.filter(t => t.status === 'completed').length;
    const cancelled = filteredTrips.filter(t => t.status === 'cancelled').length;
    const totalDistance = filteredTrips.reduce((sum, trip) => sum + parseFloat(trip.distance || 0), 0);
    const totalCost = filteredTrips.reduce((sum, trip) => {
      return sum + parseInt(trip.price.replace(/[^0-9]/g, '') || 0);
    }, 0);
    const averageRating = filteredTrips.length > 0
      ? filteredTrips.reduce((sum, trip) => sum + (trip.rating || 0), 0) / filteredTrips.length
      : 0;

    return { total, completed, cancelled, totalDistance, totalCost, averageRating };
  }, [filteredTrips]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleContactDriver = (driverPhone) => {
    window.open(`tel:${driverPhone}`);
  };

  const handleShareTrip = (trip) => {
    const shareText = t('history.sharing.text', {
      date: trip.date,
      departure: trip.departure,
      destination: trip.destination,
      price: trip.price,
      rating: trip.rating
    });

    if (navigator.share) {
      navigator.share({
        title: 'Mon trajet TakaTaka',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success(t('history.sharing.copied'));
    }
  };

  const handleViewDetails = (trip) => {
    setSelectedTrip(trip);
    setShowDetailsModal(true);
  };

  const handleShowInvoice = (trip) => {
    // ❌ Fermer la modale de détails pour ne pas avoir d'overlay conflictuel
    setShowDetailsModal(false);

    // Transformer l'objet trajet pour qu'il soit compatible avec PremiumInvoice
    const formattedInvoice = {
      invoiceNumber: `INV-${trip.id.substring(0, 8)}`.toUpperCase(),
      date: trip.date,
      transactionId: trip.id,
      status: 'paid', // Historique passager = trajets complétés et payés
      method: trip.payment || 'ESPECES',
      amount: trip.price,
      passenger: {
        name: [passenger?.prenom, passenger?.nom].filter(Boolean).join(' ').trim() || '-',
        phone: passenger?.telephone || passenger?.phone || '-',
        email: passenger?.email || passenger?.mail || '-'
      },
      driver: {
        name: trip.driver?.name || 'Chauffeur TakaTaka',
        vehicle: trip.driver?.vehicle || 'Véhicule standard',
        phone: trip.driver?.phone || '-',
        email: trip.driver?.email || '-'
      },
      trip: {
        route: `${trip.departure} → ${trip.destination}`,
        distance: trip.distance ? (trip.distance.includes('km') ? trip.distance : `${trip.distance} km`) : '-',
        duration: trip.duration || '0 min'
      },
      fees: {
        platform: 'Incl.'
      }
    };
    setInvoiceData(formattedInvoice);
    setShowInvoice(true);
  };

  

  const resetFilters = () => {
    setSearchTerm('');
    setActiveFilter('all');
    setSortConfig({ key: 'date', direction: 'desc' });
    toast.success(t('history.reset_filters'));
  };

  return (
    <div className="min-h-screen  pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* En-tête */}
        <CardHeader align="start" className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div>
              <CardTitle size="xl" className="text-gray-900 dark:text-white">{t('history.title')}</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{t('history.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-3">
              <ExportDropdown
                data={filteredTrips}
                columns={[
                  { accessor: 'date', header: t('history.table.date') },
                  { accessor: 'driver.name', header: t('history.table.driver') },
                  { accessor: 'departure', header: t('history.table.pickup') },
                  { accessor: 'destination', header: t('history.table.destination') },
                  { accessor: 'price', header: t('history.table.price') },
                  { accessor: 'status', header: t('history.table.status') },
                  { accessor: 'rating', header: t('history.details.rating_given') }
                ]}
                fileName="historique_takataka"
                title={t('history.title')}
                className="mr-2"
              />
              <Button
                variant="secondary"
                onClick={resetFilters}
                icon={RotateCcw}
              >
                {t('history.refresh')}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label={t('history.total')}
            value={stats.total}
            icon={BarChart3}
            colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"
          />
          <StatCard
            label={t('history.total_distance')}
            value={`${stats.totalDistance.toFixed(1)} km`}
            icon={Navigation}
            colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"
          />
          <StatCard
            label={t('history.average_rating')}
            value={stats.averageRating.toFixed(1)}
            icon={Award}
            colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"
          />
        </div>

        {/* Filtres */}
        <Card hoverable className="mb-8">
          <CardContent padding="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  placeholder={t('history.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">{t('history.status.title')}:</span>
                  {statusFilters.map((filter) => (
                    <FilterChip
                      key={filter.id}
                      active={activeFilter === filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      icon={filter.icon}
                      label={filter.label}
                    />
                  ))}
                </div>

                
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des trajets */}
        <AnimatePresence mode="wait">
          {filteredTrips.length > 0 ? (
            <motion.div
              key="trips-table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card hoverable>
                <CardContent padding="p-0">
                  <div className="overflow-x-auto mx-auto font-medium">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr>
                          <TableHeader>
                            <button onClick={() => requestSort('date')} className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {t('history.table.date')}
                              {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                            </button>
                          </TableHeader>
                          <TableHeader>{t('history.table.driver')}</TableHeader>
                          <TableHeader>{t('history.table.pickup')}</TableHeader>
                          <TableHeader>{t('history.table.destination')}</TableHeader>
                          <TableHeader>
                            <button onClick={() => requestSort('price')} className="flex items-center">
                              <Tag className="w-4 h-4 mr-2" />
                              {t('history.table.price')}
                              {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                            </button>
                          </TableHeader>
                          <TableHeader>{t('history.table.status')}</TableHeader>
                          <TableHeader>{t('history.table.actions')}</TableHeader>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTrips.map((trip) => (
                          <TableRow key={trip.id} hoverable>
                            <TableCell>
                              <div onClick={() => handleViewDetails(trip)} className="cursor-pointer group">
                                <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-500 transition-colors">{trip.date?.split(',')[0]}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{trip.date?.split(',')[1]}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-200 to-blue-200 dark:from-emerald-900/30 dark:to-blue-900/30 flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-gray-700 shadow-sm">
                                    <span className="z-0 font-bold text-xs">{getInitials(trip.driver?.name)}</span>
                                    {trip.driver?.photo && (
                                      <img
                                        src={getAvatarUrl(trip.driver.photo)}
                                        alt={trip.driver.name}
                                        className="absolute inset-0 w-full h-full object-cover z-10 rounded-full"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                      />
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{trip.driver?.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                    <Car className="w-3 h-3 mr-1 opacity-70" />
                                    {trip.driver?.vehicle}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div onClick={() => handleViewDetails(trip)} className="cursor-pointer">
                                <div className="flex items-center">
                                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-3 shadow-lg shadow-emerald-500/20"></div>
                                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium line-clamp-1">{trip.departure}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div onClick={() => handleViewDetails(trip)} className="cursor-pointer">
                                <div className="flex items-center">
                                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-full mr-3 shadow-lg shadow-rose-500/20"></div>
                                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium line-clamp-1">{trip.destination}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-black text-emerald-700 dark:text-emerald-400 text-lg">{trip.price}</span>
                            </TableCell>
                            <TableCell>
                              <TripStatusBadge status={trip.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                
                                <Button
                                  variant="ghost"
                                  size="small"
                                  icon={Eye}
                                  onClick={() => handleViewDetails(trip)}
                                  tooltip="Voir les détails"
                                />
                                <Button
                                  variant="ghost"
                                  size="small"
                                  icon={Share2}
                                  onClick={() => handleShareTrip(trip)}
                                  tooltip="Partager"
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>

                <CardFooter align="between" className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('history.pagination.showing')} <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}</span> {t('history.pagination.to')}{' '}
                    <span className="font-bold text-gray-900 dark:text-white">{Math.min(endIndex, filteredTrips.length)}</span> {t('history.pagination.of')}{' '}
                    <span className="font-bold text-gray-900 dark:text-white">{filteredTrips.length}</span> {t('history.pagination.results')}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    pageSize={itemsPerPage}
                    totalItems={filteredTrips.length}
                    showInfo={false}
                  />

                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:border-primary-500 outline-none transition-all"
                  >
                    <option value={8}>8 {t('history.pagination.per_page')}</option>
                    <option value={16}>16 {t('history.pagination.per_page')}</option>
                    <option value={24}>24 {t('history.pagination.per_page')}</option>
                    <option value={50}>50 {t('history.pagination.per_page')}</option>
                  </select>
                </CardFooter>
              </Card>
            </motion.div>
          ) : (
            <Card>
              <CardContent className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('history.no_trips')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">{t('history.no_trips_desc')}</p>
                <Button
                  variant="primary"
                  onClick={resetFilters}
                  icon={RotateCcw}
                >
                  {t('history.reset_filters')}
                </Button>
              </CardContent>
            </Card>
          )}
        </AnimatePresence>
      </div>

      {/* Modale de détails */}
      <TripDetailsModal
        trip={selectedTrip}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onShare={() => selectedTrip && handleShareTrip(selectedTrip)}
        onContact={() => selectedTrip?.driver?.phone && handleContactDriver(selectedTrip.driver.phone)}
       
        onShowInvoice={handleShowInvoice}
      />

      {/* Aperçu Facture */}
      <AnimatePresence>
        {showInvoice && (
          <PremiumInvoice
            payment={invoiceData}
            onClose={() => setShowInvoice(false)}
          />
        )}
      </AnimatePresence>

      
    </div>
  );
};

export default TripsHistory;
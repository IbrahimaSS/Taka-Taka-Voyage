// components/passager/TripsHistory.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, User, MapPin, Tag, Circle, Star,
  Download, Filter, ChevronLeft, ChevronRight,
  Eye, RotateCcw, Search, X, TrendingUp,
  BarChart3, PieChart, FileText, Share2,
  Phone, MessageCircle, CheckCircle, Clock,
  Car, Users, Navigation, Award, Zap,
  ChevronDown, MoreVertical, SortAsc, SortDesc,
  Printer, Smartphone, Grid, Motorbike, CreditCard
} from 'lucide-react';

// Composants UI réutilisables
import Button from '../admin/ui/Bttn';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import Table, { TableRow, TableCell, TableHeader } from '../admin/ui/Table';
import Badge from '../admin/ui/Badge';
import Modal from '../admin/ui/Modal';
import Pagination from '../admin/ui/Pagination';
import ExportDropdown from '../admin/ui/ExportDropdown';

// Context et services
import { usePassenger } from '../../context/PassengerContext';
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
  const config = {
    completed: {
      variant: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400',
      icon: CheckCircle,
      label: 'Terminé'
    },
    cancelled: {
      variant: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-700 dark:text-red-400',
      icon: X,
      label: 'Annulé'
    },
    pending: {
      variant: 'warning',
      icon: Clock,
      label: 'En attente'
    },
    in_progress: {
      variant: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400',
      icon: Navigation,
      label: 'En cours'
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

const TripDetailsModal = ({ trip, isOpen, onClose, onShare, onContact, onPay }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Détails du trajet"
    size="lg"
  >
    {trip && (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-700 dark:to-gray-700/50 p-4 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400">Date et heure</p>
            <p className="font-semibold text-gray-900 dark:text-white">{trip.date}</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-emerald-900/10 p-4 rounded-xl font-poppins">
            <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
            <TripStatusBadge status={trip.status} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Départ</p>
              <p className="font-medium text-gray-900 dark:text-white">{trip.departure}</p>
            </div>
          </div>
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-rose-600 dark:text-rose-400 mr-3 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Destination</p>
              <p className="font-medium text-gray-900 dark:text-white">{trip.destination}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Chauffeur</p>
            <div className="flex items-center mt-2 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-200 to-blue-200 dark:from-emerald-900/30 dark:to-blue-900/30 flex items-center justify-center mr-3 ring-2 ring-emerald-500/20">
                <User className="w-5 h-5 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{trip.driver?.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">{trip.driver?.vehicle}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl flex flex-col justify-center shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Prix payé</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{trip.price}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl shadow-sm border border-amber-100/50 dark:border-amber-800/20">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Note attribuée</p>
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
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Distance</p>
            <p className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-1">{trip.distance}</p>
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Fermer
          </Button>
          {trip.status === 'completed' && trip.payment === 'Espèces' && (
            <Button
              variant="warning"
              onClick={onPay}
              icon={CreditCard}
              className="flex-1"
            >
              Payer
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onShare}
            icon={Share2}
            className="flex-1"
          >
            Partager
          </Button>
          <Button
            variant="primary"
            onClick={onContact}
            icon={Phone}
            className="flex-1"
          >
            Contacter
          </Button>
        </div>
      </div>
    )}
  </Modal>
);

// --- Composant Principal ---

const TripsHistory = () => {
  const { trips: initialTrips } = usePassenger();

  const [trips, setTrips] = useState(initialTrips);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tripToPay, setTripToPay] = useState(null);

  const vehicleFilters = [
    { id: 'all', label: 'Tous véhicules', icon: Grid },
    { id: 'Taxi', label: 'Taxi', icon: Car },
    { id: 'Moto-taxi', label: 'Moto', icon: Motorbike },
    { id: 'Voiture privée', label: 'Privé', icon: Smartphone },
  ];

  const statusFilters = [
    { id: 'all', label: 'Tous', icon: BarChart3 },
    { id: 'completed', label: 'Terminés', icon: CheckCircle },
    { id: 'cancelled', label: 'Annulés', icon: X },
    { id: 'pending', label: 'En attente', icon: Clock },
  ];

  const dateFilters = [
    { id: 'all', label: 'Toutes dates', icon: Calendar },
    { id: 'today', label: "Aujourd'hui", icon: Calendar },
    { id: 'week', label: 'Cette semaine', icon: Calendar },
    { id: 'month', label: 'Ce mois', icon: Calendar },
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
    const shareText = `Mon trajet TakaTaka du ${trip.date} : ${trip.departure} → ${trip.destination} pour ${trip.price} ⭐ ${trip.rating}/5`;

    if (navigator.share) {
      navigator.share({
        title: 'Mon trajet TakaTaka',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Détails du trajet copiés dans le presse-papier');
    }
  };

  const handleViewDetails = (trip) => {
    setSelectedTrip(trip);
    setShowDetailsModal(true);
  };

  const handleOpenPayment = (trip) => {
    setTripToPay(trip);
    setShowPaymentModal(true);
  };

  const onPaymentSuccess = (paymentResult) => {
    toast.success('Paiement confirmé ! Votre historique sera mis à jour.');
    setShowPaymentModal(false);
    setTrips(prev => prev.map(t =>
      t.id === tripToPay.id ? { ...t, payment: paymentResult.paymentMethod } : t
    ));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setActiveFilter('all');
    setSelectedVehicleType('all');
    setSortConfig({ key: 'date', direction: 'desc' });
    toast.success('Filtres réinitialisés');
  };

  return (
    <div className="min-h-screen  pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* En-tête */}
        <CardHeader align="start" className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div>
              <CardTitle size="xl" className="text-gray-900 dark:text-white">Historique des trajets</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Vos déplacements en un coup d'œil</p>
            </div>
            <div className="flex items-center space-x-3">
              <ExportDropdown
                data={filteredTrips}
                columns={[
                  { key: 'date', label: 'Date' },
                  { key: 'driver.name', label: 'Chauffeur' },
                  { key: 'departure', label: 'Départ' },
                  { key: 'destination', label: 'Destination' },
                  { key: 'price', label: 'Prix' },
                  { key: 'status', label: 'Statut' },
                  { key: 'rating', label: 'Note' }
                ]}
                fileName="historique_takataka"
                title="Historique des trajets"
                className="mr-2"
              />
              <Button
                variant="secondary"
                onClick={resetFilters}
                icon={RotateCcw}
              >
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Total trajets"
            value={stats.total}
            icon={BarChart3}
            colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"
          />
          <StatCard
            label="Distance totale"
            value={`${stats.totalDistance.toFixed(1)} km`}
            icon={Navigation}
            colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"
          />
          <StatCard
            label="Note moyenne"
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
                <Search className="absolute left-4 top-0 bottom-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  placeholder="Rechercher par chauffeur, lieu ou destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Statut:</span>
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

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Véhicule:</span>
                  {vehicleFilters.map((filter) => (
                    <FilterChip
                      key={filter.id}
                      active={selectedVehicleType === filter.id}
                      onClick={() => setSelectedVehicleType(filter.id)}
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
                  <div className="overflow-x-auto mx-auto">

                    <thead>
                      <tr>
                        <TableHeader>
                          <button onClick={() => requestSort('date')} className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            DATE
                            {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                          </button>
                        </TableHeader>
                        <TableHeader>CHAUFFEUR</TableHeader>
                        <TableHeader>DÉPART</TableHeader>
                        <TableHeader>DESTINATION</TableHeader>
                        <TableHeader>
                          <button onClick={() => requestSort('price')} className="flex items-center">
                            <Tag className="w-4 h-4 mr-2" />
                            PRIX
                            {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                          </button>
                        </TableHeader>
                        <TableHeader>STATUT</TableHeader>
                        <TableHeader>ACTIONS</TableHeader>
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
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-200 to-blue-200 dark:from-emerald-900/30 dark:to-blue-900/30 flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-700 dark:text-blue-300" />
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
                              {trip.status === 'completed' && trip.payment === 'Espèces' && (
                                <Button
                                  variant="ghost"
                                  size="small"
                                  icon={CreditCard}
                                  onClick={() => handleOpenPayment(trip)}
                                  tooltip="Payer maintenant"
                                />
                              )}
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
                  </div>
                </CardContent>

                <CardFooter align="between" className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Affichage de <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}</span> à{' '}
                    <span className="font-bold text-gray-900 dark:text-white">{Math.min(endIndex, filteredTrips.length)}</span> sur{' '}
                    <span className="font-bold text-gray-900 dark:text-white">{filteredTrips.length}</span> trajets
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
                    <option value={8}>8 par page</option>
                    <option value={16}>16 par page</option>
                    <option value={24}>24 par page</option>
                    <option value={50}>50 par page</option>
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aucun trajet trouvé</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Essayez de modifier vos critères de recherche</p>
                <Button
                  variant="primary"
                  onClick={resetFilters}
                  icon={RotateCcw}
                >
                  Réinitialiser les filtres
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
        onPay={() => {
          setShowDetailsModal(false);
          selectedTrip && handleOpenPayment(selectedTrip);
        }}
      />

      {/* Modale de paiement */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={onPaymentSuccess}
        amount={tripToPay ? parseInt(tripToPay.price.replace(/[^0-9]/g, '')) : 0}
        tripDetails={tripToPay}
        user={trips[0]?.passenger}
      />
    </div>
  );
};

export default TripsHistory;
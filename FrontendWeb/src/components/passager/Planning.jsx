// components/passager/Planning.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Car, Users,
  ChevronRight, Plus, Filter, Trash2,
  Download, Search, X, ChevronDown,
  CheckCircle, AlertCircle, Share2,
  Bell, Grid, List, ChevronLeft, Navigation, ArrowUpRight,
  MoreVertical, Smartphone, Wallet, CreditCard, Gift, RefreshCw, BarChart3, Info,
  Motorbike, FileText, Printer
} from 'lucide-react';

// Composants UI réutilisables
import Button from '../admin/ui/Bttn';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import Badge from '../admin/ui/Badge';
import Modal from '../admin/ui/Modal';
import ExportDropdown from '../admin/ui/ExportDropdown';
import Pagination from '../admin/ui/Pagination';
import Table, { TableRow, TableCell, TableHeader } from '../admin/ui/Table';

// Services
import { toast } from 'react-hot-toast';
import CalendarComponent from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import planningService from '../../services/planningService';
import { socketService } from '../../services/socketService';

// --- Composants Internes ---

const StatCard = ({ label, value, icon: Icon, colorClass, onClick }) => (
  <Card hoverable padding="p-6" onClick={onClick} className="cursor-pointer dark:bg-gray-800 dark:border-gray-700">
    <div className="flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
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
    className={active ? '' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}
  >
    {label}
  </Button>
);

const TripStatusBadge = ({ status }) => {
  const config = {
    ACCEPTEE: {
      variant: 'bg-green-500/20 text-green-700',
      icon: CheckCircle,
      label: 'Confirmé'
    },
    EN_ATTENTE: {
      variant: 'bg-amber-500/20 text-amber-700',
      icon: Clock,
      label: 'En attente'
    },
    ANNULEE: {
      variant: 'bg-red-500/20 text-red-700',
      icon: AlertCircle,
      label: 'Annulé'
    },
    TERMINEE: {
      variant: 'bg-blue-500/20 text-blue-700',
      icon: CheckCircle,
      label: 'Terminé'
    }
  };

  const current = config[status] || config.EN_ATTENTE;
  const Icon = current.icon;

  return (
    <Badge size="sm" className={`inline-flex items-center ${current.variant}`}>
      <Icon className="w-3 h-3 mr-1" />
      {current.label}
    </Badge>
  );
};

const TripListItem = ({ trip, onClick }) => (
  <Card hoverable padding="p-6" onClick={() => onClick(trip)} className="cursor-pointer dark:bg-gray-800 dark:border-gray-700">
    <div className="flex justify-between items-start mb-4">
      <TripStatusBadge status={trip.status} />
      <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-500">
        <span className="text-xl">
          {trip.vehicle === 'Moto-taxi' ? <Motorbike className="w-5 h-5" /> : <Car className="w-5 h-5" />}
        </span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>

    <div className="space-y-4">
      <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100 dark:before:bg-blue-900/30">
        <div className="mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider mb-1">Départ</p>
          <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">{trip.pickup}</h4>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider mb-1">Destination</p>
          <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">{trip.destination}</h4>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
          {trip.date}
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4 mr-2 text-emerald-500" />
          {trip.time}
        </div>
      </div>
      <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{trip.price}</span>
    </div>
  </Card>
);

const TripDetailsModal = ({ trip, isOpen, onClose, onDelete, onDownload }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Détails de la programmation"
    size="lg"
  >
    {trip && (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center">
              {trip.vehicle === 'Moto-taxi' ? (
                <Motorbike className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              ) : (
                <Car className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{trip.vehicle}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Auto-assigné</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Prix estimé</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{trip.price}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Point de départ</p>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100">{trip.pickup}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Destination</p>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100">{trip.destination}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Date</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{trip.date}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Heure</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{trip.time}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <Users className="w-5 h-5 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{trip.passengers || 1} Passagers</p>
          </div>
          <div className="text-center">
            <Navigation className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{trip.distanceKm || 'N/A'} KM</p>
          </div>
          <div className="text-center">
            <Info className="w-5 h-5 text-amber-500 dark:text-amber-400 mx-auto mb-2" />
            <TripStatusBadge status={trip.status} />
          </div>
        </div>

        {trip.driver && (
          <Card className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
            <CardContent padding="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">Chauffeur assigné</p>
                    <p className="text-base font-bold">{trip.driver.prenom} {trip.driver.nom}</p>
                    <p className="text-xs opacity-60 mt-1">{trip.driver.telephone}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="small" icon={Share2} className="bg-white/20 hover:bg-white/30 text-white" />
                  <Button variant="ghost" size="small" icon={Download} className="bg-white/20 hover:bg-white/30 text-white" onDownload={onDownload} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1">Fermer</Button>
          <Button variant="primary" onClick={onDownload} icon={Download} className="flex-1">Reçu</Button>
          {(trip.status === 'EN_ATTENTE' || trip.status === 'ACCEPTEE') && (
            <Button variant="danger" onClick={() => onDelete(trip.id)} icon={Trash2} size="large" className="w-13 h-12" />
          )}
        </div>
      </div>
    )}
  </Modal>
);

// --- Composant Principal ---

const Planning = ({ onBack, onBookNewTrip }) => {
  const [scheduledTrips, setScheduledTrips] = useState([]);
  const [stats, setStats] = useState({ totalTrajets: 0, confirmes: 0, enAttente: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const [activeFilter, setActiveFilter] = useState('all');
  const [activeVehicleFilter, setActiveVehicleFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'Tous', icon: BarChart3 },
    { id: 'ACCEPTEE', label: 'Confirmés', icon: CheckCircle },
    { id: 'EN_ATTENTE', label: 'En attente', icon: Clock },
    { id: 'ANNULEE', label: 'Annulés', icon: AlertCircle },
  ];

  const vehicleFilters = [
    { id: 'all', label: 'Tous véhicules', icon: Grid },
    { id: 'Taxi', label: 'Taxi', icon: Car },
    { id: 'Moto-taxi', label: 'Moto', icon: Motorbike },
    { id: 'Voiture privée', label: 'Privé', icon: Smartphone },
  ];

  const fetchPlanningData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        statut: activeFilter === 'all' ? undefined : activeFilter,
        typeVehicule: activeVehicleFilter === 'all' ? undefined : activeVehicleFilter,
        q: searchTerm || undefined,
        dateFrom: selectedDate || undefined,
        dateTo: selectedDate || undefined
      };

      const res = await planningService.getPlanning(params);
      if (res.succes) {
        const formatted = res.plannings.map(t => ({
          id: t._id,
          date: new Date(t.datePlanifiee).toLocaleDateString('fr-FR'),
          time: new Date(t.datePlanifiee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          pickup: t.depart,
          destination: t.destination,
          vehicle: t.typeVehicule,
          passengers: t.passagers || 1,
          price: `${(t.prix || 0).toLocaleString()} FG`,
          status: t.statut,
          driver: t.chauffeur,
          distanceKm: t.distanceKm
        }));
        setScheduledTrips(formatted);
        setStats(res.stats);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du planning:", error);
      toast.error("Impossible de charger votre planning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanningData();

    const handleSocketUpdate = () => {
      console.log("🔄 Mise à jour planning passager reçue");
      fetchPlanningData();
    };

    socketService.on("reservation:planifiee_acceptee", handleSocketUpdate);
    socketService.on("course:annulee", handleSocketUpdate);

    return () => {
      socketService.off("reservation:planifiee_acceptee", handleSocketUpdate);
      socketService.off("course:annulee", handleSocketUpdate);
    };
  }, [currentPage, itemsPerPage, activeFilter, activeVehicleFilter, searchTerm, selectedDate]);

  const tripDates = useMemo(() => {
    return scheduledTrips.reduce((acc, trip) => {
      // Pour une meilleure précision du calendrier, on pourrait avoir besoin de tous les trajets (pas que la page actuelle)
      // Mais ici on utilise ce qu'on a. Idéalement le backend renverrait les jours occupés.
      const dateParts = trip.date.split('/');
      const d = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`).toDateString();
      if (!acc[d]) acc[d] = [];
      acc[d].push(trip.status);
      return acc;
    }, {});
  }, [scheduledTrips]);

  const handleTripClick = (trip) => {
    setSelectedTrip(trip);
    setShowModal(true);
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      const res = await planningService.cancelPlanning(tripId);
      if (res.succes) {
        toast.success('Trajet annulé avec succès');
        setShowModal(false);
        fetchPlanningData();
      }
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'annulation");
    }
  };

  const resetFilters = () => {
    setActiveFilter('all');
    setActiveVehicleFilter('all');
    setSearchTerm('');
    setSelectedDate(null);
    setCalendarDate(new Date());
    toast.success('Filtres réinitialisés');
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* En-tête */}
        <CardHeader align="start" className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div>
              <CardTitle size="xl">Planning des trajets</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Suivez et exportez votre agenda de mobilité</p>
            </div>
            <div className="flex items-center space-x-3">
              <ExportDropdown
                data={scheduledTrips}
                columns={[
                  { key: 'date', label: 'Date' },
                  { key: 'time', label: 'Heure' },
                  { key: 'pickup', label: 'Départ' },
                  { key: 'destination', label: 'Destination' },
                  { key: 'vehicle', label: 'Véhicule' },
                  { key: 'price', label: 'Prix' },
                  { key: 'status', label: 'Statut' }
                ]}
                fileName="planning_takataka"
                title="Planning des trajets"
                className="mr-2"
              />
              <Button variant="primary" onClick={onBookNewTrip} icon={Plus}>Nouveau Trajet</Button>
            </div>
          </div>
        </CardHeader>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total Trajets" value={stats.totalTrajets} icon={BarChart3} colorClass="bg-gradient-to-r from-blue-500 to-blue-600" />
          <StatCard label="Confirmés" value={stats.confirmes} icon={CheckCircle} colorClass="bg-gradient-to-r from-emerald-500 to-emerald-600" />
          <StatCard label="En attente" value={stats.enAttente} icon={Clock} colorClass="bg-gradient-to-r from-amber-500 to-orange-600" />
        </div>

        {/* Filtres */}
        <Card hoverable className="mb-8 dark:bg-gray-800 dark:border-gray-700">
          <CardContent padding="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  placeholder="Rechercher par lieu ou destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Statut:</span>
                  {filters.map((f) => (
                    <FilterChip key={f.id} active={activeFilter === f.id} onClick={() => setActiveFilter(f.id)} icon={f.icon} label={f.label} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Véhicule:</span>
                  {vehicleFilters.map((vf) => (
                    <FilterChip key={vf.id} active={activeVehicleFilter === vf.id} onClick={() => setActiveVehicleFilter(vf.id)} icon={vf.icon} label={vf.label} />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Calendrier */}
          <div className="lg:col-span-4 space-y-6">
            <Card hoverable className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent padding="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                    Calendrier
                  </h3>
                  <Button variant="ghost" size="small" onClick={() => { setCalendarDate(new Date()); setSelectedDate(null); }}>Aujourd'hui</Button>
                </div>
                <div className="premium-calendar-v5">
                  <CalendarComponent
                    onChange={setCalendarDate}
                    value={calendarDate}
                    onClickDay={(date) => {
                      const d = date.toISOString().split('T')[0];
                      setSelectedDate(selectedDate === d ? null : d);
                      setCurrentPage(1);
                    }}
                    tileContent={({ date, view }) => {
                      if (view === 'month') {
                        const dayStat = tripDates[date.toDateString()];
                        if (dayStat) {
                          return (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {dayStat.includes('ACCEPTEE') && <div className="w-1 h-1 bg-emerald-500 rounded-full" />}
                              {dayStat.includes('EN_ATTENTE') && <div className="w-1 h-1 bg-amber-500 rounded-full" />}
                              {dayStat.includes('ANNULEE') && <div className="w-1 h-1 bg-rose-500 rounded-full" />}
                            </div>
                          );
                        }
                      }
                      return null;
                    }}
                    locale="fr-FR"
                    className="!w-full !border-0"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-600 to-emerald-600 text-white">
              <div className="p-6">
                <div className="relative">
                  <div className="absolute top-0 right-0 opacity-10"><Smartphone className="w-12 h-12" /></div>
                  <h3 className="text-lg font-bold mb-2">Synchronisation Mobile</h3>
                  <p className="text-sm text-white/80 mb-4">Recevez des rappels 15 minutes avant chaque départ programmé.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Liste des trajets */}
          <div className="lg:col-span-8">
            <Card hoverable>
              <CardContent padding="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {selectedDate ? (
                        <span className="flex items-center text-blue-600 dark:text-blue-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          Trajets du {new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                        </span>
                      ) : 'Tous les trajets programmés'}
                    </h3>
                  </div>
                  <span className="text-sm font-semibold px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                    {stats.totalTrajets} Trajets trouvés
                  </span>
                </div>

                {loading ? (
                  <div className="py-20 text-center text-gray-500">Chargement de votre planning...</div>
                ) : scheduledTrips.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Aucun trajet trouvé</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-6">Aucun trajet ne correspond à vos critères. Essayez de modifier vos filtres.</p>
                    <Button variant="primary" onClick={resetFilters} icon={Filter}>Réinitialiser les filtres</Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[80vh] custom-scrollbar-v5 pr-1 pb-4">
                      <AnimatePresence mode="popLayout">
                        {scheduledTrips.map(trip => (
                          <TripListItem key={trip.id} trip={trip} onClick={handleTripClick} />
                        ))}
                      </AnimatePresence>
                    </div>

                    <CardFooter align="between" className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Page <span className="font-bold">{currentPage}</span> sur <span className="font-bold">{Math.ceil(stats.totalTrajets / itemsPerPage) || 1}</span>
                      </div>

                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(stats.totalTrajets / itemsPerPage)}
                        onPageChange={setCurrentPage}
                        pageSize={itemsPerPage}
                        totalItems={stats.totalTrajets}
                        showInfo={false}
                      />

                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-500"
                      >
                        <option value={6}>6 par page</option>
                        <option value={12}>12 par page</option>
                        <option value={20}>20 par page</option>
                      </select>
                    </CardFooter>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <TripDetailsModal
        trip={selectedTrip}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onDelete={handleDeleteTrip}
        onDownload={() => {
          toast.success('Reçu téléchargé');
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default Planning;
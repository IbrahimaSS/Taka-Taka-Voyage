// src/components/sections/Drivers.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Ban, Check, Phone, Calendar, User, Car, UserCircle, Star, Download, MapPin, CarIcon, CheckCircle, XCircle, Clock, Filter, X, ChevronDown, RefreshCw } from 'lucide-react';
import StatCard from '../layout/StatCard';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Bttn';
import Modal from '../ui/Modal';
import Pagination from '../ui/Pagination';
import ConfirmModal from '../ui/ConfirmModal';
import ExportDropdown from '../ui/ExportDropdown';
import useDriverActions from '../../../hooks/useDriver';

const Drivers = ({ showToast }) => {
  // États principaux
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // États pour les modales
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Hook d'actions chauffeur (Activer / Désactiver / Suspendre)
  const { confirmationModal, openStatusModal, confirmAction, closeConfirmationModal } = useDriverActions({
    drivers,
    setDrivers,
    showToast,
  });

  // Données simulées
  // TODO API (admin/chauffeurs):
  // Remplacer ces donnees simulees par un fetch via driverService/adminService
  // Exemple: GET API_ROUTES.drivers.list
  const initialDrivers = [
    {
      id: 1,
      name: 'Kouamé Adou',
      type: 'Moto-taxi',
      vehicle: 'Yamaha Crypton',
      plate: 'AB-123-CD',
      phone: '+33 6 12 34 56 78',
      email: 'kouame.adou@email.com',
      joinDate: '2024-03-15',
      lastActive: '2024-11-20 14:30',
      trips: 247,
      rating: 4.8,
      earnings: 12500,
      status: 'active',
      verification: 'verified',
      city: 'Abidjan',
      zone: 'Plateau',
      color: 'green',
      documents: {
        license: true,
        insurance: true,
        registration: true
      }
    },
    {
      id: 2,
      name: 'Aïcha Diarra',
      type: 'Taxi partagé',
      vehicle: 'Toyota Corolla',
      plate: 'EF-456-GH',
      phone: '+33 7 87 65 43 21',
      email: 'aicha.diarra@email.com',
      joinDate: '2024-02-22',
      lastActive: '2024-11-20 10:15',
      trips: 189,
      rating: 4.6,
      earnings: 9800,
      status: 'suspended',
      verification: 'pending',
      city: 'Bamako',
      zone: 'Badalabougou',
      color: 'blue',
      documents: {
        license: true,
        insurance: false,
        registration: true
      }
    },
    {
      id: 3,
      name: 'Mohamed Sylla',
      type: 'Voiture privée',
      vehicle: 'Mercedes Classe C',
      plate: 'IJ-789-KL',
      phone: '+33 5 55 44 33 22',
      email: 'mohamed.sylla@email.com',
      joinDate: '2024-01-10',
      lastActive: '2024-11-19 18:45',
      trips: 312,
      rating: 4.9,
      earnings: 21500,
      status: 'inactive',
      verification: 'verified',
      city: 'Dakar',
      zone: 'Almadies',
      color: 'purple',
      documents: {
        license: true,
        insurance: true,
        registration: true
      }
    },
    {
      id: 4,
      name: 'Fatoumata Bâ',
      type: 'Moto-taxi',
      vehicle: 'Honda CG 125',
      plate: 'MN-234-OP',
      phone: '+33 6 98 76 54 32',
      email: 'fatoumata.ba@email.com',
      joinDate: '2024-04-05',
      lastActive: '2024-11-20 09:20',
      trips: 156,
      rating: 4.4,
      earnings: 7800,
      status: 'active',
      verification: 'rejected',
      city: 'Conakry',
      zone: 'Ratoma',
      color: 'yellow',
      documents: {
        license: true,
        insurance: false,
        registration: false
      }
    },
    {
      id: 5,
      name: 'Samuel Mensah',
      type: 'Taxi partagé',
      vehicle: 'Hyundai Elantra',
      plate: 'QR-567-ST',
      phone: '+33 6 43 21 98 76',
      email: 'samuel.mensah@email.com',
      joinDate: '2024-03-28',
      lastActive: '2024-11-20 12:45',
      trips: 203,
      rating: 4.7,
      earnings: 11200,
      status: 'active',
      verification: 'verified',
      city: 'Accra',
      zone: 'Osu',
      color: 'green',
      documents: {
        license: true,
        insurance: true,
        registration: true
      }
    },
    {
      id: 6,
      name: 'Mariam Diallo',
      type: 'Voiture privée',
      vehicle: 'Peugeot 3008',
      plate: 'UV-890-WX',
      phone: '+33 7 65 43 21 09',
      email: 'mariam.diallo@email.com',
      joinDate: '2024-05-15',
      lastActive: '2024-11-19 22:10',
      trips: 98,
      rating: 4.2,
      earnings: 5400,
      status: 'inactive',
      verification: 'pending',
      city: 'Ouagadougou',
      zone: 'Koulouba',
      color: 'blue',
      documents: {
        license: true,
        insurance: true,
        registration: false
      }
    },
    {
      id: 7,
      name: 'Youssef Benali',
      type: 'Moto-taxi',
      vehicle: 'Suzuki DR 200',
      plate: 'YZ-123-AB',
      phone: '+33 6 54 32 10 98',
      email: 'youssef.benali@email.com',
      joinDate: '2024-06-20',
      lastActive: '2024-11-20 11:30',
      trips: 178,
      rating: 4.5,
      earnings: 8900,
      status: 'suspended',
      verification: 'verified',
      city: 'Casablanca',
      zone: 'Maarif',
      color: 'purple',
      documents: {
        license: true,
        insurance: true,
        registration: true
      }
    },
    {
      id: 8,
      name: 'Grace Akinyi',
      type: 'Taxi partagé',
      vehicle: 'Toyota RAV4',
      plate: 'CD-456-EF',
      phone: '+33 7 89 01 23 45',
      email: 'grace.akinyi@email.com',
      joinDate: '2024-02-10',
      lastActive: '2024-11-20 08:15',
      trips: 265,
      rating: 4.8,
      earnings: 14300,
      status: 'active',
      verification: 'verified',
      city: 'Nairobi',
      zone: 'Westlands',
      color: 'green',
      documents: {
        license: true,
        insurance: true,
        registration: true
      }
    },
  ];

  // Configuration des filtres
  const filterOptions = {
    status: [
      { value: 'all', label: 'Tous les statuts' },
      { value: 'active', label: 'Actif' },
      { value: 'inactive', label: 'Inactif' },
      { value: 'suspended', label: 'Suspendu' },
    ],
    verification: [
      { value: 'all', label: 'Tous les états' },
      { value: 'verified', label: 'Vérifié' },
      { value: 'pending', label: 'En attente' },
      { value: 'rejected', label: 'Rejeté' },
    ],
    type: [
      { value: 'all', label: 'Tous les types' },
      { value: 'Moto-taxi', label: 'Moto-taxi' },
      { value: 'Taxi partagé', label: 'Taxi partagé' },
      { value: 'Voiture privée', label: 'Voiture privée' },
    ]
  };

  // Initialisation des données
  // TODO API (admin/chauffeurs):
  // Remplacer le setTimeout par un appel backend pour charger les chauffeurs
  useEffect(() => {
    const loadDrivers = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      setDrivers(initialDrivers);
      setFilteredDrivers(initialDrivers);
      setLoading(false);
    };

    loadDrivers();
  }, []);

  // Stats calculées
  const stats = useMemo(() => {
    const activeDrivers = drivers.filter(d => d.status === 'active').length;
    const inactiveDrivers = drivers.filter(d => d.status === 'inactive').length;
    const suspendedDrivers = drivers.filter(d => d.status === 'suspended').length;
    const verifiedDrivers = drivers.filter(d => d.verification === 'verified').length;
    const pendingDrivers = drivers.filter(d => d.verification === 'pending').length;
    const totalTrips = drivers.reduce((sum, driver) => sum + driver.trips, 0);
    const totalEarnings = drivers.reduce((sum, driver) => sum + driver.earnings, 0);
    const averageRating = drivers.length > 0
      ? (drivers.reduce((sum, driver) => sum + driver.rating, 0) / drivers.length).toFixed(1)
      : '0.0';

    return [
      {
        title: 'Chauffeurs actifs',
        value: activeDrivers.toString(),
        icon: User,
        color: 'green',
        trend: activeDrivers > 3 ? 'up' : 'stable',
        percentage: drivers.length ? Math.round((activeDrivers / drivers.length) * 100) : 0,
        progress: drivers.length ? Math.round((activeDrivers / drivers.length) * 100) : 0,
        description: `${activeDrivers} sur ${drivers.length} chauffeurs`,
      },
      {
        title: 'Revenus totaux',
        value: `${totalEarnings.toLocaleString()} fg`,
        icon: Car,
        color: 'blue',
        trend: 'up',
        percentage: 12,
        progress: 65,
        description: 'Cumul des gains',
      },
      {
        title: 'Trajets effectués',
        value: totalTrips.toString(),
        icon: CarIcon,
        color: 'purple',
        trend: 'up',
        percentage: 8,
        progress: 85,
        description: 'Total des courses',
      }
    ];
  }, [drivers]);

  // Filtrage et recherche
  useEffect(() => {
    let result = [...drivers];

    // Recherche textuelle
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(driver =>
        driver.name.toLowerCase().includes(term) ||
        driver.phone.toLowerCase().includes(term) ||
        driver.email.toLowerCase().includes(term) ||
        driver.city.toLowerCase().includes(term) ||
        driver.vehicle.toLowerCase().includes(term) ||
        driver.plate.toLowerCase().includes(term)
      );
    }

    // Filtres par statut
    if (selectedFilters.status && selectedFilters.status !== 'all') {
      result = result.filter(driver => driver.status === selectedFilters.status);
    }

    // Filtres par vérification
    if (selectedFilters.verification && selectedFilters.verification !== 'all') {
      result = result.filter(driver => driver.verification === selectedFilters.verification);
    }

    // Filtres par type de véhicule
    if (selectedFilters.type && selectedFilters.type !== 'all') {
      result = result.filter(driver => driver.type === selectedFilters.type);
    }

    // Filtres par ville
    if (selectedFilters.city && selectedFilters.city !== 'all') {
      result = result.filter(driver => driver.city.toLowerCase() === selectedFilters.city);
    }

    setFilteredDrivers(result);
    setCurrentPage(1); // Reset à la première page après filtrage
  }, [searchTerm, selectedFilters, drivers]);

  // Gestion de la pagination
  const paginatedDrivers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredDrivers.slice(startIndex, endIndex);
  }, [filteredDrivers, currentPage, pageSize]);

  // Gestionnaires d'événements
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver);
    setIsDetailModalOpen(true);
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour obtenir les initiales
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').filter(Boolean).map(n => n[0]?.toUpperCase()).join('');
  };

  // Fonctions pour les badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
            Actif
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>
            Inactif
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
            Suspendu
          </span>
        );
      default:
        return null;
    }
  };

  const getVerificationBadge = (verification) => {
    switch (verification) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Vérifié
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      'Moto-taxi': 'bg-blue-100 text-blue-800',
      'Taxi partagé': 'bg-purple-100 text-purple-800',
      'Voiture privée': 'bg-indigo-100 text-indigo-800',
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'}`}>
        {type}
      </span>
    );
  };

  // Colonnes d'export (utilisées par <ExportDropdown />)
  const exportColumns = useMemo(() => ([
    { header: 'Nom', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Téléphone', accessor: 'phone' },
    { header: 'Ville', accessor: 'city' },
    { header: 'Zone', accessor: 'zone' },
    { header: 'Type', accessor: 'type' },
    { header: 'Véhicule', accessor: 'vehicle' },
    { header: 'Plaque', accessor: 'plate' },
    {
      header: 'Statut',
      accessor: 'status',
      formatter: (v) => (v === 'active' ? 'Actif' : v === 'inactive' ? 'Inactif' : v === 'suspended' ? 'Suspendu' : v ?? ''),
    },
    {
      header: 'Vérification',
      accessor: 'verification',
      formatter: (v) => (v === 'verified' ? 'Vérifié' : v === 'pending' ? 'En attente' : v === 'rejected' ? 'Rejeté' : v ?? ''),
    },
    { header: 'Trajets', accessor: 'trips', formatter: (v) => v ?? 0 },
    { header: 'Note', accessor: 'rating', formatter: (v) => v ?? '-' },
    { header: 'Gains (GNF)', accessor: 'earnings', formatter: (v) => (v ?? 0) },
    { header: 'Inscription', accessor: 'joinDate', formatter: (v) => v ?? '-' },
    { header: 'Dernière activité', accessor: 'lastActive', formatter: (v) => v ?? '-' },
  ]), []);

  // Compte des filtres actifs
  const activeFilterCount = Object.values(selectedFilters).filter(v => v && v !== 'all').length;

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Modale de confirmation d'action */}
      <ConfirmModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmAction}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        confirmVariant={confirmationModal.confirmVariant}
        type={confirmationModal.type}
      />

      {/* Modale de détails du chauffeur */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        size="lg"
        title="Détails du chauffeur"
      >
        {selectedDriver ? (
          <div className="space-y-6 scroll-m-t-2 overflow-auto h-[70vh] pr-2">
            {/* En-tête du chauffeur */}
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-700 flex items-center justify-center`}>
                <span className="text-white text-xl font-bold">
                  {getInitials(selectedDriver.name)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{selectedDriver.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{selectedDriver.email}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {getStatusBadge(selectedDriver.status)}
                  {getVerificationBadge(selectedDriver.verification)}
                  {getTypeBadge(selectedDriver.type)}
                </div>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-900 ms-8">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                <p className="font-medium">{selectedDriver.phone}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Inscription</p>
                <p className="font-medium">{formatDate(selectedDriver.joinDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dernière activité</p>
                <p className="font-medium">{selectedDriver.lastActive}</p>
              </div>
            </div>

            {/* Véhicule et note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Véhicule</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{selectedDriver.vehicle}</p>
                <p className="text-gray-600 dark:text-gray-300">{selectedDriver.plate}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Note moyenne</p>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-2 text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedDriver.rating}</span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">/5</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{selectedDriver.trips} trajets effectués</p>
              </div>
            </div>

            {/* Documents */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-900">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Documents</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`text-center p-3 rounded-lg ${selectedDriver.documents?.license ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <p className="text-sm font-medium">Permis de conduire</p>
                  <p className="text-sm mt-1">{selectedDriver.documents?.license ? '✓ Valide' : '✗ Manquant'}</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${selectedDriver.documents?.insurance ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <p className="text-sm font-medium">Assurance</p>
                  <p className="text-sm mt-1">{selectedDriver.documents?.insurance ? '✓ Valide' : '✗ Manquant'}</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${selectedDriver.documents?.registration ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <p className="text-sm font-medium">Carte grise</p>
                  <p className="text-sm mt-1">{selectedDriver.documents?.registration ? '✓ Valide' : '✗ Manquant'}</p>
                </div>
              </div>
            </div>

            {/* Revenus */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-900">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Revenus totaux</p>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-700">
                  GNF {selectedDriver.earnings?.toLocaleString() || '0'}
                </p>
                <p className="text-green-600 mt-1">Total gagné sur la plateforme</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-900 flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openStatusModal(selectedDriver, selectedDriver.status === 'active' ? 'deactivate' : 'activate');
                }}
              >
                {selectedDriver.status === 'active' ? 'Désactiver' : 'Activer'}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openStatusModal(selectedDriver, 'suspend');
                }}
              >
                Suspendre
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Aucun chauffeur sélectionné</p>
          </div>
        )}
      </Modal>

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <CardTitle>Gestion des Chauffeurs</CardTitle>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {drivers.length} chauffeurs inscrits • {filteredDrivers.length} résultats
          </p>
        </div>

      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* En-tête avec stats et actions */}
      <Card>

        <CardContent>
          <div className="space-y-4">
            {/* Barre de recherche */}
            <div className="grid justify-end grid-cols-1 md:grid-cols-1 gap-4">
              <div className="relative ">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, téléphone, email, véhicule..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:bg-gray-800 dark:border-gray-900 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition text-base"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>

            </div>
            {/* Boutons d'action des filtres */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 items-center">
              <div className='relative w-full'>
                <select
                  className="w-full dark:bg-gray-800 lg:w-[200px]  border border-gray-200 dark:border-gray-900 rounded-lg py-3 pr-10  text-sm outline-none focus:border-green-400 transition"
                  value={selectedFilters.status || 'all'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {filterOptions.status.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className='relative w-full'>
                <select
                  className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl py-3 pr-10 w-full  lg:w-[200px] text-sm outline-none focus:border-green-400 transition"
                  value={selectedFilters.type || 'all'}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  {filterOptions.type.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative w-full">
                <ExportDropdown
                  data={filteredDrivers}
                  columns={exportColumns}
                  fileName="chauffeurs_taka_taka"
                  title="Liste des chauffeurs - Taka Taka"
                  showToast={showToast}
                  className="w-full sm:w-auto"
                />
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réinitialiser tous les filtres
              </button>
            </div>


          </div>
        </CardContent>
      </Card>

      {/* Grille des chauffeurs */}
      {
        loading ? (
          <Card>
            <CardContent>
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            </CardContent>
          </Card>
        ) : filteredDrivers.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucun chauffeur trouvé</h3>
                <p className="text-gray-500 dark:text-gray-400">Essayez de modifier vos critères de recherche ou de filtres</p>
                <Button
                  variant="secondary"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {paginatedDrivers.map((driver) => (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card hoverable className="p-6">
                    <div className="flex items-center justify-between  mb-4">
                      <div className="flex items-center">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mr-4`}>
                          <span className="text-white text-xl font-bold">
                            {getInitials(driver.name)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate">{driver.name}</h4>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {getStatusBadge(driver.status)}
                            {/* {getVerificationBadge(driver.verification)} */}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 font-bold text-gray-800 dark:text-gray-100 text-lg">{driver.rating}</span>
                        </div>
                      </div>

                    </div>

                    <div className="mb-4 flex items-center gap-10">
                      <div className="">
                        {getTypeBadge(driver.type)}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{driver.trips} trajets</p>

                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Véhicule</p>
                        <p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">{driver.vehicle}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plaque</p>
                        <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{driver.plate}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
                      <div className="flex items-center truncate">
                        <Phone className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        <span className="truncate">{driver.phone}</span>
                      </div>
                      <div className="flex items-center flex-shrink-0 ml-2">
                        <MapPin className="w-4 h-4 mr-1.5" />
                        <span className="truncate">{driver.city}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Gains totaux</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        <span className='text-gray-800 dark:text-gray-100'>GNF</span> {driver.earnings.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Inscrit le {formatDate(driver.joinDate)}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="small"
                          icon={Eye}
                          onClick={() => handleViewDriver(driver)}
                          title="Voir les détails"
                          className="p-2"
                        />

                        {driver.status !== 'active' && (
                          <Button
                            variant="secondary"
                            size="small"
                            icon={CheckCircle}
                            onClick={() => openStatusModal(driver, 'activate')}
                            title="Activer"
                            className="p-2 text-green-600 hover:text-green-700"
                          />
                        )}

                        {driver.status !== 'inactive' && (
                          <Button
                            variant="secondary"
                            size="small"
                            icon={XCircle}
                            onClick={() => openStatusModal(driver, 'deactivate')}
                            title="Désactiver"
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:text-gray-200"
                          />
                        )}

                        {driver.status !== 'suspended' && (
                          <Button
                            variant="secondary"
                            size="small"
                            icon={Ban}
                            onClick={() => openStatusModal(driver, 'suspend')}
                            title="Suspendre"
                            className="p-2 text-red-600 hover:text-red-700"
                          />
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {filteredDrivers.length > pageSize && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredDrivers.length / pageSize)}
                  onPageChange={handlePageChange}
                  pageSize={pageSize}
                  totalItems={filteredDrivers.length}
                />
              </div>
            )}

            {/* Sélecteur de page size */}
            <div className="flex justify-end mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Afficher par page:</span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="border border-gray-200 dark:bg-gray-800 dark:border-gray-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400 transition"
                >
                  <option value="6">6</option>
                  <option value="12">12</option>
                  <option value="18">18</option>
                  <option value="24">24</option>
                </select>
              </div>
            </div>
          </>
        )
      }
    </div>
  );
};

export default Drivers;

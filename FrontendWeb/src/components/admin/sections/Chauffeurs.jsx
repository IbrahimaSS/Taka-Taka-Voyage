// src/components/sections/Drivers.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Ban, Check, Phone, Calendar, User, Car, UserCircle, Star, Download, MapPin, CheckCircle, XCircle, Clock, Filter, X, ChevronDown, RefreshCw, Mail } from 'lucide-react';
import StatCard from '../layout/StatCard';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Bttn';
import Modal from '../ui/Modal';
import Pagination from '../ui/Pagination';
import ConfirmModal from '../ui/ConfirmModal';
import ExportDropdown from '../ui/ExportDropdown';
import useDriverActions from '../../../hooks/useDriver';
import { adminService } from '../../../services/adminService';

const Drivers = ({ showToast }) => {
  // Hook d'actions chauffeur (Activer / Désactiver / Suspendre)
  const { confirmationModal, openStatusModal, confirmAction, closeConfirmationModal, isLoading } = useDriverActions({
    refresh: () => fetchDrivers(),
    showToast,
  });

  // États principaux
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    type: 'all'
  });

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  // États pour les modales
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Stats
  const [statsData, setStatsData] = useState(null);


  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data
  useEffect(() => {
    fetchDrivers();
    fetchStats();
  }, [currentPage, pageSize, debouncedSearchTerm, selectedFilters]);

  async function fetchDrivers() {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchTerm,
        statut: selectedFilters.status !== 'all' ? (selectedFilters.status === 'active' ? 'ACTIF' : selectedFilters.status === 'inactive' ? 'INACTIF' : selectedFilters.status.toUpperCase()) : undefined,
        typeVehicule: selectedFilters.type !== 'all' ? selectedFilters.type : undefined,
      };

      const response = await adminService.getDrivers(params);
      if (response.data.succes) {
        setDrivers(response.data.chauffeurs);
        setFilteredDrivers(response.data.chauffeurs);
        if (response.data.pagination) {
          setTotalItems(response.data.pagination.total);
        }
      }
    } catch (error) {
      console.error('Erreur chargement chauffeurs:', error);
      showToast('Erreur', 'Impossible de charger les chauffeurs', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const response = await adminService.getDriverStats();
      if (response.data.succes) {
        setStatsData(response.data.stats);
      }
    } catch (error) {
      console.error('Erreur chargement stats chauffeurs:', error);
    }
  }



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

  // Stats mappées pour l'UI
  const stats = useMemo(() => {
    if (!statsData) return [];

    return [
      {
        title: 'Chauffeurs actifs',
        value: statsData.chauffeursActifs?.toString() || '0',
        icon: User,
        color: 'green',
        trend: 'stable',
        percentage: 0,
        progress: 100,
        description: `Totalité des chauffeurs actifs`,
      },
      {
        title: 'Revenus du jour',
        value: `${(statsData.revenusDuJour || 0).toLocaleString()} fg`,
        icon: Car,
        color: 'blue',
        trend: 'up',
        percentage: 0,
        progress: 65,
        description: 'Cumul des gains aujourd\'hui',
      },
      {
        title: 'Trajets effectués',
        value: statsData.trajetsDuJour?.toString() || '0',
        icon: Car,
        color: 'purple',
        trend: 'up',
        percentage: 0,
        progress: 85,
        description: 'Total des courses aujourd\'hui',
      }
    ];
  }, [statsData]);

  // Filtrage et recherche
  // Filtrage local désactivé au profit du filtrage API
  // mais on garde les états synchronisés pour l'UI
  useEffect(() => {
    if (!drivers.length) return;
    setCurrentPage(1);
  }, [searchTerm, selectedFilters]);

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

  const handleViewDriver = async (driver) => {
    try {
      const response = await adminService.getDriverDetails(driver.id);
      if (response.data.succes) {
        setSelectedDriver(response.data.chauffeur);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Erreur détails chauffeur:', error);
      showToast('Erreur', 'Impossible de charger les détails', 'error');
    }
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
  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'ACTIF':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
            Actif
          </span>
        );
      case 'INACTIF':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>
            Inactif
          </span>
        );
      case 'SUSPENDU':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
            Suspendu
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
            {statut}
          </span>
        );
    }
  };

  const getVerificationBadge = (verifie) => {
    if (verifie) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Vérifié
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
        <Clock className="w-3 h-3 mr-1" />
        En attente
      </span>
    );
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

  const getDocBadge = (status) => {
    switch (status) {
      case 'VALIDE':
        return (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-3 transition-all hover:shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-tight">VALIDE</span>
            </div>
          </div>
        );
      case 'EXPIRE':
        return (
          <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30 rounded-lg p-3 transition-all hover:shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-tight">EXPIRÉ</span>
            </div>
          </div>
        );
      case 'VERIFIER':
        return (
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 transition-all hover:shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span className="text-[10px] font-bold tracking-tight">EN COURS</span>
            </div>
          </div>
        );
      case 'REFUSE':
        return (
          <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-lg p-3 transition-all hover:shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-tight">REFUSÉ</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-gray-50 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Ban className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-tight uppercase">Manquant</span>
            </div>
          </div>
        );
    }
  };

  // Colonnes d'export (utilisées par <ExportDropdown />)
  const exportColumns = useMemo(() => ([
    { header: 'Nom', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Téléphone', accessor: 'phone' },
    { header: 'Type', accessor: 'type' },
    { header: 'Véhicule', accessor: 'vehicle' },
    { header: 'Plaque', accessor: 'plate' },
    {
      header: 'Statut',
      accessor: 'statut',
      formatter: (v) => (v === 'ACTIF' ? 'Actif' : v === 'INACTIF' ? 'Inactif' : v === 'SUSPENDU' ? 'Suspendu' : v ?? ''),
    },
    { header: 'Trajets', accessor: 'trips', formatter: (v) => v ?? 0 },
    { header: 'Note', accessor: 'rating', formatter: (v) => v ?? '-' },
    { header: 'Gains (GNF)', accessor: 'earnings', formatter: (v) => (v ?? 0).toLocaleString() },
    { header: 'Inscription', accessor: 'joinDate', formatter: (v) => formatDate(v) },
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
        loading={isLoading}
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
              <div className={`w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-blue-700 flex items-center justify-center`}>
                {selectedDriver.photoUrl ? (
                  <img src={selectedDriver.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xl font-bold">
                    {getInitials(selectedDriver.name || `${selectedDriver.prenom} ${selectedDriver.nom}`)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {selectedDriver.name || `${selectedDriver.prenom} ${selectedDriver.nom}`}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{selectedDriver.email}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {getStatusBadge(selectedDriver.statut)}
                  {getVerificationBadge(selectedDriver.verifie || selectedDriver.statut === 'ACTIF')}
                  {getTypeBadge(selectedDriver.type || selectedDriver.typeChauffeur)}
                </div>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-900 ms-8">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                <p className="font-medium">{selectedDriver.phone || selectedDriver.telephone}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Inscription</p>
                <p className="font-medium">{formatDate(selectedDriver.joinDate || selectedDriver.inscritLe)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dernière activité</p>
                <p className="font-medium">{selectedDriver.derniereActivite ? formatDate(selectedDriver.derniereActivite) : 'Indisponible'}</p>
              </div>
            </div>

            {/* Véhicule et note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Véhicule</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                  {selectedDriver.vehicle || selectedDriver.vehicule?.marque}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedDriver.plate || selectedDriver.vehicule?.plaque}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Note moyenne</p>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-2 text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {selectedDriver.rating || selectedDriver.stats?.noteMoyenne || '0'}
                  </span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">/5</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {selectedDriver.trips || selectedDriver.stats?.nombreTrajets || '0'} trajets effectués
                </p>
              </div>
            </div>

            {/* Documents */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-900">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">Documents du chauffeur</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <div className="text-center">
                  {getDocBadge(selectedDriver.documents?.permis)}
                  <p className="text-[10px] mt-1.5 font-medium text-gray-500 uppercase tracking-wider">Permis</p>
                </div>
                <div className="text-center">
                  {getDocBadge(selectedDriver.documents?.assurance)}
                  <p className="text-[10px] mt-1.5 font-medium text-gray-500 uppercase tracking-wider">Assurance</p>
                </div>
                <div className="text-center">
                  {getDocBadge(selectedDriver.documents?.carteGrise)}
                  <p className="text-[10px] mt-1.5 font-medium text-gray-500 uppercase tracking-wider">Carte grise</p>
                </div>
                <div className="text-center">
                  {getDocBadge(selectedDriver.documents?.identite)}
                  <p className="text-[10px] mt-1.5 font-medium text-gray-500 uppercase tracking-wider">Identité</p>
                </div>
                <div className="text-center">
                  {getDocBadge(selectedDriver.documents?.photoVehicule)}
                  <p className="text-[10px] mt-1.5 font-medium text-gray-500 uppercase tracking-wider">Photo Véhicule</p>
                </div>
              </div>
            </div>

            {/* Revenus */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-900">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Revenus totaux</p>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-700">
                  GNF {(selectedDriver.earnings || selectedDriver.revenus?.totalGagne || 0).toLocaleString()}
                </p>
                <p className="text-green-600 mt-1">Total gagné sur la plateforme</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-900 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Quitter
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openStatusModal(selectedDriver, selectedDriver.statut === 'ACTIF' ? 'deactivate' : 'activate');
                }}
              >
                {selectedDriver.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
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
                        <div className={`w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mr-4`}>
                          {driver.photoUrl ? (
                            <img src={driver.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-xl font-bold">
                              {getInitials(driver.name)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate">{driver.name}</h4>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {getStatusBadge(driver.statut)}
                            {getVerificationBadge(driver.statut === 'ACTIF')}
                            {getTypeBadge(driver.type)}
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
                        <Mail className="w-4 h-4 mr-1.5" />
                        <span className="truncate text-xs">{driver.email?.split('@')[0]}...</span>
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

                        {driver.statut !== 'ACTIF' && (
                          <Button
                            variant="secondary"
                            size="small"
                            icon={CheckCircle}
                            onClick={() => openStatusModal(driver, 'activate')}
                            title="Activer"
                            className="p-2 text-green-600 hover:text-green-700"
                          />
                        )}

                        {driver.statut !== 'INACTIF' && (
                          <Button
                            variant="secondary"
                            size="small"
                            icon={XCircle}
                            onClick={() => openStatusModal(driver, 'deactivate')}
                            title="Désactiver"
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:text-gray-200"
                          />
                        )}

                        {driver.statut !== 'SUSPENDU' && (
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
            {totalItems > pageSize && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalItems / pageSize)}
                  onPageChange={handlePageChange}
                  pageSize={pageSize}
                  totalItems={totalItems}
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

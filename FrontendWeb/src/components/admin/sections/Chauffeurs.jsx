// src/components/sections/Drivers.jsx
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Car } from 'lucide-react';
import StatCard from '../layout/StatCard';
import Card, { CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Bttn';
import Pagination from '../ui/Pagination';
import ConfirmModal from '../ui/ConfirmModal';
import useDriverActions from '../../../hooks/useDriver';
import { adminService } from '../../../services/adminService';
import { useTranslation } from 'react-i18next';
import DriversFilterBar from './chauffeurs/DriversFilterBar';
import DriverCard from './chauffeurs/DriverCard';
import DriverDetailsModal from './chauffeurs/DriverDetailsModal';
import { formatDate } from './chauffeurs/driverHelpers';

const Drivers = ({ showToast }) => {
  const { t, i18n } = useTranslation();
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
      showToast(t('common.error') || 'Erreur', t('drivers.error_loading') || 'Impossible de charger les chauffeurs', 'error');
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
      { value: 'all', label: t('common.all_status') || 'Tous les statuts' },
      { value: 'active', label: t('common.active') || 'Actif' },
      { value: 'inactive', label: t('common.inactive') || 'Inactif' },
      { value: 'suspended', label: t('common.suspended') || 'Suspendu' },
    ],
    type: [
      { value: 'all', label: t('drivers.all_types') || 'Tous les types' },
      { value: 'Moto-taxi', label: t('services.moto_taxi') || 'Moto-taxi' },
      { value: 'Taxi partagé', label: t('services.taxi_partage') || 'Taxi partagé' },
      { value: 'Voiture privée', label: t('services.voiture_privee') || 'Voiture privée' },
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
        title: t('drivers.active_drivers') || 'Chauffeurs actifs',
        value: statsData.chauffeursActifs?.toString() || '0',
        icon: User,
        color: 'green',
        trend: 'stable',
        percentage: 0,
        progress: 100,
        description: t('drivers.all_active_desc') || `Totalité des chauffeurs actifs`,
      },
      {
        title: t('drivers.daily_earnings') || 'Revenus du jour',
        value: `${(statsData.revenusDuJour || 0).toLocaleString()} ${t('common.currency_symbol_short') || 'fg'}`,
        icon: Car,
        color: 'blue',
        trend: 'up',
        percentage: 0,
        progress: 65,
        description: t('drivers.daily_earnings_desc') || "Cumul des gains aujourd'hui",
      },
      {
        title: t('drivers.trips_completed') || 'Trajets effectués',
        value: statsData.trajetsDuJour?.toString() || '0',
        icon: Car,
        color: 'purple',
        trend: 'up',
        percentage: 0,
        progress: 85,
        description: t('drivers.daily_trips_desc') || "Total des courses aujourd'hui",
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
      showToast(t('common.error') || 'Erreur', t('common.error_loading_details') || 'Impossible de charger les détails', 'error');
    }
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setSearchTerm('');
  };

  // Colonnes d'export (utilisées par <ExportDropdown />)
  const exportColumns = useMemo(() => ([
    { header: t('common.name') || 'Nom', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: t('common.phone') || 'Téléphone', accessor: 'phone' },
    { header: 'Type', accessor: 'type' },
    { header: t('drivers.vehicle') || 'Véhicule', accessor: 'vehicle' },
    { header: t('drivers.plate') || 'Plaque', accessor: 'plate' },
    {
      header: t('common.status') || 'Statut',
      accessor: 'statut',
      formatter: (v) => (v === 'ACTIF' ? (t('common.active') || 'Actif') : v === 'INACTIF' ? (t('common.inactive') || 'Inactif') : v === 'SUSPENDU' ? (t('common.suspended') || 'Suspendu') : v ?? ''),
    },
    { header: t('nav.trajets') || 'Trajets', accessor: 'trips', formatter: (v) => v ?? 0 },
    { header: t('common.note') || 'Note', accessor: 'rating', formatter: (v) => v ?? '-' },
    { header: `${t('drivers.earnings') || 'Gains'} (${t('common.currency_symbol') || 'GNF'})`, accessor: 'earnings', formatter: (v) => (v ?? 0).toLocaleString() },
    { header: t('common.registration') || 'Inscription', accessor: 'joinDate', formatter: (v) => formatDate(v, i18n.language, t) },
  ]), [t, i18n.language]);

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
      <DriverDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        driver={selectedDriver}
        onActivateToggle={(driver) => {
          setIsDetailModalOpen(false);
          openStatusModal(driver, driver.statut === 'ACTIF' ? 'deactivate' : 'activate');
        }}
        onSuspend={(driver) => {
          setIsDetailModalOpen(false);
          openStatusModal(driver, 'suspend');
        }}
      />

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <CardTitle>{t('drivers.management_title') || 'Gestion des Chauffeurs'}</CardTitle>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t('drivers.found_summary', { total: drivers.length, count: filteredDrivers.length }) || `${drivers.length} chauffeurs inscrits • ${filteredDrivers.length} résultats`}
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
      <DriversFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterOptions={filterOptions}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        exportColumns={exportColumns}
        filteredDrivers={filteredDrivers}
        onClearFilters={clearFilters}
        showToast={showToast}
        t={t}
      />

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
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('drivers.no_driver_found') || 'Aucun chauffeur trouvé'}</h3>
                <p className="text-gray-500 dark:text-gray-400">{t('drivers.no_driver_match') || 'Essayez de modifier vos critères de recherche ou de filtres'}</p>
                <Button
                  variant="secondary"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  {t('common.reset_filters') || 'Réinitialiser les filtres'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {paginatedDrivers.map((driver) => (
                <DriverCard
                  key={driver.id}
                  driver={driver}
                  onView={handleViewDriver}
                  onActivate={(d) => openStatusModal(d, 'activate')}
                  onDeactivate={(d) => openStatusModal(d, 'deactivate')}
                  onSuspend={(d) => openStatusModal(d, 'suspend')}
                />
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

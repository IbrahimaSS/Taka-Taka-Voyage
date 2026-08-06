// src/components/sections/Validations.jsx
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, CheckCircle,
  Clock, UserCheck, UserX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatCard from '../layout/StatCard';
import { adminService } from '../../../services/adminService';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Bttn';
import ExportDropdown from '../ui/ExportDropdown';
import ConfirmModal from '../ui/ConfirmModal';
import AdvancedFilters from './validations/AdvancedFilters';
import PendingDriverCard from './validations/PendingDriverCard';
import ValidationHistoryTable from './validations/ValidationHistoryTable';
import DriverDetailsModal from './validations/DriverDetailsModal';


// Composant principal
const Validations = ({ showToast }) => {
  const { t, i18n } = useTranslation();
  // États pour la gestion des données
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    vehicleType: 'Tous',
    status: 'EN_ATTENTE',
    dateRange: 'Tous',
  });
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationHistory, setValidationHistory] = useState([]);
  const [statsData, setStatsData] = useState({ enAttente: 0, validesCeMois: 0, rejetesCeMois: 0 });

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: null,
    driver: null,
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Charger les données initiales
  useEffect(() => {
    fetchPendingRequests();
    fetchStats();
    fetchHistory();
  }, [filters, currentPage]);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.validations({
        statut: filters.status !== 'Tous' ? filters.status : 'EN_ATTENTE',
        page: currentPage,
        limit: 10 // On peut ajuster
      });
      if (response.data?.succes) {
        // Normalisation pour l'UI
        const formatted = response.data.chauffeurs.map(c => ({
          id: c._id,
          name: `${c.utilisateur?.prenom || ''} ${c.utilisateur?.nom || ''}`,
          type: c.typeVehicule,
          phone: c.utilisateur?.telephone || 'N/A',
          email: c.utilisateur?.email || '',
          joinDate: new Date(c.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US'),
          status: c.statut === 'EN_ATTENTE' ? 'new' : 'pending',
          documents: [], // On les chargera au cas par cas pour les détails
          progress: 0,
          photoUrl: c.utilisateur?.photoUrl || null,
        }));
        setPendingDrivers(formatted);
      }
    } catch (error) {
      console.error("Erreur fetch pending:", error);
      showToast(t('common.error'), t('validations.error_loading_requests') || "Erreur lors du chargement des demandes", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminService.getValidationStats();
      if (response.data?.succes) {
        setStatsData(response.data.stats);
      }
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async () => {
    try {
      const response = await adminService.getValidationHistory({ page: 1, limit: 10 });
      if (response.data?.succes) {
        setValidationHistory(response.data.historique);
        setTotalItems(response.data.pagination.total);
      }
    } catch (e) { console.error(e); }
  };

  // Statistiques UI
  const stats = useMemo(() => [
    {
      title: t('common.pending', 'En attente'),
      value: statsData.enAttente.toString(),
      icon: Clock,
      color: 'yellow',
      progress: Math.min(100, (statsData.enAttente / 20) * 100)
    },
    {
      title: t('validations.validated_this_month', 'Validés ce mois'),
      value: statsData.validesCeMois.toString(),
      icon: UserCheck,
      color: 'green',
      progress: 100
    },
    {
      title: t('validations.rejected_this_month', 'Rejetés ce mois'),
      value: statsData.rejetesCeMois.toString(),
      icon: UserX,
      color: 'red',
      progress: 100
    },
  ], [statsData]);

  // Filtrer localement pour la recherche (en plus du filtre API)
  const filteredDrivers = useMemo(() => {
    return pendingDrivers.filter(driver => {
      const matchesSearch = search === '' ||
        driver.name.toLowerCase().includes(search.toLowerCase()) ||
        driver.phone.includes(search) ||
        driver.type.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [pendingDrivers, search]);

  // Actions
  const handleValidate = (driver) => {
    setConfirmationModal({ isOpen: true, type: 'validate', driver });
  };

  const handleReject = (driver) => {
    setConfirmationModal({ isOpen: true, type: 'reject', driver });
  };

  const confirmAction = async (comment) => {
    const { type, driver } = confirmationModal;
    try {
      if (type === 'validate') {
        const res = await adminService.validateDriver(driver.id, { commentaire: comment });
        if (res.data?.succes) {
          showToast(t('common.success'), t('validations.driver_validated', { name: driver.name }) || `Chauffeur ${driver.name} validé !`, 'success');
        }
      } else {
        const res = await adminService.rejectDriver(driver.id, { motif: comment });
        if (res.data?.succes) {
          showToast(t('common.info'), t('validations.driver_rejected', { name: driver.name }) || `Candidature de ${driver.name} rejetée.`, 'warning');
        }
      }
      fetchPendingRequests();
      fetchStats();
      fetchHistory();
    } catch (error) {
      showToast(t('common.error'), error.response?.data?.message || t('common.error_occurred') || "Une erreur est survenue", 'error');
    }
  };

  const handleViewDetails = async (driver) => {
    setIsLoadingDetails(true);
    setViewModalOpen(true);
    try {
      const response = await adminService.getValidationDetails(driver.id);
      if (response.data?.succes) {
        setSelectedDriver(response.data.chauffeur);
      }
    } catch (error) {
      showToast(t('common.error'), t('common.error_loading_details') || "Impossible de charger les détails", 'error');
      setViewModalOpen(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const updateDocStatus = async (docId, newStatus) => {
    try {
      const response = await adminService.updateDocumentStatus(docId, newStatus);
      if (response.data?.succes) {
        showToast(t('common.success'), t('validations.doc_status_updated') || "Statut du document mis à jour", 'success');
        // Rafraîchir les détails du chauffeur pour voir la progression
        if (selectedDriver) {
          handleViewDetails(selectedDriver);
        }
      }
    } catch (error) {
      showToast(t('common.error'), t('validations.error_updating_doc') || "Erreur lors de la mise à jour du document", 'error');
    }
  };



  // Configuration des colonnes pour l'exportation (ExportDropdown)
  const exportColumns = useMemo(() => [
    {
      header: 'Date',
      accessor: (item) => {
        const d = item.date || item.createdAt || item.valideLe || item.updatedAt || item.joinDate;
        if (!d) return 'N/A';
        try {
          return new Date(d).toLocaleDateString('fr-FR');
        } catch (e) {
          return 'N/A';
        }
      }
    },
    {
      header: 'Chauffeur',
      accessor: (item) => item.chauffeur?.nom || item.name || (item.utilisateur ? `${item.utilisateur.prenom} ${item.utilisateur.nom}` : 'N/A')
    },
    { header: 'Type', accessor: (item) => item.typeVehicule || item.type || 'N/A' },
    {
      header: 'Action/Statut',
      accessor: (item) => {
        if (item.action === 'VALIDE' || item.statut === 'ACTIF') return 'Validé';
        if (item.action === 'REJETE' || item.statut === 'SUSPENDU') return 'Rejeté';
        return item.status || item.action || item.statut || 'N/A';
      }
    },
    {
      header: 'Validateur',
      accessor: (item) => {
        if (item.validateur && typeof item.validateur === 'string') return item.validateur;
        if (item.validePar) {
          if (typeof item.validePar === 'object') return `${item.validePar.prenom || ''} ${item.validePar.nom || ''}`.trim() || 'Admin';
          return 'Admin';
        }
        return (item.action || item.dateValidation || item.valideLe) ? 'Admin' : 'N/A';
      }
    },
  ], []);

  const handleValidateAll = () => {
    if (pendingDrivers.length === 0) {
      showToast(t('common.info'), t('validations.no_pending_drivers') || "Aucun chauffeur en attente", 'info');
      return;
    }
    showToast(t('common.info'), t('validations.validate_all_warn') || "La validation groupée n'est pas recommandée sans vérification individuelle des documents.", 'info');
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Effet pour mettre à jour le total des éléments
  useEffect(() => {
    setTotalItems(validationHistory.length);
  }, [validationHistory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('validations.main_title') || 'Validation des chauffeurs'}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('validations.main_subtitle') || 'Validez les documents et profils des chauffeurs'}</p>
        </div>
        <div className="flex flex-wrap gap-3 ">
          <ExportDropdown
            data={validationHistory.length > 0 ? validationHistory : pendingDrivers}
            columns={exportColumns}
            fileName={`validations_${new Date().toISOString().split('T')[0]}`}
            title={t('validations.export_title') || 'Historique des Validations Chauffeurs'}
            orientation="landscape"
            showToast={showToast}
          />
          <Button variant='perso' icon={CheckCircle} onClick={handleValidateAll}>
            {t('validations.validate_all') || 'Tout valider'}
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Filtres avancés */}
      <AdvancedFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Barre de recherche et filtres */}
      <Card hoverable={false}>
        <div className="grid grid-cols-1 md:grid-cols-1 ">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder={t('validations.search_placeholder') || "Rechercher un chauffeur..."}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Demandes en attente */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>{t('validations.pending_requests_title') || 'Demandes en attente de validation'}</CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t('validations.pending_count', { count: filteredDrivers.length }) || `${filteredDrivers.length} demande${filteredDrivers.length !== 1 ? 's' : ''} nécessitent votre attention`}
              </p>
            </div>
            <Badge className="text-yellow-500">
              <Clock className="w-3 h-3 mr-1" />
              {t('common.pending') || 'En attente'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-green-500" /></div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Aucune demande en attente</h3>
              <p className="text-gray-500 dark:text-gray-400">Toutes les demandes ont été traitées.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
              {filteredDrivers.map((driver) => (
                <PendingDriverCard key={driver.id} driver={driver} onViewDetails={handleViewDetails} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique des validations */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>{t('validations.history_title') || 'Historique des validations'}</CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t('validations.action_count', { count: totalItems }) || `${totalItems} action${totalItems !== 1 ? 's' : ''} de validation`}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ValidationHistoryTable
            history={validationHistory}
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      {/* Modale de confirmation */}
      <ConfirmModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, type: null, driver: null })}
        onConfirm={confirmAction}
        title={confirmationModal.type === 'validate' ?
          `Valider ${confirmationModal.driver?.name}` :
          `Rejeter ${confirmationModal.driver?.name}`}
        message={confirmationModal.type === 'validate' ?
          `Êtes-vous sûr de vouloir valider la candidature de ${confirmationModal.driver?.name} ?` :
          `Êtes-vous sûr de vouloir rejeter la candidature de ${confirmationModal.driver?.name} ?`}
        type={confirmationModal.type}
        confirmText={confirmationModal.type === 'validate' ? 'Valider' : 'Rejeter'}
        cancelText="Annuler"
        showComment={true}
        commentLabel="Commentaire (optionnel)"
        commentPlaceholder="Ajouter un commentaire..."
        requireComment={false}
      />

      {/* Modale de visualisation des détails */}
      <DriverDetailsModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedDriver(null);
        }}
        isLoadingDetails={isLoadingDetails}
        selectedDriver={selectedDriver}
        onUpdateDocStatus={updateDocStatus}
        onReject={handleReject}
        onValidate={handleValidate}
      />
    </div>
  );
};

export default Validations;

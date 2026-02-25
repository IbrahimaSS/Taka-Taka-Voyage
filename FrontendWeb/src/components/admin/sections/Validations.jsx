// src/components/sections/Validations.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Filter, Eye, CheckCircle, XCircle,
  Clock, UserCheck, UserX, FileCheck, Calendar, ChevronDown,
  Phone, FileText, FileSpreadsheet, File, MoreVertical,
  Check, X, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatCard from '../layout/StatCard';
import { adminService } from '../../../services/adminService';
import toast from 'react-hot-toast';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Table, { TableRow, TableCell } from '../ui/Table';
import Button from '../ui/Bttn';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import Pagination from '../ui/Pagination';
import Progress from '../ui/Progress';
import { exportToCSV, exportToPDF, exportToWord } from '../../../utils/exporters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Composant réutilisable pour les actions d'export
const ExportMenu = ({ onExport }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const exportOptions = [
    { format: 'pdf', label: t('common.export_pdf') || 'Exporter en PDF', icon: FileText, color: 'text-red-500' },
    { format: 'csv', label: t('common.export_csv') || 'Exporter en CSV', icon: FileSpreadsheet, color: 'text-green-500' },
    { format: 'excel', label: t('common.export_excel') || 'Exporter en Excel', icon: FileSpreadsheet, color: 'text-green-600' },
    { format: 'doc', label: t('common.export_word') || 'Exporter en Word', icon: File, color: 'text-blue-500' },
  ];

  return (
    <div className="relative">
      <Button
        variant="secondary"
        icon={Download}
        onClick={() => setIsOpen(!isOpen)}
      >
        {t('common.export') || 'Exporter'}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-900 z-50"
          >
            <div className="py-2">
              {exportOptions.map((option) => (
                <button
                  key={option.format}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center transition"
                  onClick={() => {
                    onExport(option.format);
                    setIsOpen(false);
                  }}
                >
                  <option.icon className={`w-4 h-4 mr-3 ${option.color}`} />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// Composant réutilisable pour les confirmations
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'validate' }) => {
  const { t } = useTranslation();
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    onConfirm(comment);
    setComment('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">{message}</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {t('validations.comment_label') || 'Commentaire (optionnel)'}
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows="3"
            placeholder={t('validations.comment_placeholder') || 'Ajouter un commentaire...'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel') || 'Annuler'}
          </Button>
          <Button
            variant={type === 'validate' ? 'primary' : 'danger'}
            onClick={handleConfirm}
          >
            {type === 'validate' ? (t('common.validate') || 'Valider') : (t('common.reject') || 'Rejeter')}
          </Button>
        </div>
      </div>
    </Modal >
  );
};

// Composant réutilisable pour les filtres avancés
const AdvancedFilters = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const filterOptions = {
    vehicleType: [t('common.all') || 'Tous', t('services.moto_taxi') || 'Moto-taxi', t('services.taxi_partage') || 'Taxi partagé', t('services.voiture_privee') || 'Voiture privée', t('services.truck') || 'Camion'],
    status: [t('common.all') || 'Tous', t('common.new') || 'Nouveau', t('common.pending') || 'En attente', t('common.in_review') || 'En révision'],
    dateRange: [t('common.all') || 'Tous', t('common.today') || "Aujourd'hui", t('common.this_week') || 'Cette semaine', t('common.this_month') || 'Ce mois', t('common.custom') || 'Personnalisé'],
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
          <span className="font-medium text-gray-700 dark:text-gray-200">{t('common.advanced_filters') || 'Filtres avancés'}</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-green-600 text-sm font-medium flex items-center"
        >
          {expanded ? (t('common.collapse') || 'Réduire') : (t('common.expand') || 'Développer')}
          <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('drivers.vehicle_type') || 'Type de véhicule'}
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-900 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
              value={filters.vehicleType}
              onChange={(e) => onFilterChange('vehicleType', e.target.value)}
            >
              {filterOptions.vehicleType.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('common.status') || 'Statut'}
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-900 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              {filterOptions.status.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('common.period') || 'Période'}
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-900 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
              value={filters.dateRange}
              onChange={(e) => onFilterChange('dateRange', e.target.value)}
            >
              {filterOptions.dateRange.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Composant pour les actions rapides dans le tableau
const TableActions = ({ driver, onView, onValidate, onReject }) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="relative">
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-lg transition"
        onClick={() => setShowActions(!showActions)}
      >
        <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-900 z-50"
          >
            <div className="py-1">
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm"
                onClick={() => {
                  onView(driver);
                  setShowActions(false);
                }}
              >
                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                {t('common.view_details') || 'Voir détails'}
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm"
                onClick={() => {
                  onValidate(driver);
                  setShowActions(false);
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                {t('common.validate') || 'Valider'}
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm"
                onClick={() => {
                  onReject(driver);
                  setShowActions(false);
                }}
              >
                <XCircle className="w-4 h-4 mr-2 text-red-500" />
                {t('common.reject') || 'Rejeter'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant principal
// TODO API (admin/validations):
// Remplacer les donnees simulees et les actions locales par des appels backend
// Exemple: GET API_ROUTES.admin.validations, POST API_ROUTES.admin.validateDriver(id)

const Validations = () => {
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
        }));
        setPendingDrivers(formatted);
      }
    } catch (error) {
      console.error("Erreur fetch pending:", error);
      toast.error(t('validations.error_loading_requests') || "Erreur lors du chargement des demandes");
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
      title: t('common.pending') || 'En attente',
      value: statsData.enAttente.toString(),
      icon: Clock,
      color: 'yellow',
      progress: Math.min(100, (statsData.enAttente / 20) * 100)
    },
    {
      title: t('validations.validated_this_month') || 'Validés ce mois',
      value: statsData.validesCeMois.toString(),
      icon: UserCheck,
      color: 'green',
      progress: 100
    },
    {
      title: t('validations.rejected_this_month') || 'Rejetés ce mois',
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
          toast.success(t('validations.driver_validated', { name: driver.name }) || `Chauffeur ${driver.name} validé !`);
        }
      } else {
        const res = await adminService.rejectDriver(driver.id, { motif: comment });
        if (res.data?.succes) {
          toast.error(t('validations.driver_rejected', { name: driver.name }) || `Candidature de ${driver.name} rejetée.`);
        }
      }
      fetchPendingRequests();
      fetchStats();
      fetchHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.error_occurred') || "Une erreur est survenue");
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
      toast.error(t('common.error_loading_details') || "Impossible de charger les détails");
      setViewModalOpen(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const updateDocStatus = async (docId, newStatus) => {
    try {
      const response = await adminService.updateDocumentStatus(docId, newStatus);
      if (response.data?.succes) {
        toast.success(t('validations.doc_status_updated') || "Statut du document mis à jour");
        // Rafraîchir les détails du chauffeur pour voir la progression
        if (selectedDriver) {
          handleViewDetails(selectedDriver);
        }
      }
    } catch (error) {
      toast.error(t('validations.error_updating_doc') || "Erreur lors de la mise à jour du document");
    }
  };

  const getFullFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const handleExport = (format) => {
    const columns = [
      { header: t('common.date') || 'Date', accessor: (item) => new Date(item.date || item.joinDate).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US') },
      { header: t('nav.chauffeur') || 'Chauffeur', accessor: (item) => item.name || item.chauffeur?.nom },
      { header: 'Type', accessor: (item) => item.type || item.typeVehicule },
      { header: t('validations.action_status') || 'Action/Statut', accessor: (item) => item.action || item.status },
      { header: t('validations.validator') || 'Validateur', accessor: (item) => item.validateur || 'N/A' },
    ];

    const payload = {
      data: validationHistory.length > 0 ? validationHistory : pendingDrivers,
      columns,
      fileName: `validations_${new Date().toISOString().split('T')[0]}`,
      title: t('validations.export_title') || 'Historique des Validations Chauffeurs',
      orientation: 'landscape',
      onToast: (title, msg, type) => toast[type](msg)
    };

    switch (format) {
      case 'csv':
      case 'excel':
        exportToCSV(payload);
        break;
      case 'pdf':
        exportToPDF(payload);
        break;
      case 'word':
      case 'doc':
        exportToWord(payload);
        break;
      default:
        toast.error(t('common.unsupported_format') || "Format non supporté");
    }
  };

  const handleValidateAll = () => {
    if (pendingDrivers.length === 0) {
      toast.error(t('validations.no_pending_drivers') || "Aucun chauffeur en attente");
      return;
    }
    toast.error(t('validations.validate_all_warn') || "La validation groupée n'est pas recommandée sans vérification individuelle des documents.");
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
          <ExportMenu onExport={handleExport} />
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
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border border-gray-200 dark:border-gray-900 rounded-xl p-5 hover:border-green-300 transition-all shadow-sm hover:shadow-lg duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center mr-4 overflow-hidden`}>
                        {driver.photoUrl ? (
                          <img src={getFullFileUrl(driver.photoUrl)} className="w-full h-full object-cover" />
                        ) : (
                          <UserCheck className="text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100">{driver.name}</h4>
                        <div className="flex items-center mt-1 flex-wrap gap-2">
                          <Badge className='bg-gray-200 dark:bg-gray-800' size="xs">
                            {driver.type}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Phone className="text-gray-400 dark:text-gray-500 mr-1 w-4 h-4" />
                            {driver.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={driver.status === 'EN_ATTENTE' ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}
                      size="sm"
                    >
                      {driver.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Inscrit le {driver.joinDate}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="small"
                        icon={Eye}
                        onClick={() => handleViewDetails(driver)}
                      >
                        Vérifier docs
                      </Button>
                    </div>
                  </div>
                </motion.div>
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
          <Table
            headers={['Date', 'Chauffeur', 'Type', 'Action', 'Validateur', 'Actions']}
          >
            {validationHistory.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition">
                <TableCell>
                  <div className="font-medium text-gray-800 dark:text-gray-100">
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center mr-3">
                      <UserCheck className="text-white text-sm" />
                    </div>
                    <div>
                      <div className="font-medium">{item.chauffeur?.nom}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.chauffeur?.telephone}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge size="sm">
                    {item.typeVehicule || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.action === 'VALIDE' ? (
                    <Badge className="text-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Validé
                    </Badge>
                  ) : (
                    <Badge className="text-red-500">
                      <XCircle className="w-3 h-3 mr-1" />
                      Rejeté
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-xs">{item.validateur}</div>
                </TableCell>

                <TableCell>
                  <Button
                    variant="secondary"
                    size="small"
                    icon={Eye}
                    onClick={() => handleViewDetails(item)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </Table>

          {/* Pagination */}
          {validationHistory.length > 0 && (
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
        </CardContent>
      </Card>

      {/* Modale de confirmation */}
      <ConfirmationModal
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
      />

      {/* Modale de visualisation des détails */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedDriver(null);
        }}
        title="Détails du chauffeur"
        size="lg"
      >
        {isLoadingDetails ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-12 h-12 text-green-500 animate-spin mb-4" />
            <p className="text-gray-500">Chargement des documents...</p>
          </div>
        ) : selectedDriver && (
          <div className="space-y-6 scroll-m-t-2 overflow-auto h-full px-2">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-slate-200/30 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-green-100">
                {selectedDriver.utilisateur?.photoUrl ? (
                  <img src={getFullFileUrl(selectedDriver.utilisateur.photoUrl)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserCheck className="text-3xl text-green-500" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {selectedDriver.utilisateur?.prenom} {selectedDriver.utilisateur?.nom}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedDriver.typeVehicule || 'Véhicule non défini'}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    {selectedDriver.utilisateur?.telephone}
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    Inscrit le {new Date(selectedDriver.inscritLe).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-200">Progression de la validation</h4>
                <span className="text-sm font-bold text-green-600">{selectedDriver.progression?.pourcentage}%</span>
              </div>
              <Progress value={selectedDriver.progression?.pourcentage} color="green" />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-200">Documents à vérifier</h4>
              <div className="grid grid-cols-1 gap-3">
                {selectedDriver.documents && selectedDriver.documents.map((doc, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-900">
                    <div className="flex items-center mb-3 sm:mb-0">
                      <div className={`p-2 rounded-lg mr-4 ${doc.statut === 'VALIDE' ? 'bg-green-100/50 text-green-600' :
                        doc.statut === 'REFUSE' ? 'bg-red-100/50 text-red-600' :
                          'bg-yellow-100/50 text-yellow-600'
                        }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 dark:text-gray-100 text-sm">{doc.nom}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant={doc.statut === 'VALIDE' ? 'success' : doc.statut === 'REFUSE' ? 'danger' : 'warning'} size="xs">
                            {doc.statut}
                          </Badge>
                          {doc.url && (
                            <a href={getFullFileUrl(doc.url)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">
                              <Eye className="w-3 h-3 mr-1" /> Voir le fichier
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      <button
                        onClick={() => updateDocStatus(doc.id, 'VALIDE')}
                        disabled={doc.statut === 'VALIDE'}
                        className={`p-2 rounded-lg transition-colors ${doc.statut === 'VALIDE' ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-green-500 border border-gray-200 dark:border-gray-700'}`}
                        title="Valider ce document"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateDocStatus(doc.id, 'REFUSE')}
                        disabled={doc.statut === 'REFUSE'}
                        className={`p-2 rounded-lg transition-colors ${doc.statut === 'REFUSE' ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 border border-gray-200 dark:border-gray-700'}`}
                        title="Refuser ce document"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t dark:border-gray-800">
              <Button
                variant="secondary"
                className="order-2 sm:order-1"
                onClick={() => setViewModalOpen(false)}
              >
                Fermer
              </Button>
              <Button
                variant="danger"
                icon={XCircle}
                className="order-3 sm:order-2"
                onClick={() => {
                  handleReject(selectedDriver);
                  setViewModalOpen(false);
                }}
              >
                Rejeter le profil
              </Button>
              <Button
                variant="primary"
                icon={CheckCircle}
                className="order-1 sm:order-3"
                disabled={!selectedDriver.actions?.peutValider}
                onClick={() => {
                  handleValidate({ id: selectedDriver.id, name: `${selectedDriver.utilisateur?.prenom} ${selectedDriver.utilisateur?.nom}` });
                  setViewModalOpen(false);
                }}
              >
                {selectedDriver.progression?.pourcentage < 100 ? 'Docs incomplets' : 'Valider le Chauffeur'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Validations;

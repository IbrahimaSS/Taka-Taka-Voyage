// src/components/sections/Validations.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Filter, Eye, CheckCircle, XCircle,
  Clock, UserCheck, UserX, FileCheck, Calendar, ChevronDown,
  Phone, FileText, FileSpreadsheet, File, MoreVertical,
  Check, X, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import StatCard from '../layout/StatCard';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Table, { TableRow, TableCell } from '../ui/Table';
import Button from '../ui/Bttn';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import Pagination from '../ui/Pagination';
import Progress from '../ui/Progress';

// Composant réutilisable pour les actions d'export
const ExportMenu = ({ onExport }) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportOptions = [
    { format: 'pdf', label: 'Exporter en PDF', icon: FileText, color: 'text-red-500' },
    { format: 'csv', label: 'Exporter en CSV', icon: FileSpreadsheet, color: 'text-green-500' },
    { format: 'excel', label: 'Exporter en Excel', icon: FileSpreadsheet, color: 'text-green-600' },
    { format: 'doc', label: 'Exporter en Word', icon: File, color: 'text-blue-500' },
  ];

  return (
    <div className="relative">
      <Button
        variant="secondary"
        icon={Download}
        onClick={() => setIsOpen(!isOpen)}
      >
        Exporter
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
            Commentaire (optionnel)
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows="3"
            placeholder="Ajouter un commentaire..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant={type === 'validate' ? 'primary' : 'danger'}
            onClick={handleConfirm}
          >
            {type === 'validate' ? 'Valider' : 'Rejeter'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Composant réutilisable pour les filtres avancés
const AdvancedFilters = ({ filters, onFilterChange }) => {
  const [expanded, setExpanded] = useState(false);

  const filterOptions = {
    vehicleType: ['Tous', 'Moto-taxi', 'Taxi partagé', 'Voiture privée', 'Camion'],
    status: ['Tous', 'Nouveau', 'En attente', 'En révision'],
    dateRange: ['Tous', 'Aujourd\'hui', 'Cette semaine', 'Ce mois', 'Personnalisé'],
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
          <span className="font-medium text-gray-700 dark:text-gray-200">Filtres avancés</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-green-600 text-sm font-medium flex items-center"
        >
          {expanded ? 'Réduire' : 'Développer'}
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
              Type de véhicule
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
              Statut
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
              Période
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
                Voir détails
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm"
                onClick={() => {
                  onValidate(driver);
                  setShowActions(false);
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Valider
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm"
                onClick={() => {
                  onReject(driver);
                  setShowActions(false);
                }}
              >
                <XCircle className="w-4 h-4 mr-2 text-red-500" />
                Rejeter
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
const Validations = ({ showToast }) => {
  // États pour la gestion des données
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    vehicleType: 'Tous',
    status: 'Tous',
    dateRange: 'Tous',
  });
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: null,
    driver: null,
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Données simulées - à remplacer par une API
  const [pendingDrivers, setPendingDrivers] = useState([
    {
      id: 1,
      name: 'Kouamé Adou',
      type: 'Moto-taxi',
      phone: '06 XX XX XX',
      email: 'kouame@example.com',
      joinDate: '15/06/2024',
      documents: [
        { name: 'Permis de conduire', status: 'valid', uploaded: '12/06/2024' },
        { name: 'Carte d\'identité', status: 'valid', uploaded: '12/06/2024' },
        { name: 'Assurance', status: 'pending', uploaded: '13/06/2024' },
        { name: 'Photo véhicule', status: 'valid', uploaded: '14/06/2024' }
      ],
      progress: 75,
      status: 'new',
      color: 'green'
    },
    {
      id: 2,
      name: 'Aïcha Diarra',
      type: 'Taxi partagé',
      phone: '07 XX XX XX',
      email: 'aicha@example.com',
      joinDate: '14/06/2024',
      documents: [
        { name: 'Permis de conduire', status: 'valid', uploaded: '10/06/2024' },
        { name: 'Carte d\'identité', status: 'expired', uploaded: '11/06/2024' },
        { name: 'Carte grise', status: 'valid', uploaded: '12/06/2024' }
      ],
      progress: 60,
      status: 'pending',
      color: 'blue'
    },
    {
      id: 3,
      name: 'Mohamed Sylla',
      type: 'Voiture privée',
      phone: '05 XX XX XX',
      email: 'mohamed@example.com',
      joinDate: '13/06/2024',
      documents: [
        { name: 'Permis de conduire', status: 'valid', uploaded: '09/06/2024' },
        { name: 'Carte d\'identité', status: 'valid', uploaded: '09/06/2024' },
        { name: 'Carte grise', status: 'valid', uploaded: '10/06/2024' },
        { name: 'Assurance', status: 'valid', uploaded: '11/06/2024' },
        { name: 'Contrôle technique', status: 'valid', uploaded: '12/06/2024' }
      ],
      progress: 100,
      status: 'review',
      color: 'purple'
    },
  ]);

  const [validationHistory, setValidationHistory] = useState([
    {
      id: 1,
      date: '28/06/2024',
      time: '10:15',
      name: 'Jean Koffi',
      type: 'Moto-taxi',
      phone: '06 XX XX XX',
      action: 'validated',
      validator: 'Admin',
      comment: 'Documents complets et conformes',
      validatedAt: '28/06/2024 10:15'
    },
    {
      id: 2,
      date: '27/06/2024',
      time: '16:30',
      name: 'Fatou Bamba',
      type: 'Taxi partagé',
      phone: '07 XX XX XX',
      action: 'rejected',
      validator: 'Admin',
      comment: 'Permis expiré',
      validatedAt: '27/06/2024 16:30'
    },
  ]);

  // Statistiques calculées dynamiquement
  const stats = useMemo(() => [
    {
      title: 'En attente',
      value: pendingDrivers.length.toString(),
      icon: Clock,
      color: 'yellow',
      trend: 'up',
      percentage: 20,
      progress: Math.min(100, (pendingDrivers.length / 20) * 100)
    },
    {
      title: 'Validés ce mois',
      value: validationHistory.filter(v => v.action === 'validated').length.toString(),
      icon: UserCheck,
      color: 'green',
      trend: 'up',
      percentage: 20,
      progress: 80
    },
    {
      title: 'Rejetés ce mois',
      value: validationHistory.filter(v => v.action === 'rejected').length.toString(),
      icon: UserX,
      color: 'red',
      trend: 'down',
      percentage: -25,
      progress: 15
    },
  ], [pendingDrivers, validationHistory]);

  // Filtrer les données en fonction de la recherche et des filtres
  const filteredDrivers = useMemo(() => {
    return pendingDrivers.filter(driver => {
      const matchesSearch = search === '' ||
        driver.name.toLowerCase().includes(search.toLowerCase()) ||
        driver.phone.includes(search) ||
        driver.type.toLowerCase().includes(search.toLowerCase());

      const matchesVehicleType = filters.vehicleType === 'Tous' ||
        driver.type === filters.vehicleType;

      const matchesStatus = filters.status === 'Tous' ||
        (filters.status === 'Nouveau' && driver.status === 'new') ||
        (filters.status === 'En attente' && driver.status === 'pending') ||
        (filters.status === 'En révision' && driver.status === 'review');

      return matchesSearch && matchesVehicleType && matchesStatus;
    });
  }, [pendingDrivers, search, filters]);

  // Calculer la pagination pour l'historique
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return validationHistory.slice(startIndex, endIndex);
  }, [validationHistory, currentPage, pageSize]);

  // Gestionnaires d'événements
  const handleValidate = (driver) => {
    setConfirmationModal({
      isOpen: true,
      type: 'validate',
      driver: driver,
    });
  };

  const handleReject = (driver) => {
    setConfirmationModal({
      isOpen: true,
      type: 'reject',
      driver: driver,
    });
  };

  const confirmAction = (comment) => {
    const { type, driver } = confirmationModal;

    if (type === 'validate') {
      // Mettre à jour l'historique
      setValidationHistory(prev => [{
        id: Date.now(),
        date: new Date().toLocaleDateString('fr-FR'),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        name: driver.name,
        type: driver.type,
        phone: driver.phone,
        action: 'validated',
        validator: 'Admin',
        comment: comment || 'Documents valides',
        validatedAt: new Date().toLocaleString('fr-FR')
      }, ...prev]);

      // Retirer de la liste d'attente
      setPendingDrivers(prev => prev.filter(d => d.id !== driver.id));

      showToast('Chauffeur validé', `Le chauffeur ${driver.name} a été validé avec succès`, 'success');
    } else {
      // Mettre à jour l'historique
      setValidationHistory(prev => [{
        id: Date.now(),
        date: new Date().toLocaleDateString('fr-FR'),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        name: driver.name,
        type: driver.type,
        phone: driver.phone,
        action: 'rejected',
        validator: 'Admin',
        comment: comment || 'Documents non conformes',
        validatedAt: new Date().toLocaleString('fr-FR')
      }, ...prev]);

      // Retirer de la liste d'attente
      setPendingDrivers(prev => prev.filter(d => d.id !== driver.id));

      showToast('Chauffeur rejeté', `La candidature de ${driver.name} a été rejetée`, 'error');
    }
  };

  const handleViewDetails = (driver) => {
    setSelectedDriver(driver);
    setViewModalOpen(true);
  };

  const handleExport = (format) => {
    showToast('Export réussi', `Les données ont été exportées en ${format.toUpperCase()}`, 'success');
    // Ici, vous ajouteriez la logique d'export réelle
  };

  const handleValidateAll = () => {
    showToast('Validation en masse', `${pendingDrivers.length} chauffeurs seront validés`, 'info');
    // Implémentation de la validation en masse
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Validation des chauffeurs</h1>
          <p className="text-gray-500 dark:text-gray-400">Validez les documents et profils des chauffeurs</p>
        </div>
        <div className="flex flex-wrap gap-3 ">
          <ExportMenu onExport={handleExport} />
          <Button variant='perso' icon={CheckCircle} onClick={handleValidateAll}>
            Tout valider
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
              placeholder="Rechercher un chauffeur..."
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
              <CardTitle>Demandes en attente de validation</CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {filteredDrivers.length} demande{filteredDrivers.length !== 1 ? 's' : ''} nécessitent votre attention
              </p>
            </div>
            <Badge className="text-yellow-500">
              <Clock className="w-3 h-3 mr-1" />
              En attente
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {filteredDrivers.length === 0 ? (
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
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center mr-4`}>
                        <UserCheck className="text-white" />
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
                      className={driver.status === 'new' ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}
                      size="sm"
                    >
                      {driver.status === 'new' ? 'Nouveau' :
                        driver.status === 'pending' ? 'En attente' : 'En révision'}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Documents soumis:</p>
                    <div className="flex flex-wrap gap-2">
                      {driver.documents.map((doc, idx) => (
                        <Badge
                          key={idx}
                          className={doc.status === 'valid' ? 'text-green-600' : 'text-red-600'}
                          size="xs"
                        >
                          <div className="flex items-center">
                            {doc.status === 'valid' ?
                              <Check className="w-3 h-3 mr-1" /> :
                              <Clock className="w-3 h-3 mr-1" />
                            }
                            {doc.name}
                          </div>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Inscrit le {driver.joinDate}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        size="small"
                        icon={CheckCircle}
                        onClick={() => handleValidate(driver)}
                      />
                      <Button
                        variant="danger"
                        size="small"
                        icon={XCircle}
                        onClick={() => handleReject(driver)}
                      />
                      <Button
                        variant="secondary"
                        size="small"
                        icon={Eye}
                        onClick={() => handleViewDetails(driver)}
                      />
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
              <CardTitle>Historique des validations</CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {validationHistory.length} action{validationHistory.length !== 1 ? 's' : ''} de validation
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ExportMenu onExport={handleExport} />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table
            headers={['Date', 'Chauffeur', 'Type', 'Action', 'Validateur', 'Actions']}
          >
            {paginatedHistory.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition">
                <TableCell>
                  <div className="font-medium text-gray-800 dark:text-gray-100">{item.date}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{item.time}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center mr-3">
                      <UserCheck className="text-white text-sm" />
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.phone}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge size="sm">
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.action === 'validated' ? (
                    <Badge className="text-yellow-500">
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
                  <div className="font-medium">{item.validator}</div>
                </TableCell>

                <TableCell>
                  <TableActions
                    driver={item}
                    onView={handleViewDetails}
                    onValidate={() => handleValidate(item)}
                    onReject={() => handleReject(item)}
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
                totalPages={Math.ceil(validationHistory.length / pageSize)}
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
        {selectedDriver && (
          <div className="space-y-6 scroll-m-t-2 overflow-auto h-full">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-slate-200/30 dark:bg-gray-800 flex items-center justify-center">
                <UserCheck className="text-3xl text-green-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedDriver.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedDriver.type}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    {selectedDriver.phone}
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    Inscrit le {selectedDriver.joinDate}
                  </div>
                </div>
              </div>
            </div>

            {/* <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3">Progression des documents</h4>
              <Progress value={selectedDriver.progress} color="green" />
            </div> */}

            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3">Documents</h4>
              <div className="space-y-3">
                {selectedDriver.documents && selectedDriver.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                    <div className="flex items-center">
                      {doc.status === 'valid' ?
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" /> :
                        <Clock className="w-5 h-5 text-yellow-500 mr-3" />
                      }
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Téléversé le: {doc.uploaded}</div>
                      </div>
                    </div>
                    <Badge variant={doc.status === 'valid' ? 'success' : 'warning'}>
                      {doc.status === 'valid' ? 'Validé' : 'En attente'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                variant="primary"
                icon={CheckCircle}
                onClick={() => {
                  handleValidate(selectedDriver);
                  setViewModalOpen(false);
                }}
              >
                Valider
              </Button>
              <Button
                variant="danger"
                icon={XCircle}
                onClick={() => {
                  handleReject(selectedDriver);
                  setViewModalOpen(false);
                }}
              >
                Rejeter
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Validations;

// src/components/sections/Documents.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Upload, Eye, Download, Trash2, Bell, FileCheck,
  FileX, FileText, IdCard, Car, Shield, Plus, Calendar, AlertTriangle,
  CheckCircle, Clock, XCircle, User, FileUp, FileWarning, BarChart3,
  TrendingUp, TrendingDown, RefreshCw, MoreVertical, ChevronRight,
  CheckSquare, Square, FileDown, Image as ImageIcon, File, ExternalLink,
  Printer, FileSpreadsheet, FileText as FileWord, Users, Archive, Check
} from 'lucide-react';
import StatCard from '../layout/StatCard';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Bttn';
import Modal from '../ui/Modal';
import Pagination from '../ui/Pagination';
import Progress from '../ui/Progress';
import DocumentViewer from '../ui/DocumentViewer';
import ExportDropdown from '../ui/ExportDropdown';
import { exportToCSV, exportToPDF, exportToWord } from '../../../utils/exporters';
import { adminService } from '../../../services/adminService';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// TODO API (admin/documents):
// Remplacer les donnees simulees et les validations locales par des appels backend
// Exemple: GET /admin/documents, POST /admin/validations/:id
const Documents = ({ showToast }) => {
  const { t } = useTranslation();
  // États principaux
  const [documents, setDocuments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [uploading, setUploading] = useState(false);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Types de documents
  const documentTypes = [
    { id: 'PERMIS', label: 'Permis de conduire', icon: IdCard, color: 'blue', required: true },
    { id: 'IDENTITE', label: "Carte d'identité", icon: User, color: 'purple', required: true },
    { id: 'CARTE_GRISE', label: 'Carte grise', icon: Car, color: 'green', required: true },
    { id: 'ASSURANCE', label: 'Assurance', icon: Shield, color: 'orange', required: true },
    { id: 'PHOTO_VEHICULE', label: 'Photo véhicule', icon: Car, color: 'red', required: true }
  ];

  // Statuts de documents
  const statusTypes = [
    { id: 'VALIDE', label: 'Valide', icon: CheckCircle, color: 'success', bgColor: 'bg-green-50', textColor: 'text-green-700' },
    { id: 'REFUSE', label: 'Rejeté', icon: FileX, color: 'error', bgColor: 'bg-red-50', textColor: 'text-red-700' },
    { id: 'VERIFIER', label: 'En attente', icon: Clock, color: 'warning', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
    { id: 'EXPIRE', label: 'Expiré', icon: XCircle, color: 'error', bgColor: 'bg-red-100', textColor: 'text-red-800' }
  ];

  // Données réelles chargées depuis le backend
  const [statsData, setStatsData] = useState({ documentsTotaux: 0, aVerifier: 0, expirentBientot: 0 });

  // Initialisation des données
  useEffect(() => {
    loadDocuments();
  }, [currentPage, pageSize]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      // 1. Charger les statistiques globales
      const statsRes = await adminService.getDocumentStats();
      if (statsRes.data?.succes) {
        setStatsData(statsRes.data.stats);
      }

      // 2. Charger les chauffeurs et leurs documents
      const response = await adminService.getChauffeursDocuments({
        page: currentPage,
        limit: pageSize
      });

      if (response.data?.succes) {
        const driversData = response.data.donnees.map(d => ({
          ...d,
          name: d.nom, // Alias pour la compatibilité UI
          role: 'chauffeur'
        }));
        setDrivers(driversData);
        setFilteredDrivers(driversData);

        // On aplatit également les documents pour les fonctions d'export si besoin
        const allDocs = driversData.flatMap(driver =>
          (driver.documents || []).map(doc => ({
            ...doc,
            chauffeur: { nom: driver.name || driver.nom || 'Inconnu' }
          }))
        );
        setDocuments(allDocs);
      }
    } catch (error) {
      console.error("Erreur chargement documents:", error);
      toast.error("Erreur lors de la récupération des documents");
    } finally {
      setLoading(false);
    }
  };

  // Configuration pour ExportDropdown
  const exportConfig = useMemo(() => ({
    columns: [
      { header: 'Type', accessor: (doc) => documentTypes.find(t => t.id === doc.type)?.label || doc.type || 'N/A' },
      { header: 'Propriétaire', accessor: (doc) => doc.chauffeur?.nom || doc.owner?.name || (doc.utilisateur ? `${doc.utilisateur.prenom} ${doc.utilisateur.nom}` : 'N/A') },
      { header: 'Statut', accessor: (doc) => statusTypes.find(s => s.id === doc.statut)?.label || doc.statut || 'N/A' },
      { header: 'Fichier', accessor: (doc) => doc.fichier || doc.fileName || doc.fileUrl || 'N/A' },
      {
        header: 'Date upload',
        accessor: (doc) => {
          const dateVal = doc.createdAt || doc.dateUpload || doc.date || doc.dateCreation;
          if (!dateVal) return 'N/A';
          try {
            return new Date(dateVal).toLocaleDateString('fr-FR');
          } catch (e) {
            return 'N/A';
          }
        }
      },
    ],
    fileName: `documents_${new Date().toISOString().split('T')[0]}`,
    title: 'Liste des documents Chauffeurs',
    orientation: 'landscape'
  }), [documentTypes, statusTypes]);

  // Stats calculées
  const stats = useMemo(() => [
    {
      title: t('nav.chauffeurs', 'Chauffeurs'),
      value: drivers.length.toString(),
      icon: Users,
      color: 'blue',
      trend: 'stable',
      description: t('documents.profiles_to_follow', 'Profils à suivre'),
    },
    {
      title: t('documents.documents_to_verify', 'Documents à vérifier'),
      value: statsData.aVerifier.toString(),
      icon: FileText,
      color: 'green',
      trend: 'stable',
      description: t('documents.actions_required', "Actions requises par l'admin"),
    },
    {
      title: t('documents.expiring_soon', 'Expirent bientôt'),
      value: statsData.expirentBientot.toString(),
      icon: Clock,
      color: 'orange',
      trend: statsData.expirentBientot > 0 ? 'up' : 'stable',
      description: t('documents.documents_to_renew', 'Documents à renouveler'),
    }
  ], [drivers, statsData, t]);

  // Filtrage et recherche
  useEffect(() => {
    let result = [...drivers];

    // Recherche textuelle
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(driver =>
        driver.name.toLowerCase().includes(term) ||
        driver.documents.some(doc =>
          doc.type.toLowerCase().includes(term) ||
          doc.number?.toLowerCase().includes(term) ||
          doc.fileName.toLowerCase().includes(term)
        )
      );
    }

    // Filtres par statut
    if (selectedFilters.status && selectedFilters.status !== 'all') {
      result = result.filter(driver =>
        driver.documents.some(doc => doc.status === selectedFilters.status)
      );
    }

    // Filtre par complétude
    if (selectedFilters.completeness && selectedFilters.completeness !== 'all') {
      result = result.filter(driver => {
        if (selectedFilters.completeness === 'complete') return driver.completeness === 100;
        if (selectedFilters.completeness === 'incomplete') return driver.completeness < 100;
        return true;
      });
    }

    setFilteredDrivers(result);
    setCurrentPage(1);
  }, [searchTerm, selectedFilters, drivers]);

  // Pagination
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

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver);
    setSelectedDocuments([]);
  };

  const handleSelectDocument = (documentId) => {
    setSelectedDocuments(prev =>
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAllDocuments = () => {
    if (selectedDriver) {
      const allIds = selectedDriver.documents.map(d => d.id);
      if (selectedDocuments.length === allIds.length) {
        setSelectedDocuments([]);
      } else {
        setSelectedDocuments(allIds);
      }
    }
  };

  // Actions batch
  const handleBatchValidate = async () => {
    try {
      await Promise.all(selectedDocuments.map(id =>
        adminService.updateDocumentStatus(id, 'VALIDE')
      ));
      showToast(t('common.success'), `${selectedDocuments.length} document(s) validé(s)`, 'success');
      setSelectedDocuments([]);
      loadDocuments();
    } catch (error) {
      showToast(t('common.error'), "Erreur lors de la validation groupée", 'error');
    }
  };

  const handleBatchReject = async () => {
    try {
      await Promise.all(selectedDocuments.map(id =>
        adminService.updateDocumentStatus(id, 'REFUSE')
      ));
      showToast(t('common.success'), `${selectedDocuments.length} document(s) rejeté(s)`, 'success');
      setSelectedDocuments([]);
      loadDocuments();
    } catch (error) {
      showToast(t('common.error'), "Erreur lors du rejet groupé", 'error');
    }
  };

  // Valider un document individuel
  const handleValidateDocument = async (documentId) => {
    try {
      const response = await adminService.updateDocumentStatus(documentId, 'VALIDE');
      if (response.data?.succes) {
        showToast(t('common.success'), "Document validé", 'success');
        loadDocuments();
        // Si une modale est ouverte, on pourrait avoir besoin de mettre à jour selectedDriver
        if (selectedDriver) {
          const updatedDocs = selectedDriver.documents.map(d =>
            d.id === documentId ? { ...d, statut: 'VALIDE' } : d
          );
          setSelectedDriver({ ...selectedDriver, documents: updatedDocs });
        }
      }
    } catch (error) {
      showToast(t('common.error'), "Erreur lors de la validation", 'error');
    }
  };

  // Rejeter un document individuel
  const handleRejectDocument = async (documentId) => {
    try {
      const response = await adminService.updateDocumentStatus(documentId, 'REFUSE');
      if (response.data?.succes) {
        showToast(t('common.success'), "Document rejeté", 'success');
        loadDocuments();
        if (selectedDriver) {
          const updatedDocs = selectedDriver.documents.map(d =>
            d.id === documentId ? { ...d, statut: 'REFUSE' } : d
          );
          setSelectedDriver({ ...selectedDriver, documents: updatedDocs });
        }
      }
    } catch (error) {
      showToast(t('common.error'), "Erreur lors du rejet", 'error');
    }
  };

  // Utilitaires
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status) => {
    const statusType = statusTypes.find(s => s.id === status);
    if (!statusType) return null;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusType.bgColor} ${statusType.textColor}`}>
        <statusType.icon className="w-3 h-3 mr-1" />
        {statusType.label}
      </span>
    );
  };

  const getDocumentIcon = (type) => {
    const docType = documentTypes.find(t => t.id === type);
    return docType ? docType.icon : FileText;
  };

  const getTypeColor = (typeId) => {
    const type = documentTypes.find(t => t.id === typeId);
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      orange: 'bg-orange-100 text-orange-600',
      purple: 'bg-purple-100 text-purple-600',
      teal: 'bg-teal-100 text-teal-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      pink: 'bg-pink-100 text-pink-600',
    };
    return colorMap[type?.color] || 'bg-gray-100 dark:bg-gray-950 text-gray-600 dark:text-gray-300';
  };

  // Options de filtre
  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    ...statusTypes.map(status => ({ value: status.id, label: status.label })),
  ];

  const completenessOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'complete', label: 'Profil complet' },
    { value: 'incomplete', label: 'Profil incomplet' },
  ];

  // Fonction d'export unifiée
  const handleExport = (format, data = documents) => {
    const payload = {
      data,
      columns: exportConfig.columns,
      fileName: exportConfig.fileName,
      title: exportConfig.title,
      orientation: exportConfig.orientation,
      onToast: showToast
    };

    switch (format) {
      case 'csv': exportToCSV(payload); break;
      case 'word': exportToWord(payload); break;
      case 'pdf': exportToPDF(payload); break;
      default: break;
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      const url = `${API_URL}${document.fichier || document.fileUrl}`;
      window.open(url, '_blank');
    } catch (error) {
      showToast(t('common.error'), "Erreur lors du téléchargement", 'error');
    }
  };

  const getFullFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <div className="space-y-6">
      {/* Barre de recherche et filtres */}
      {selectedDriver && (
        <Modal
          isOpen={!!selectedDriver}
          onClose={() => {
            setSelectedDriver(null);
            setSelectedDocuments([]);
          }}
          title={`Documents de ${selectedDriver.name}`}
          size="xl"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 overflow-hidden shadow-md">
                    {selectedDriver.photoUrl ? (
                      <img src={getFullFileUrl(selectedDriver.photoUrl)} className="w-full h-full object-cover" />
                    ) : selectedDriver.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{selectedDriver.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{selectedDriver.phone || ''} {selectedDriver.phone && selectedDriver.email ? '•' : ''} {selectedDriver.email || ''}</p>
                    <div className="flex items-center mt-2">
                      <div className="w-48 bg-gray-200 dark:bg-gray-800 rounded-full h-2 mr-3">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${selectedDriver.completeness}%` }}
                        />
                      </div>
                      <span className="font-semibold">{selectedDriver.completeness}% complet</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Documents</p>
                  <p className="text-2xl font-bold">{selectedDriver.totalDocuments}</p>
                </div>
              </div>
            </div>

            {/* Actions batch */}
            {selectedDocuments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium">
                      {selectedDocuments.length} document(s) sélectionné(s)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      size="small"
                      icon={CheckCircle}
                      onClick={handleBatchValidate}
                    >
                      Valider
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      icon={XCircle}
                      onClick={handleBatchReject}
                    >
                      Rejeter
                    </Button>
                    <Button
                      variant="ghost"
                      size="small"
                      icon={Trash2}
                      onClick={() => setSelectedDocuments([])}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Liste des documents */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Tous les documents ({selectedDriver.documents.length})</h4>
                <button
                  onClick={handleSelectAllDocuments}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  {selectedDocuments.length === selectedDriver.documents.length ? (
                    <CheckSquare className="w-4 h-4 mr-1" />
                  ) : (
                    <Square className="w-4 h-4 mr-1" />
                  )}
                  {selectedDocuments.length === selectedDriver.documents.length
                    ? 'Tout désélectionner'
                    : 'Tout sélectionner'}
                </button>
              </div>

              {selectedDriver.documents.map((doc, index) => {
                const DocIcon = getDocumentIcon(doc.type);
                const docType = documentTypes.find(t => t.id === doc.type);
                const isSelected = selectedDocuments.includes(doc.id);

                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border rounded-lg p-4 transition-all duration-200 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:border-gray-700'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleSelectDocument(doc.id)}
                          className={`w-5 h-5 border rounded flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-700'
                            }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <div className={`w-10 h-10 rounded-lg ${getTypeColor(doc.type)} flex items-center justify-center`}>
                          <DocIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{docType?.label || doc.type}</p>
                          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>Mis en ligne le {new Date(doc.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getStatusBadge(doc.statut)}

                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="small"
                            icon={Eye}
                            onClick={() => setViewingDocument({
                              id: doc.id,
                              type: doc.type,
                              fileName: docType?.label || doc.type,
                              fileUrl: getFullFileUrl(doc.fichier),
                              owner: { name: selectedDriver.name },
                              createdAt: doc.createdAt
                            })}
                            title="Visualiser"
                          />
                          <a
                            href={getFullFileUrl(doc.fichier)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4 text-gray-500" />
                          </a>

                          {doc.statut === 'VERIFIER' && (
                            <>
                              <Button
                                variant="ghost"
                                size="small"
                                icon={CheckCircle}
                                onClick={() => handleValidateDocument(doc.id)}
                                title="Valider"
                                className="text-green-600 hover:text-green-700"
                              />
                              <Button
                                variant="ghost"
                                size="small"
                                icon={XCircle}
                                onClick={() => handleRejectDocument(doc.id)}
                                title="Rejeter"
                                className="text-red-600 hover:text-red-700"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* ExportDropdown dans le modal */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Exporter les données</h4>
                <ExportDropdown
                  data={(selectedDriver.documents || []).map(doc => ({
                    ...doc,
                    chauffeur: { nom: selectedDriver.name || selectedDriver.nom || 'Inconnu' }
                  }))}
                  columns={exportConfig.columns}
                  fileName={`documents_${(selectedDriver.name || 'chauffeur').toLowerCase().replace(/\s+/g, '_')}`}
                  title={`Documents de ${selectedDriver.name}`}
                  orientation="landscape"
                  showToast={showToast}
                  onPrint={() => window.print()}
                  className="w-auto"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Exportez les documents de {selectedDriver.name} en CSV, Word ou PDF
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Header avec ExportDropdown */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{t('nav.documents', 'Documents des Chauffeurs')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('drivers.documents_desc', 'Gérez et suivez tous les documents de vos chauffeurs')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ExportDropdown
            data={documents}
            columns={exportConfig.columns}
            fileName={exportConfig.fileName}
            title={exportConfig.title}
            orientation={exportConfig.orientation}
            showToast={showToast}
            onPrint={() => {
              if (showToast) {
                showToast('Impression', 'Préparation de l\'impression...', 'info');
              }
              setTimeout(() => window.print(), 500);
            }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Barre de recherche et filtres */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>{t('drivers.search_driver', 'Recherche de chauffeurs')}</CardTitle>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {filteredDrivers.length} {t('drivers.driver_found', 'chauffeur(s) trouvé(s)')}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? t('common.hide_filters', 'Masquer filtres') : t('common.filters', 'Filtres')}
              </Button>

              {(searchTerm || Object.values(selectedFilters).some(v => v && v !== 'all')) && (
                <Button
                  variant="ghost"
                  icon={Trash2}
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedFilters({});
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder={t('documents.search_placeholder', 'Rechercher un chauffeur ou un document...')}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Statut des documents
                      </label>
                      <select
                        className="w-full border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 transition"
                        value={selectedFilters.status || 'all'}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Complétude du profil
                      </label>
                      <select
                        className="w-full border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 transition"
                        value={selectedFilters.completeness || 'all'}
                        onChange={(e) => handleFilterChange('completeness', e.target.value)}
                      >
                        {completenessOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Type de document
                      </label>
                      <select
                        className="w-full border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 transition"
                        value={selectedFilters.type || 'all'}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                      >
                        <option value="all">Tous les types</option>
                        {documentTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Grille des chauffeurs */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <FileWarning className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucun chauffeur trouvé</h3>
              <p className="text-gray-500 dark:text-gray-400">Essayez de modifier vos critères de recherche</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {paginatedDrivers.map((driver, index) => (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    hoverable
                    className="h-full  transition-all duration-300 hover:shadow-lg cursor-pointer"
                    onClick={() => handleViewDriver(driver)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 overflow-hidden shadow-sm">
                            {driver.photoUrl ? (
                              <img src={getFullFileUrl(driver.photoUrl)} className="w-full h-full object-cover" />
                            ) : (
                              driver.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{driver.name}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{t('users.driver', 'Chauffeur')}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>

                      <div className="space-y-4">

                        {/* Statistiques rapides */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-900/90 font-bold ">{driver.validCount}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-800/90 font-bold">{t('common.valid', 'Valides')}</p>
                          </div>
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-900/90 font-bold">{driver.pendingCount}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-800/50 font-bold">{t('trips.status.pending', 'En attente')}</p>
                          </div>
                        </div>

                        {/* Documents requis manquants */}
                        {driver.completeness < 100 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                              {t('documents.missing_required_docs', 'Documents requis manquants:')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {driver.manquants.map((label, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100/80 text-red-700 border border-red-200"
                                >
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {filteredDrivers.length > pageSize && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredDrivers.length / pageSize)}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                totalItems={filteredDrivers.length}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </>
      )}

      {/* Modal de visualisation document */}
      <DocumentViewer
        document={viewingDocument}
        isOpen={!!viewingDocument}
        onClose={() => setViewingDocument(null)}
      />
    </div>
  );
};

export default Documents;

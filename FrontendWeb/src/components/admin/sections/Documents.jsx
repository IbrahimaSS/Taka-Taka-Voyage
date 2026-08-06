// src/components/sections/Documents.jsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, FileWarning, Users, FileText } from 'lucide-react';
import StatCard from '../layout/StatCard';
import Card, { CardContent } from '../ui/Card';
import Pagination from '../ui/Pagination';
import DocumentViewer from '../ui/DocumentViewer';
import ExportDropdown from '../ui/ExportDropdown';
import { adminService } from '../../../services/adminService';
import { useTranslation } from 'react-i18next';
import { documentTypes, statusTypes } from './documents/documentConstants';
import DocumentsFilterBar from './documents/DocumentsFilterBar';
import DriverDocumentsCard from './documents/DriverDocumentsCard';
import DriverDocumentsModal from './documents/DriverDocumentsModal';

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
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [viewingDocument, setViewingDocument] = useState(null);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

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

  return (
    <div className="space-y-6">
      <DriverDocumentsModal
        driver={selectedDriver}
        onClose={() => {
          setSelectedDriver(null);
          setSelectedDocuments([]);
        }}
        selectedDocuments={selectedDocuments}
        onSelectDocument={handleSelectDocument}
        onSelectAllDocuments={handleSelectAllDocuments}
        onBatchValidate={handleBatchValidate}
        onBatchReject={handleBatchReject}
        onCancelSelection={() => setSelectedDocuments([])}
        onViewDocument={setViewingDocument}
        onValidateDocument={handleValidateDocument}
        onRejectDocument={handleRejectDocument}
        exportColumns={exportConfig.columns}
        showToast={showToast}
      />

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
      <DocumentsFilterBar
        filteredCount={filteredDrivers.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={() => {
          setSearchTerm('');
          setSelectedFilters({});
        }}
      />

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
                <DriverDocumentsCard key={driver.id} driver={driver} index={index} onSelect={handleViewDriver} />
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

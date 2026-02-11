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

// TODO API (admin/documents):
// Remplacer les donnees simulees et les validations locales par des appels backend
// Exemple: GET /admin/documents, POST /admin/validations/:id
const Documents = ({ showToast }) => {
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
    { id: 'license', label: 'Permis de conduire', icon: IdCard, color: 'blue', required: true },
    { id: 'id_card', label: "Carte d'identité", icon: User, color: 'purple', required: true },
    { id: 'registration', label: 'Carte grise', icon: Car, color: 'green', required: true },
    { id: 'insurance', label: 'Assurance', icon: Shield, color: 'orange', required: true },
    { id: 'inspection', label: 'Contrôle technique', icon: FileCheck, color: 'red', required: true },
    { id: 'medical', label: 'Certificat médical', icon: FileText, color: 'teal', required: false },
    { id: 'bank', label: 'RIB', icon: FileText, color: 'indigo', required: false },
    { id: 'photo', label: "Photo d'identité", icon: User, color: 'pink', required: true }
  ];

  // Statuts de documents
  const statusTypes = [
    { id: 'valid', label: 'Valide', icon: CheckCircle, color: 'success', bgColor: 'bg-green-50', textColor: 'text-green-700' },
    { id: 'rejected', label: 'Rejeté', icon: FileX, color: 'error', bgColor: 'bg-red-50', textColor: 'text-red-700' },
    { id: 'pending', label: 'En attente', icon: Clock, color: 'warning', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
    { id: 'expired', label: 'Expiré', icon: XCircle, color: 'error', bgColor: 'bg-red-100', textColor: 'text-red-800' },
    { id: 'expiring', label: 'Expire bientôt', icon: AlertTriangle, color: 'warning', bgColor: 'bg-orange-50', textColor: 'text-orange-700' }
  ];

  // Données simulées (20 documents maximum)
  const initialDocuments = [
    {
      id: 1,
      type: 'license',
      owner: { id: 1, name: 'Kouamé Adou', role: 'chauffeur', phone: '+225 01 23 45 67 89', email: 'kouame@example.com' },
      number: '123456789',
      expiryDate: '2026-08-15',
      issueDate: '2021-08-15',
      uploadDate: '2024-03-15',
      uploadBy: 'Admin System',
      validity: 85,
      status: 'valid',
      size: '2.4 MB',
      format: 'PDF',
      notes: 'Permis international valide',
      fileName: 'permis_kouame_adou.pdf',
      fileUrl: '/documents/permis.pdf',
      reviewedBy: 'Jean Dupont',
      reviewDate: '2024-03-16'
    },
    {
      id: 2,
      type: 'registration',
      owner: { id: 1, name: 'Kouamé Adou', role: 'chauffeur' },
      number: 'AB-123-CD',
      expiryDate: '2025-06-30',
      issueDate: '2022-06-30',
      uploadDate: '2024-02-10',
      uploadBy: 'Kouamé Adou',
      validity: 60,
      status: 'expiring',
      size: '1.8 MB',
      format: 'PDF',
      notes: 'Carte grise à jour',
      fileName: 'carte_grise_kouame.pdf',
      fileUrl: '/documents/carte_grise.pdf',
      reviewedBy: null,
      reviewDate: null
    },
    {
      id: 3,
      type: 'id_card',
      owner: { id: 1, name: 'Kouamé Adou', role: 'chauffeur' },
      number: '987654321',
      expiryDate: '2030-05-20',
      issueDate: '2020-05-20',
      uploadDate: '2024-01-15',
      uploadBy: 'Admin System',
      validity: 90,
      status: 'valid',
      size: '1.2 MB',
      format: 'JPG',
      notes: "Carte d'identité nationale",
      fileName: 'cni_kouame.jpg',
      fileUrl: '/documents/cni.jpg',
      reviewedBy: 'Jean Dupont',
      reviewDate: '2024-01-16'
    },
    {
      id: 4,
      type: 'insurance',
      owner: { id: 2, name: 'Aïcha Diarra', role: 'chauffeur', phone: '+225 07 89 12 34 56', email: 'aicha@example.com' },
      number: 'ASS-456-789',
      expiryDate: '2024-12-31',
      issueDate: '2023-12-31',
      uploadDate: '2024-03-20',
      uploadBy: 'Aïcha Diarra',
      validity: 80,
      status: 'valid',
      size: '3.1 MB',
      format: 'PDF',
      notes: 'Assurance tous risques',
      fileName: 'assurance_aicha.pdf',
      fileUrl: '/documents/assurance.pdf',
      reviewedBy: 'Admin System',
      reviewDate: '2024-03-21'
    },
    {
      id: 5,
      type: 'inspection',
      owner: { id: 2, name: 'Aïcha Diarra', role: 'chauffeur' },
      number: 'CT-2024-045',
      expiryDate: '2025-02-28',
      issueDate: '2024-02-28',
      uploadDate: '2024-04-05',
      uploadBy: 'Aïcha Diarra',
      validity: 95,
      status: 'pending',
      size: '2.5 MB',
      format: 'PDF',
      notes: 'Contrôle technique à vérifier',
      fileName: 'controle_technique_aicha.pdf',
      fileUrl: '/documents/controle.pdf',
      reviewedBy: null,
      reviewDate: null
    },
    {
      id: 6,
      type: 'license',
      owner: { id: 3, name: 'Mohamed Sylla', role: 'chauffeur', phone: '+225 05 67 89 01 23', email: 'mohamed@example.com' },
      number: '555777888',
      expiryDate: '2027-11-30',
      issueDate: '2022-11-30',
      uploadDate: '2024-03-25',
      uploadBy: 'Mohamed Sylla',
      validity: 75,
      status: 'valid',
      size: '2.3 MB',
      format: 'PDF',
      notes: 'Permis catégorie B',
      fileName: 'permis_mohamed.pdf',
      fileUrl: '/documents/permis.pdf',
      reviewedBy: 'Jean Dupont',
      reviewDate: '2024-03-26'
    },
    {
      id: 7,
      type: 'medical',
      owner: { id: 3, name: 'Mohamed Sylla', role: 'chauffeur' },
      number: 'MED-2024-123',
      expiryDate: '2025-09-15',
      issueDate: '2024-03-15',
      uploadDate: '2024-04-01',
      uploadBy: 'Mohamed Sylla',
      validity: 100,
      status: 'valid',
      size: '1.5 MB',
      format: 'PDF',
      notes: 'Certificat médical d\'aptitude',
      fileName: 'certificat_mohamed.pdf',
      fileUrl: '/documents/certificat.pdf',
      reviewedBy: 'Admin System',
      reviewDate: '2024-04-02'
    },
    {
      id: 8,
      type: 'registration',
      owner: { id: 3, name: 'Mohamed Sylla', role: 'chauffeur' },
      number: 'EF-789-GH',
      expiryDate: '2024-08-31',
      issueDate: '2021-08-31',
      uploadDate: '2024-02-28',
      uploadBy: 'Mohamed Sylla',
      validity: 10,
      status: 'expiring',
      size: '1.9 MB',
      format: 'PDF',
      notes: 'Carte grise expirant bientôt',
      fileName: 'carte_grise_mohamed.pdf',
      fileUrl: '/documents/carte_grise.pdf',
      reviewedBy: null,
      reviewDate: null
    },
    {
      id: 9,
      type: 'photo',
      owner: { id: 1, name: 'Kouamé Adou', role: 'chauffeur' },
      number: null,
      expiryDate: null,
      issueDate: null,
      uploadDate: '2024-03-15',
      uploadBy: 'Kouamé Adou',
      validity: 100,
      status: 'valid',
      size: '0.8 MB',
      format: 'JPG',
      notes: 'Photo d\'identité récente',
      fileName: 'photo_kouame.jpg',
      fileUrl: '/documents/photo.jpg',
      reviewedBy: 'Jean Dupont',
      reviewDate: '2024-03-16'
    },
    {
      id: 10,
      type: 'insurance',
      owner: { id: 1, name: 'Kouamé Adou', role: 'chauffeur' },
      number: 'ASS-111-222',
      expiryDate: '2024-04-30',
      issueDate: '2023-04-30',
      uploadDate: '2024-01-20',
      uploadBy: 'Kouamé Adou',
      validity: 5,
      status: 'expiring',
      size: '2.7 MB',
      format: 'PDF',
      notes: 'Assurance à renouveler',
      fileName: 'assurance_kouame.pdf',
      fileUrl: '/documents/assurance.pdf',
      reviewedBy: null,
      reviewDate: null
    },
    {
      id: 11,
      type: 'id_card',
      owner: { id: 2, name: 'Aïcha Diarra', role: 'chauffeur' },
      number: '1122334455',
      expiryDate: '2029-07-15',
      issueDate: '2019-07-15',
      uploadDate: '2024-03-10',
      uploadBy: 'Aïcha Diarra',
      validity: 85,
      status: 'valid',
      size: '1.3 MB',
      format: 'PDF',
      notes: 'CNI valide',
      fileName: 'cni_aicha.pdf',
      fileUrl: '/documents/cni.pdf',
      reviewedBy: 'Admin System',
      reviewDate: '2024-03-11'
    },
    {
      id: 12,
      type: 'inspection',
      owner: { id: 2, name: 'Aïcha Diarra', role: 'chauffeur' },
      number: 'CT-2023-789',
      expiryDate: '2024-10-15',
      issueDate: '2023-10-15',
      uploadDate: '2024-02-05',
      uploadBy: 'Aïcha Diarra',
      validity: 40,
      status: 'expiring',
      size: '2.1 MB',
      format: 'PDF',
      notes: 'Contrôle technique à vérifier',
      fileName: 'controle_aicha.pdf',
      fileUrl: '/documents/controle.pdf',
      reviewedBy: null,
      reviewDate: null
    },
    {
      id: 13,
      type: 'bank',
      owner: { id: 1, name: 'Kouamé Adou', role: 'chauffeur' },
      number: 'CI001 12345 67890123456 78',
      expiryDate: null,
      issueDate: '2023-05-10',
      uploadDate: '2024-03-01',
      uploadBy: 'Kouamé Adou',
      validity: 100,
      status: 'valid',
      size: '0.9 MB',
      format: 'PDF',
      notes: 'RIB pour paiements',
      fileName: 'rib_kouame.pdf',
      fileUrl: '/documents/rib.pdf',
      reviewedBy: 'Jean Dupont',
      reviewDate: '2024-03-02'
    },
    {
      id: 14,
      type: 'license',
      owner: { id: 4, name: 'Fatoumata Bâ', role: 'chauffeur', phone: '+225 03 45 67 89 01', email: 'fatoumata@example.com' },
      number: '999888777',
      expiryDate: '2028-03-20',
      issueDate: '2023-03-20',
      uploadDate: '2024-04-10',
      uploadBy: 'Fatoumata Bâ',
      validity: 95,
      status: 'pending',
      size: '2.6 MB',
      format: 'PDF',
      notes: 'Nouveau permis',
      fileName: 'permis_fatoumata.pdf',
      fileUrl: '/documents/permis.pdf',
      reviewedBy: null,
      reviewDate: null
    },
    {
      id: 15,
      type: 'insurance',
      owner: { id: 4, name: 'Fatoumata Bâ', role: 'chauffeur' },
      number: 'ASS-333-444',
      expiryDate: '2024-05-31',
      issueDate: '2023-05-31',
      uploadDate: '2024-04-12',
      uploadBy: 'Fatoumata Bâ',
      validity: 15,
      status: 'expiring',
      size: '3.0 MB',
      format: 'PDF',
      notes: 'Assurance expirant bientôt',
      fileName: 'assurance_fatoumata.pdf',
      fileUrl: '/documents/assurance.pdf',
      reviewedBy: null,
      reviewDate: null
    },
    {
      id: 16,
      type: 'id_card',
      owner: { id: 4, name: 'Fatoumata Bâ', role: 'chauffeur' },
      number: '6677889900',
      expiryDate: '2031-12-31',
      issueDate: '2021-12-31',
      uploadDate: '2024-04-08',
      uploadBy: 'Fatoumata Bâ',
      validity: 90,
      status: 'valid',
      size: '1.4 MB',
      format: 'JPG',
      notes: 'CNI valide',
      fileName: 'cni_fatoumata.jpg',
      fileUrl: '/documents/cni.jpg',
      reviewedBy: 'Admin System',
      reviewDate: '2024-04-09'
    },
    {
      id: 17,
      type: 'registration',
      owner: { id: 3, name: 'Mohamed Sylla', role: 'chauffeur' },
      number: 'IJ-456-KL',
      expiryDate: '2026-01-15',
      issueDate: '2023-01-15',
      uploadDate: '2024-03-18',
      uploadBy: 'Mohamed Sylla',
      validity: 85,
      status: 'valid',
      size: '2.0 MB',
      format: 'PDF',
      notes: 'Carte grise valide',
      fileName: 'carte_grise_mohamed2.pdf',
      fileUrl: '/documents/carte_grise.pdf',
      reviewedBy: 'Jean Dupont',
      reviewDate: '2024-03-19'
    },
    {
      id: 18,
      type: 'inspection',
      owner: { id: 1, name: 'Kouamé Adou', role: 'chauffeur' },
      number: 'CT-2024-056',
      expiryDate: '2025-04-30',
      issueDate: '2024-04-30',
      uploadDate: '2024-04-15',
      uploadBy: 'Kouamé Adou',
      validity: 100,
      status: 'pending',
      size: '2.2 MB',
      format: 'PDF',
      notes: 'Nouveau contrôle technique',
      fileName: 'controle_kouame.pdf',
      fileUrl: '/documents/controle.pdf',
      reviewedBy: null,
      reviewDate: null
    },
    {
      id: 19,
      type: 'photo',
      owner: { id: 2, name: 'Aïcha Diarra', role: 'chauffeur' },
      number: null,
      expiryDate: null,
      issueDate: null,
      uploadDate: '2024-03-22',
      uploadBy: 'Aïcha Diarra',
      validity: 100,
      status: 'valid',
      size: '0.7 MB',
      format: 'JPG',
      notes: 'Photo d\'identité',
      fileName: 'photo_aicha.jpg',
      fileUrl: '/documents/photo.jpg',
      reviewedBy: 'Admin System',
      reviewDate: '2024-03-23'
    },
    {
      id: 20,
      type: 'bank',
      owner: { id: 2, name: 'Aïcha Diarra', role: 'chauffeur' },
      number: 'CI002 54321 98765432109 87',
      expiryDate: null,
      issueDate: '2023-08-25',
      uploadDate: '2024-03-05',
      uploadBy: 'Aïcha Diarra',
      validity: 100,
      status: 'valid',
      size: '1.0 MB',
      format: 'PDF',
      notes: 'RIB pour virements',
      fileName: 'rib_aicha.pdf',
      fileUrl: '/documents/rib.pdf',
      reviewedBy: 'Jean Dupont',
      reviewDate: '2024-03-06'
    }
  ];

  // Configuration pour ExportDropdown
  const exportConfig = useMemo(() => ({
    columns: [
      { header: 'Type', accessor: (doc) => documentTypes.find(t => t.id === doc.type)?.label || doc.type },
      { header: 'Propriétaire', accessor: (doc) => doc.owner.name },
      { header: 'Numéro', accessor: (doc) => doc.number || 'N/A' },
      { header: 'Statut', accessor: (doc) => statusTypes.find(s => s.id === doc.status)?.label || doc.status },
      { header: 'Date expiration', accessor: (doc) => doc.expiryDate || 'N/A' },
      { header: 'Date upload', accessor: (doc) => doc.uploadDate },
      { header: 'Fichier', accessor: (doc) => doc.fileName },
      { header: 'Taille', accessor: (doc) => doc.size },
    ],
    fileName: `documents_${new Date().toISOString().split('T')[0]}`,
    title: 'Liste des documents',
    orientation: 'landscape'
  }), []);

  // Groupement des documents par chauffeur
  const groupDocumentsByDriver = (docs) => {
    const driversMap = {};

    docs.forEach(doc => {
      const driverId = doc.owner.id;
      if (!driversMap[driverId]) {
        driversMap[driverId] = {
          ...doc.owner,
          documents: [],
          totalDocuments: 0,
          validCount: 0,
          pendingCount: 0,
          expiredCount: 0,
          expiringCount: 0,
          rejectedCount: 0,
          completeness: 0
        };
      }

      driversMap[driverId].documents.push(doc);
      driversMap[driverId].totalDocuments++;

      // Compter par statut
      if (doc.status === 'valid') driversMap[driverId].validCount++;
      if (doc.status === 'pending') driversMap[driverId].pendingCount++;
      if (doc.status === 'expired') driversMap[driverId].expiredCount++;
      if (doc.status === 'expiring') driversMap[driverId].expiringCount++;
      if (doc.status === 'rejected') driversMap[driverId].rejectedCount++;
    });

    // Calculer le taux de complétude
    Object.keys(driversMap).forEach(driverId => {
      const driver = driversMap[driverId];
      const requiredDocs = documentTypes.filter(d => d.required);
      const completedRequired = requiredDocs.filter(reqType =>
        driver.documents.some(doc => doc.type === reqType.id && doc.status === 'valid')
      ).length;

      driver.completeness = requiredDocs.length > 0
        ? Math.round((completedRequired / requiredDocs.length) * 100)
        : 0;
    });

    return Object.values(driversMap);
  };

  // Initialisation des données
  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      setDocuments(initialDocuments);
      const driversData = groupDocumentsByDriver(initialDocuments);
      setDrivers(driversData);
      setFilteredDrivers(driversData);
      setLoading(false);
    };

    loadDocuments();
  }, []);

  // Stats calculées
  const stats = useMemo(() => {
    const totalDrivers = drivers.length;
    const totalDocuments = documents.length;
    const completeProfiles = drivers.filter(d => d.completeness === 100).length;
    const pendingReviews = drivers.reduce((sum, driver) => sum + driver.pendingCount, 0);
    const expiringSoon = drivers.reduce((sum, driver) => sum + driver.expiringCount, 0);

    return [
      {
        title: 'Chauffeurs',
        value: totalDrivers.toString(),
        icon: Users,
        color: 'blue',
        trend: totalDrivers > 3 ? 'up' : 'stable',
        percentage: totalDrivers > 0 ? Math.round((completeProfiles / totalDrivers) * 100) : 0,
        progress: totalDrivers > 0 ? Math.round((completeProfiles / totalDrivers) * 100) : 0,
        description: `${completeProfiles} profils complets`,
      },
      {
        title: 'Documents',
        value: totalDocuments.toString(),
        icon: FileText,
        color: 'green',
        trend: 'stable',
        percentage: 100,
        progress: 100,
        description: `${pendingReviews} à vérifier`,
      },
      {
        title: 'Expirent bientôt',
        value: expiringSoon.toString(),
        icon: Clock,
        color: 'orange',
        trend: expiringSoon > 0 ? 'up' : 'stable',
        percentage: totalDocuments > 0 ? Math.round((expiringSoon / totalDocuments) * 100) : 0,
        progress: totalDocuments > 0 ? Math.round((expiringSoon / totalDocuments) * 100) : 0,
        description: 'À renouveler rapidement',
      }
    ];
  }, [drivers, documents]);

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
  const handleBatchValidate = () => {
    const updatedDocuments = documents.map(doc =>
      selectedDocuments.includes(doc.id)
        ? { ...doc, status: 'valid', reviewDate: new Date().toISOString().split('T')[0] }
        : doc
    );

    setDocuments(updatedDocuments);
    const updatedDrivers = groupDocumentsByDriver(updatedDocuments);
    setDrivers(updatedDrivers);
    setSelectedDocuments([]);

    if (showToast) {
      showToast(
        'Documents validés',
        `${selectedDocuments.length} document(s) validé(s) avec succès`,
        'success'
      );
    }
  };

  const handleBatchReject = () => {
    const updatedDocuments = documents.map(doc =>
      selectedDocuments.includes(doc.id)
        ? { ...doc, status: 'rejected', reviewDate: new Date().toISOString().split('T')[0] }
        : doc
    );

    setDocuments(updatedDocuments);
    const updatedDrivers = groupDocumentsByDriver(updatedDocuments);
    setDrivers(updatedDrivers);
    setSelectedDocuments([]);

    if (showToast) {
      showToast(
        'Documents rejetés',
        `${selectedDocuments.length} document(s) rejeté(s)`,
        'warning'
      );
    }
  };

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
      case 'csv':
        exportToCSV(payload);
        break;
      case 'word':
        exportToWord(payload);
        break;
      case 'pdf':
        exportToPDF(payload);
        break;
      default:
        break;
    }
  };

  // Télécharger un document individuel
  const handleDownloadDocument = (document) => {
    if (showToast) {
      showToast(
        'Téléchargement',
        `Le document "${document.fileName}" est en cours de téléchargement`,
        'info'
      );
    }

    // Simulation de téléchargement
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '#';
      link.download = document.fileName;
      link.click();

      if (showToast) {
        showToast(
          'Téléchargement réussi',
          'Document téléchargé avec succès',
          'success'
        );
      }
    }, 1000);
  };

  // Valider un document individuel
  const handleValidateDocument = (documentId) => {
    const updatedDocuments = documents.map(doc =>
      doc.id === documentId
        ? { ...doc, status: 'valid', reviewDate: new Date().toISOString().split('T')[0] }
        : doc
    );

    setDocuments(updatedDocuments);
    const updatedDrivers = groupDocumentsByDriver(updatedDocuments);
    setDrivers(updatedDrivers);

    if (showToast) {
      showToast(
        'Document validé',
        'Le document a été validé avec succès',
        'success'
      );
    }
  };

  // Rejeter un document individuel
  const handleRejectDocument = (documentId) => {
    const updatedDocuments = documents.map(doc =>
      doc.id === documentId
        ? { ...doc, status: 'rejected', reviewDate: new Date().toISOString().split('T')[0] }
        : doc
    );

    setDocuments(updatedDocuments);
    const updatedDrivers = groupDocumentsByDriver(updatedDocuments);
    setDrivers(updatedDrivers);

    if (showToast) {
      showToast(
        'Document rejeté',
        'Le document a été rejeté',
        'warning'
      );
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
                const daysUntilExpiry = getDaysUntilExpiry(doc.expiryDate);

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
                          <p className="font-medium">{docType?.label}</p>
                          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>N°: {doc.number || 'N/A'}</span>
                            <span>•</span>
                            <span>Exp: {formatDate(doc.expiryDate)}</span>
                            {daysUntilExpiry !== null && daysUntilExpiry < 30 && (
                              <span className="text-red-600 font-medium">{daysUntilExpiry} jours</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getStatusBadge(doc.status)}

                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="small"
                            icon={Eye}
                            onClick={() => setViewingDocument(doc)}
                            title="Visualiser"
                          />
                          <Button
                            variant="ghost"
                            size="small"
                            icon={Download}
                            onClick={() => handleDownloadDocument(doc)}
                            title="Télécharger"
                          />
                          {doc.status === 'pending' && (
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
                  data={selectedDriver.documents}
                  columns={exportConfig.columns}
                  fileName={`documents_${selectedDriver.name.toLowerCase().replace(/\s+/g, '_')}`}
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Documents des Chauffeurs</h1>
          <p className="text-gray-600 dark:text-gray-300">Gérez et suivez tous les documents de vos chauffeurs</p>
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
              <CardTitle>Recherche de chauffeurs</CardTitle>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {filteredDrivers.length} chauffeur(s) trouvé(s)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Masquer filtres' : 'Filtres'}
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
                placeholder="Rechercher un chauffeur ou un document..."
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
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                            {driver.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{driver.name}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{driver.role}</p>
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
                            <p className="text-xs text-gray-600 dark:text-gray-800/90 font-bold">Valides</p>
                          </div>
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-900/90 font-bold">{driver.pendingCount}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-800/50 font-bold">En attente</p>
                          </div>
                        </div>

                        {/* Documents requis manquants */}
                        {driver.completeness < 100 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                              Documents requis manquants:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {documentTypes
                                .filter(type => type.required)
                                .filter(type => !driver.documents.some(doc =>
                                  doc.type === type.id && doc.status === 'valid'
                                ))
                                .map(type => (
                                  <span
                                    key={type.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                  >
                                    {React.createElement(type.icon, { className: "w-3 h-3 mr-1" })}
                                    {type.label}
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

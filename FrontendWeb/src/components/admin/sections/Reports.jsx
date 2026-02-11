// src/components/sections/Reports.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Calendar, ChevronDown, Users, DollarSign,
  MapPin, Activity, Shield, FileText, FileSpreadsheet, FileDown,
  RefreshCw, Plus, Eye, MoreVertical, AlertCircle, CheckCircle, XCircle, Clock, CalendarDays, Share2, ChevronLeft, Copy, Trash2, PieChart as PieChartIcon, LineChart as LineChartIcon, Car as CarIcon, Bike as BikeIcon, Cloud,
} from 'lucide-react';
import StatCard from '../layout/StatCard';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Table, { TableRow, TableCell } from '../ui/Table';
import Button from '../ui/Bttn';
import Badge from '../ui/Badge';
import Tabs from '../ui/Tabs';
import ConfirmModal from '../ui/ConfirmModal';
import Pagination from '../ui/Pagination';
import Toast from '../ui/Toast';
import Modal from '../ui/Modal';
import ExportDropdown from '../ui/ExportDropdown';

// ============= COMPOSANTS INTERNES =============

// Composant pour les actions rapides
const ReportActions = ({ report, onView, onGenerate, onExport, isMobile }) => {
  const [showActions, setShowActions] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Version mobile : boutons inline
  if (isMobile) {
    return (
      <div className="flex space-x-2">
        <button
          className="p-2 bg-blue-50 text-blue-600 rounded-lg"
          onClick={() => onView(report)}
          aria-label="Voir détails"
        >
          <Eye className="w-4 h-4" />
        </button>
        {report.status === 'generated' ? (
          <button
            className="p-2 bg-green-50 text-green-600 rounded-lg"
            onClick={() => onGenerate(report)}
            aria-label="Télécharger"
          >
            <Download className="w-4 h-4" />
          </button>
        ) : (
          <button
            className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"
            onClick={() => onGenerate(report)}
            aria-label="Regénérer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Version desktop : menu déroulant
  return (
    <div className="relative" ref={menuRef}>
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-lg transition"
        onClick={() => setShowActions(!showActions)}
        aria-label="Actions du rapport"
      >
        <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 z-50"
          >
            <div className="py-1">
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                onClick={() => {
                  onView(report);
                  setShowActions(false);
                }}
              >
                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                Voir détails
              </button>
              {report.status === 'generated' ? (
                <>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                    onClick={() => {
                      onGenerate(report);
                      setShowActions(false);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2 text-green-500" />
                    Télécharger
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                    onClick={() => {
                      onExport(report);
                      setShowActions(false);
                    }}
                  >
                    <FileDown className="w-4 h-4 mr-2 text-blue-500" />
                    Exporter...
                  </button>
                </>
              ) : (
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                  onClick={() => {
                    onGenerate(report);
                    setShowActions(false);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2 text-yellow-500" />
                  Regénérer
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant pour le badge de statut
const StatusBadge = ({ status }) => {
  const config = {
    generated: {
      label: 'Généré',
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    },
    pending: {
      label: 'En attente',
      icon: Clock,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    },
    failed: {
      label: 'Échoué',
      icon: XCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    },
    processing: {
      label: 'En cours',
      icon: RefreshCw,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500'
    }
  };

  const { label, icon: Icon, bgColor, textColor, iconColor } = config[status] || config.pending;

  return (
    <Badge className={`flex items-center gap-1 ${bgColor} ${textColor} px-2 py-1 text-xs sm:text-sm`}>
      {/* <Icon className={`w-3 h-3 ${iconColor}`} /> */}
      <span className="font-medium">{label}</span>
    </Badge>
  );
};

// Composant pour le badge de type
const TypeBadge = ({ type }) => {
  const config = {
    financial: {
      label: 'Financier',
      icon: DollarSign,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    },
    users: {
      label: 'Utilisateurs',
      icon: Users,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500'
    },
    geographic: {
      label: 'Géographique',
      icon: MapPin,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      iconColor: 'text-purple-500'
    },
    performance: {
      label: 'Performance',
      icon: Activity,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    },
    security: {
      label: 'Sécurité',
      icon: Shield,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    }
  };

  const { label, icon: Icon, bgColor, textColor, iconColor } = config[type] || config.financial;

  return (
    <Badge className={`flex items-center gap-1 ${bgColor} ${textColor} px-2 py-1 text-xs sm:text-sm`}>
      {/* <Icon className={`w-3 h-3 ${iconColor}`} /> */}
      <span className="font-medium">{label}</span>
    </Badge>
  );
};

// Composant pour le badge de format
const FormatBadge = ({ format }) => {
  const config = {
    pdf: {
      label: 'PDF',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    },
    csv: {
      label: 'CSV',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    },
    word: {
      label: 'Word',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    }
  };

  const { label, bgColor, textColor } = config[format] || config.pdf;

  return (
    <Badge className={`${bgColor} ${textColor} px-2 py-1 text-xs sm:text-sm`}>
      <span className="font-medium">{label}</span>
    </Badge>
  );
};

// Composant pour les filtres
const ReportFilters = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  formatFilter,
  setFormatFilter,
  filteredReports,
  exportColumns,
  showToast,
  setCurrentPage
}) => {
  return (
    <Card hoverable={false} className="mb-4 md:mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-3 py-2 md:pl-12 md:pr-4 md:py-3 border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-3 py-2 md:px-4 md:py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">Tous les statuts</option>
          <option value="generated">Généré</option>
          <option value="pending">En attente</option>
          <option value="processing">En cours</option>
          <option value="failed">Échoué</option>
        </select>

        <select
          className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-3 py-2 md:px-4 md:py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm"
          value={formatFilter}
          onChange={(e) => {
            setFormatFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">Tous les formats</option>
          <option value="pdf">PDF</option>
          <option value="csv">CSV</option>
          <option value="word">Word</option>
        </select>

        <div className="relative flex items-end">
          <ExportDropdown
            data={filteredReports}
            columns={exportColumns}
            fileName="rapports"
            title="Export des rapports"
            orientation="landscape"
            showToast={showToast}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
};

// Composant pour le tableau des rapports (version mobile)
const MobileReportCard = ({ report, onView, onGenerate, onDownload, isMobile }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-900 p-4 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-2">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm md:text-base mb-1 truncate">{report.title}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{report.description}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            <TypeBadge type={report.type} />
            <StatusBadge status={report.status} />
          </div>
        </div>
        <ReportActions
          report={report}
          onView={onView}
          onGenerate={onGenerate}
          onExport={() => { }}
          isMobile={isMobile}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500 dark:text-gray-400 block mb-1">Format</span>
          <FormatBadge format={report.format} />
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400 block mb-1">Date</span>
          <span className="text-gray-800 dark:text-gray-100 font-medium">{report.createdAt}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400 block mb-1">ID</span>
          <span className="text-gray-800 dark:text-gray-100 font-mono text-xs">{report.id}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400 block mb-1">Téléchargements</span>
          <span className="text-gray-800 dark:text-gray-100 font-medium">{report.downloadCount}</span>
        </div>
      </div>
    </div>
  );
};

// ============= DONNÉES ET LOGIQUE =============

// Données de démonstration
const generateReports = (count = 50) => {
  const types = ['financial', 'users', 'geographic', 'performance', 'security'];
  const statuses = ['generated', 'pending', 'failed', 'processing'];
  const formats = ['pdf', 'csv', 'word'];
  const authors = ['Admin', 'System', 'Manager', 'Analyst'];

  return Array.from({ length: count }, (_, i) => {
    const type = types[i % types.length];
    const status = statuses[i % statuses.length];
    const format = formats[i % formats.length];
    const size = Math.floor(Math.random() * 5000) + 1000;
    const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    const getTitle = () => {
      const prefixes = {
        financial: ['Rapport Financier', 'Analyse Revenus', 'Commissions'],
        users: ['Activité Utilisateurs', 'Nouveaux Inscrits', 'Engagement'],
        geographic: ['Distribution Géographique', 'Zones Actives', 'Couverture'],
        performance: ['Performance Plateforme', 'Métriques Clés', 'KPI'],
        security: ['Audit Sécurité', 'Conformité', 'Vulnérabilités']
      };
      return `${prefixes[type][i % 3]} ${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const getDescription = () => {
      const descriptions = {
        financial: 'Analyse détaillée des revenus, dépenses et commissions',
        users: "Statistiques d'utilisation et comportement des utilisateurs",
        geographic: 'Répartition géographique des trajets et demandes',
        performance: 'Indicateurs de performance et métriques clés',
        security: 'Rapport d\'audit de sécurité et conformité'
      };
      return descriptions[type];
    };

    return {
      id: `RPT-${String(i + 1000).padStart(6, '0')}`,
      title: getTitle(),
      description: getDescription(),
      type,
      status,
      format,
      size,
      author: authors[Math.floor(Math.random() * authors.length)],
      createdAt: date.toLocaleDateString('fr-FR'),
      period: `${date.getDate()}/${date.getMonth() + 1} - ${new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).getDate()}/${new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).getMonth() + 1}`,
      lastAccessed: Math.random() > 0.5 ? new Date(date.getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR') : null,
      downloadCount: Math.floor(Math.random() * 100),
      tags: [type, format, status === 'generated' ? 'disponible' : 'en attente']
    };
  });
};

// ============= COMPOSANT PRINCIPAL =============

// TODO API (admin/rapports):
// Remplacer les donnees simulees et la generation locale par des appels backend
// Exemple: GET API_ROUTES.admin.reports, POST /admin/reports/generate
const Reports = () => {
  // États
  const [reports, setReports] = useState(() => generateReports(50));
  const [activeReportType, setActiveReportType] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });
  const [isMobile, setIsMobile] = useState(false);

  // États pour les modales
  const [modalState, setModalState] = useState({
    showGenerate: false,
    showDelete: false,
    showDetails: false,
    showExport: false,
    selectedReport: null,
    selectedFormat: 'pdf',
    loading: false
  });

  const [newReport, setNewReport] = useState({
    type: 'financial',
    format: 'pdf',
    period: 'month',
    customStart: '',
    customEnd: '',
    includeCharts: true,
    includeDetails: true,
    emailNotification: false
  });

  // Détection de la taille de l'écran
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Stats calculées
  const stats = useMemo(() => {
    const generated = reports.filter(r => r.status === 'generated').length;
    const totalDownloads = reports.reduce((acc, r) => acc + r.downloadCount, 0);

    return [
      {
        title: 'Rapports générés',
        value: generated.toString(),
        icon: CheckCircle,
        color: 'green',
        trend: 'up',
        percentage: Math.round((generated / reports.length) * 100),
        progress: (generated / reports.length) * 100,
        subtitle: `${generated} rapports disponibles`
      },
      {
        title: 'Téléchargements',
        value: totalDownloads.toString(),
        icon: Download,
        color: 'purple',
        trend: 'up',
        percentage: Math.round((totalDownloads / 500) * 100),
        progress: Math.min((totalDownloads / 1000) * 100, 100),
        subtitle: 'Téléchargements totaux'
      }
    ];
  }, [reports]);

  // Filtrage des rapports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch =
        search === '' ||
        report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.description.toLowerCase().includes(search.toLowerCase()) ||
        report.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesFormat = formatFilter === 'all' || report.format === formatFilter;
      const matchesType = activeReportType === 'all' || report.type === activeReportType;

      return matchesSearch && matchesStatus && matchesFormat && matchesType;
    });
  }, [reports, search, statusFilter, formatFilter, activeReportType]);

  // Pagination
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredReports.slice(startIndex, endIndex);
  }, [filteredReports, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredReports.length / pageSize);

  // Handlers
  const handleGenerateReport = (reportData = null) => {
    setModalState(prev => ({ ...prev, loading: true }));

    const reportId = reportData?.id || `RPT-${String(reports.length + 1000).padStart(6, '0')}`;
    const title = reportData?.title || `Rapport ${new Date().toLocaleDateString('fr-FR')}`;

    setTimeout(() => {
      if (reportData) {
        // Regénérer un rapport existant
        setReports(prev => prev.map(report =>
          report.id === reportId
            ? { ...report, status: 'generated', lastAccessed: new Date().toLocaleDateString('fr-FR') }
            : report
        ));
      } else {
        // Générer un nouveau rapport
        const newReportObj = {
          id: reportId,
          title,
          description: newReport.type === 'financial' ? 'Analyse financière complète' :
            newReport.type === 'users' ? 'Statistiques utilisateurs' :
              newReport.type === 'geographic' ? 'Répartition géographique' :
                newReport.type === 'performance' ? 'Indicateurs performance' : 'Audit sécurité',
          type: newReport.type,
          status: 'generated',
          format: newReport.format,
          size: Math.floor(Math.random() * 5000) + 1000,
          author: 'Admin',
          createdAt: new Date().toLocaleDateString('fr-FR'),
          period: `${new Date().getDate()}/${new Date().getMonth() + 1} - ${new Date(new Date().setDate(new Date().getDate() + 30)).getDate()}/${new Date().getMonth() + 1}`,
          lastAccessed: null,
          downloadCount: 0,
          tags: [newReport.type, newReport.format, 'nouveau']
        };

        setReports(prev => [newReportObj, ...prev]);
      }

      setModalState(prev => ({ ...prev, loading: false, showGenerate: false }));
      showToast(
        'Rapport généré',
        reportData ? 'Le rapport a été regénéré avec succès' : 'Nouveau rapport généré avec succès',
        'success'
      );
    }, 1500);
  };

  const handleDeleteReport = (reportId) => {
    setModalState(prev => ({ ...prev, loading: true }));

    setTimeout(() => {
      setReports(prev => prev.filter(report => report.id !== reportId));
      setModalState(prev => ({ ...prev, loading: false, showDelete: false }));
      showToast('Rapport supprimé', 'Le rapport a été supprimé avec succès', 'warning');
    }, 1000);
  };

  const handleDownloadReport = (report, format = 'pdf') => {
    showToast('Téléchargement', `Téléchargement du rapport ${report.id}...`, 'info');

    setTimeout(() => {
      const updatedReports = reports.map(r =>
        r.id === report.id ? { ...r, downloadCount: r.downloadCount + 1, lastAccessed: new Date().toLocaleDateString('fr-FR') } : r
      );
      setReports(updatedReports);

      showToast('Téléchargement terminé', `Le rapport ${report.id} a été téléchargé en format ${format}`, 'success');
    }, 1000);
  };

  const showToast = (title, message, type = 'success') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleViewDetails = (report) => {
    setModalState(prev => ({
      ...prev,
      showDetails: true,
      selectedReport: report
    }));
  };

  const handleExportReport = (report) => {
    setModalState(prev => ({
      ...prev,
      showExport: true,
      selectedReport: report,
      selectedFormat: 'pdf'
    }));
  };

  // Configuration des colonnes pour l'exportation
  const exportColumns = useMemo(() => [
    { header: 'ID', accessor: 'id' },
    { header: 'Titre', accessor: 'title' },
    { header: 'Description', accessor: 'description' },
    { header: 'Type', accessor: 'type' },
    { header: 'Format', accessor: 'format' },
    { header: 'Statut', accessor: 'status' },
    { header: 'Auteur', accessor: 'author' },
    { header: 'Date de création', accessor: 'createdAt' },
    { header: 'Période', accessor: 'period' },
    { header: 'Dernier accès', accessor: 'lastAccessed', formatter: (val) => val || 'Jamais' },
    { header: 'Téléchargements', accessor: 'downloadCount' },
    { header: 'Taille (KB)', accessor: 'size' }
  ], []);

  // Configuration des tabs
  const reportTypes = [
    { id: 'all', label: 'Tous', icon: FileText },
    { id: 'financial', label: 'Financier', icon: DollarSign },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'geographic', label: 'Géographique', icon: MapPin },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'security', label: 'Sécurité', icon: Shield }
  ];

  // Modal de détails du rapport
  const ReportDetailsModal = () => {
    const report = modalState.selectedReport;
    if (!report) return null;

    return (
      <Modal
        isOpen={modalState.showDetails}
        onClose={() => setModalState(prev => ({ ...prev, showDetails: false }))}
        title="Détails du rapport"
        size="lg"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
          {/* En-tête */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{report.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{report.description}</p>
              <div className="flex flex-wrap items-center mt-2 gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">ID: {report.id}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Format: {report.format}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <StatusBadge status={report.status} />
            </div>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Informations générales</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Type:</span>
                    <span className="font-medium"><TypeBadge type={report.type} /></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Format:</span>
                    <span className="font-medium"><FormatBadge format={report.format} /></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Statut:</span>
                    <span className="font-medium"><StatusBadge status={report.status} /></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Auteur:</span>
                    <span className="font-medium">{report.author}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Métriques</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Taille:</span>
                    <span className="font-medium">{report.size} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Téléchargements:</span>
                    <span className="font-medium">{report.downloadCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Date création:</span>
                    <span className="font-medium">{report.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Dernier accès:</span>
                    <span className="font-medium">{report.lastAccessed || 'Jamais'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Création</h4>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                <span className="font-medium">{report.createdAt}</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Période</h4>
              <div className="flex items-center">
                <CalendarDays className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                <span className="font-medium">{report.period}</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Dernier accès</h4>
              <div className="flex items-center">
                <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                <span className="font-medium">{report.lastAccessed || 'Jamais'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="secondary"
              onClick={() => setModalState(prev => ({ ...prev, showDetails: false }))}
            >
              Fermer
            </Button>
            {report.status === 'generated' ? (
              <>
                <Button
                  variant='perso'
                  icon={Download}
                  onClick={() => {
                    handleDownloadReport(report);
                    setModalState(prev => ({ ...prev, showDetails: false }));
                  }}
                >
                  Télécharger
                </Button>
                <Button
                  variant="secondary"
                  icon={Share2}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('Lien copié', 'Le lien vers le rapport a été copié', 'success');
                  }}
                >
                  Partager
                </Button>
              </>
            ) : (
              <Button
                variant="warning"
                icon={RefreshCw}
                onClick={() => {
                  handleGenerateReport(report);
                  setModalState(prev => ({ ...prev, showDetails: false }));
                }}
              >
                Regénérer
              </Button>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  // Modal pour générer un nouveau rapport
  const GenerateReportModal = () => (
    <Modal
      isOpen={modalState.showGenerate}
      onClose={() => setModalState(prev => ({ ...prev, showGenerate: false }))}
      title="Générer un nouveau rapport"
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Type de rapport
            </label>
            <select
              value={newReport.type}
              onChange={(e) => setNewReport(prev => ({ ...prev, type: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="financial">Financier</option>
              <option value="users">Utilisateurs</option>
              <option value="geographic">Géographique</option>
              <option value="performance">Performance</option>
              <option value="security">Sécurité</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Format de sortie
            </label>
            <select
              value={newReport.format}
              onChange={(e) => setNewReport(prev => ({ ...prev, format: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="word">Word</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Période
            </label>
            <select
              value={newReport.period}
              onChange={(e) => setNewReport(prev => ({ ...prev, period: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
              <option value="custom">Personnalisée</option>
            </select>
          </div>

          {newReport.period === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={newReport.customStart}
                  onChange={(e) => setNewReport(prev => ({ ...prev, customStart: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={newReport.customEnd}
                  onChange={(e) => setNewReport(prev => ({ ...prev, customEnd: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Options supplémentaires</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newReport.includeCharts}
                onChange={(e) => setNewReport(prev => ({ ...prev, includeCharts: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-700 text-green-500 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Inclure les graphiques</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newReport.includeDetails}
                onChange={(e) => setNewReport(prev => ({ ...prev, includeDetails: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-700 text-green-500 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Inclure les détails complets</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="secondary"
            onClick={() => setModalState(prev => ({ ...prev, showGenerate: false }))}
          >
            Annuler
          </Button>
          <Button
            variant="perso"
            icon={FileText}
            onClick={() => handleGenerateReport()}
            loading={modalState.loading}
          >
            Générer le rapport
          </Button>
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="space-y-4 md:space-y-6 p-2 ">
      {/* Modales */}
      <ReportDetailsModal />
      <GenerateReportModal />

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* Modale de confirmation de suppression */}
      <ConfirmModal
        isOpen={modalState.showDelete}
        onClose={() => setModalState(prev => ({ ...prev, showDelete: false }))}
        onConfirm={() => handleDeleteReport(modalState.selectedReport?.id)}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le rapport ${modalState.selectedReport?.id} ?`}
        type="delete"
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        destructive={true}
        loading={modalState.loading}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Rapports et analyses</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Analyses détaillées et rapports de performance</p>
        </div>

        <div className="flex w-full md:w-auto">
          <Button
            icon={Plus}
            onClick={() => setModalState(prev => ({ ...prev, showGenerate: true }))}
            className="w-full md:w-auto"
            variant='perso'
          >
            <span className="hidden md:inline">Nouveau rapport</span>
            <span className="md:hidden">Nouveau</span>
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-4">
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

      {/* Filtres */}
      <ReportFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        formatFilter={formatFilter}
        setFormatFilter={setFormatFilter}
        filteredReports={filteredReports}
        exportColumns={exportColumns}
        showToast={showToast}
        setCurrentPage={setCurrentPage}
      />

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        <div className="min-w-max">
          <Tabs
            tabs={reportTypes}
            activeTab={activeReportType}
            onChange={(tab) => {
              setActiveReportType(tab);
              setCurrentPage(1);
            }}
            className="px-2 "
          />
        </div>
      </div>

      {/* Tableau des rapports */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Rapports ({filteredReports.length})</CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {paginatedReports.length} affiché(s) sur {filteredReports.length}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Afficher :</span>
              <select
                className="border border-gray-200 dark:bg-gray-900/40 dark:border-gray-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400 transition w-full md:w-auto"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Version mobile */}
          {isMobile ? (
            <div className="space-y-3">
              {paginatedReports.map((report) => (
                <MobileReportCard
                  key={report.id}
                  report={report}
                  onView={handleViewDetails}
                  onGenerate={(r) => {
                    if (r.status === 'generated') {
                      handleDownloadReport(r);
                    } else {
                      handleGenerateReport(r);
                    }
                  }}
                  onDownload={handleDownloadReport}
                  isMobile={isMobile}
                />
              ))}
            </div>
          ) : (
            /* Version desktop */
            <div className="overflow-x-auto">
              <Table
                headers={[
                  'Rapport',
                  'Type',
                  'Statut',
                  'Créé le',
                  'Actions'
                ]}
              >
                {paginatedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="min-w-[200px]">
                        <p className="font-medium text-gray-800 dark:text-gray-100">{report.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{report.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[120px]">
                        <TypeBadge type={report.type} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[100px]">
                        <StatusBadge status={report.status} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[120px]">
                        <div className="text-sm text-gray-800 dark:text-gray-100">{report.createdAt}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{report.period}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="">
                        <ReportActions
                          report={report}
                          onView={handleViewDetails}
                          onGenerate={(r) => {
                            if (r.status === 'generated') {
                              handleDownloadReport(r);
                            } else {
                              handleGenerateReport(r);
                            }
                          }}
                          onExport={handleExportReport}
                          isMobile={isMobile}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          )}

          {/* Pagination */}
          {filteredReports.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                totalItems={filteredReports.length}
                showInfo={true}
              />
            </div>
          )}

          {paginatedReports.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucun rapport trouvé</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Essayez de modifier vos filtres ou générez un nouveau rapport
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;

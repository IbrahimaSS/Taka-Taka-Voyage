// src/components/sections/Reports.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import Modal from '../ui/Modal';
import ExportDropdown from '../ui/ExportDropdown';
import { adminService } from '../../../services/adminService';
import { exportToPDF, exportToCSV, exportToWord } from '../../../utils/exporters';
import { findNameInObject, getReportSize } from './reports/reportHelpers';
import { StatusBadge, TypeBadge, FormatBadge } from './reports/reportBadges';
import ReportActions from './reports/ReportActions';
import MobileReportCard from './reports/MobileReportCard';
import ReportFilters from './reports/ReportFilters';
import ReportDetailsModal from './reports/ReportDetailsModal';
import GenerateReportModal from './reports/GenerateReportModal';
import ScheduleReportModal from './reports/ScheduleReportModal';

// ============= COMPOSANTS INTERNES =============

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
const Reports = ({ showToast }) => {
  const { t } = useTranslation();
  // États
  const [reports, setReports] = useState([]);
  const [statsData, setStatsData] = useState({ commissionCeMois: 0, chauffeursPayes: 0 });
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeReportType, setActiveReportType] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isMobile, setIsMobile] = useState(false);

  // États pour les modales
  const [modalState, setModalState] = useState({
    showGenerate: false,
    showDelete: false,
    showDetails: false,
    showExport: false,
    showSchedule: false,
    selectedReport: null,
    selectedFormat: 'pdf',
    loading: false
  });

  const [schedules, setSchedules] = useState([]);

  const [newReport, setNewReport] = useState({
    type: 'FINANCIER',
    format: 'PDF',
    period: 'month',
    customStart: '',
    customEnd: '',
    includeCharts: true,
    includeDetails: true,
    emailNotification: false,
    isScheduled: false,
    frequency: 'weekly'
  });

  const [newSchedule, setNewSchedule] = useState({
    type: 'FINANCIER',
    format: 'PDF',
    frequency: 'weekly',
    recipients: '',
    includeCharts: true,
    includeDetails: true
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

  // Fetch Stats et Rapports
  const fetchData = async () => {
    // Initialiser l'email par défaut si vide
    if (!newSchedule.recipients) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.email) {
            setNewSchedule(prev => ({ ...prev, recipients: user.email }));
          }
        } catch (e) { }
      }
    }

    setLoading(true);
    try {
      const { data: statsRes } = await adminService.getReportStats();
      if (statsRes.succes) {
        setStatsData(statsRes.Cards);
      }

      const params = {
        page: currentPage,
        limit: pageSize,
      };

      const typeMap = {
        'FINANCIER': 'financial',
        'UTILISATEURS': 'users',
        'GEOGRAPHIQUE': 'geographic',
        'TRAJETS': 'geographic',
        'PERFORMANCE': 'performance',
        'SECURITE': 'security'
      };

      const { data: rapportsRes } = await adminService.getReports(params);
      if (rapportsRes.succes && rapportsRes.rapports) {
        setReports(rapportsRes.rapports.map(r => ({
          id: String(r.id || r._id),
          title: r.rapport || 'Rapport sans titre',
          description: `Rapport ${String(r.type || '').toLowerCase()} généré par le système`,
          type: typeMap[r.type] || String(r.type || '').toLowerCase(),
          status: String(r.statut || '').toLowerCase() === 'genere' ? 'generated' :
            String(r.statut || '').toLowerCase() === 'en_attente' ? 'pending' :
              String(r.statut || '').toLowerCase() === 'en_cours' ? 'processing' : 'failed',
          format: String(r.format || '').toLowerCase() || 'pdf',
          author: 'Système',
          createdAt: r.creeLe ? new Date(r.creeLe).toLocaleDateString('fr-FR') : 'Date inconnue',
          lastAccessed: r.misAJourLe ? new Date(r.misAJourLe).toLocaleDateString('fr-FR') : null,
          size: getReportSize(typeMap[r.type] || String(r.type || '').toLowerCase(), String(r.format || '').toLowerCase() || 'pdf'),
          period: r.periode ? `${new Date(r.periode.debut).toLocaleDateString('fr-FR')} - ${new Date(r.periode.fin).toLocaleDateString('fr-FR')}` : "Période non def.",
          downloadCount: r.nombreTelechargements || 0,
          raw: r
        })));
        if (rapportsRes.pagination) {
          setTotalItems(rapportsRes.pagination.total || 0);
        }
      }

      // Fetch Schedules
      const { data: schedulesRes } = await adminService.getSchedules();
      if (schedulesRes.succes && schedulesRes.programmations) {
        setSchedules(schedulesRes.programmations.map(p => ({
          id: String(p.id || p._id),
          title: p.titre || 'Sans titre',
          type: p.type || 'Inconnu',
          frequency: p.frequence || 'weekly',
          format: p.format || 'PDF',
          recipients: p.destinataires || [],
          status: p.statut || 'active',
          nextRun: p.prochaineExecution,
          createdAt: p.creeLe
        })));
      }
    } catch (error) {
      console.error("Erreur fetching reports:", error);
      showToast('Erreur', 'Impossible de charger les données', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  // Stats calculées pour l'affichage (Cards)
  const stats = useMemo(() => {
    return [
      {
        title: t('commissions.commissions_this_month', 'Commissions ce mois'),
        value: `${statsData.commissionCeMois.toLocaleString()} GNF`,
        icon: DollarSign,
        color: 'green',
        trend: 'up',
        percentage: 12, // mock progress
        progress: 65,
        subtitle: t('commissions.platform_revenue', 'Revenus plateforme')
      },
      {
        title: t('commissions.paid_drivers', 'Chauffeurs payés'),
        value: statsData.chauffeursPayes.toString(),
        icon: Users,
        color: 'purple',
        trend: 'up',
        percentage: 8,
        progress: 45,
        subtitle: t('common.this_month', 'Ce mois-ci')
      }
    ];
  }, [statsData]);

  // Filtrage des rapports (Client-side search on top of paginated results)
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch =
        search === '' ||
        report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesFormat = formatFilter === 'all' || report.format === formatFilter;
      const matchesType = activeReportType === 'all' || report.type === activeReportType;

      return matchesSearch && matchesStatus && matchesFormat && matchesType;
    });
  }, [reports, search, statusFilter, formatFilter, activeReportType]);

  const totalPages = Math.ceil(totalItems / pageSize);

  // Handlers
  const handleGenerateReport = async () => {
    setModalState(prev => ({ ...prev, loading: true }));
    try {
      // 1. Génération immédiate
      const payload = {
        titre: `Rapport ${newReport.type.toLowerCase()} généré le ${new Date().toLocaleDateString('fr-FR')}`,
        type: newReport.type,
        format: newReport.format,
        periode: {
          debut: new Date(new Date().setDate(new Date().getDate() - 30)),
          fin: new Date()
        }
      };

      const { data: res } = await adminService.createReport(payload);

      // 2. Si l'utilisateur a coché "Planifier", on crée aussi une programmation
      if (newReport.isScheduled) {
        const storedUser = localStorage.getItem('user');
        let adminEmail = [];
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user.email) adminEmail = [user.email];
          } catch (e) { }
        }

        const schedulePayload = {
          titre: `Programmation : ${payload.titre}`,
          type: newReport.type,
          frequence: newReport.frequency || 'weekly',
          format: newReport.format,
          destinataires: adminEmail
        };
        await adminService.createSchedule(schedulePayload);
      }

      if (res.succes) {
        showToast('Rapport généré', 'Le rapport a été créé avec succès', 'success');
        setNewReport({
          type: 'FINANCIER',
          format: 'PDF',
          period: 'month',
          customStart: '',
          customEnd: '',
          includeCharts: true,
          includeDetails: true,
          emailNotification: false,
          isScheduled: false,
          frequency: 'weekly'
        });
        fetchData(); // rafraichir la liste
      }
    } catch (error) {
      console.error("Erreur création rapport:", error);
      showToast('Erreur', 'Impossible de générer le rapport', 'error');
    } finally {
      setModalState(prev => ({ ...prev, loading: false, showGenerate: false }));
    }
  };

  const handleSaveSchedule = async () => {
    setModalState(prev => ({ ...prev, loading: true }));
    try {
      const payload = {
        titre: `Rapport Auto : ${newSchedule.type}`,
        type: newSchedule.type,
        frequence: newSchedule.frequency,
        format: newSchedule.format,
        destinataires: newSchedule.recipients.split(',').map(e => e.trim()).filter(e => e)
      };

      const { data: res } = await adminService.createSchedule(payload);
      if (res.succes) {
        showToast('Succès', 'Planification enregistrée avec succès', 'success');
        setNewSchedule({
          type: 'FINANCIER',
          format: 'PDF',
          frequency: 'weekly',
          recipients: '',
          includeCharts: true,
          includeDetails: true
        });
        fetchData();
      }
    } catch (err) {
      console.error("Erreur sauvegarde planification:", err);
      showToast('Erreur', 'Impossible d\'enregistrer la planification', 'error');
    } finally {
      setModalState(prev => ({ ...prev, loading: false, showSchedule: false }));
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette planification ?")) return;
    try {
      await adminService.deleteSchedule(id);
      showToast('Supprimé', 'La planification a été retirée', 'info');
      fetchData();
    } catch (err) {
      console.error("Erreur suppression planification:", err);
      showToast('Erreur', 'Impossible de supprimer la planification', 'error');
    }
  };

  const handleDeleteReport = async (reportId) => {
    setModalState(prev => ({ ...prev, loading: true }));
    try {
      const { data: res } = await adminService.deleteReport(reportId);
      if (res.succes) {
        showToast('Rapport supprimé', 'Le rapport a été supprimé avec succès', 'warning');
        fetchData();
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      showToast('Erreur', 'Impossible de supprimer le rapport', 'error');
    } finally {
      setModalState(prev => ({ ...prev, loading: false, showDelete: false }));
    }
  };

  const handleDownloadReport = async (report) => {
    const reportFormat = report.format ? report.format.toLowerCase() : 'pdf';
    const type = report.type ? report.type.toLowerCase() : 'users';

    showToast('Téléchargement', `Génération du rapport ${type} en format ${reportFormat.toUpperCase()}...`, 'info');

    try {
      let data = [];
      let columns = [];
      const exportTitle = `Rapport ${type.charAt(0).toUpperCase() + type.slice(1)} - Taka Taka`;
      const fileName = `rapport_${type}_${report.id}`;

      // Configuration selon le type de rapport
      if (type === 'users' || type === 'utilisateurs') {
        const { data: res } = await adminService.getPassengers({ limit: 1000 });
        data = res.utilisateurs || [];
        columns = [
          { header: 'Nom', accessor: (u) => `${u.prenom || ''} ${u.nom || ''}` },
          { header: 'Email', accessor: 'email' },
          { header: 'Téléphone', accessor: 'telephone' },
          { header: 'Inscrit le', accessor: (u) => new Date(u.createdAt).toLocaleDateString('fr-FR') },
          { header: 'Statut', accessor: 'statut' },
          { header: 'Trajets', accessor: (u) => u.nombreTrajets || 0 }
        ];
      } else if (type === 'financial' || type === 'financier') {
        const { data: res } = await adminService.getPaymentList({ limit: 1000 });
        data = res.paiements || [];
        columns = [
          { header: 'N°', accessor: (p, i) => i + 1 },
          {
            header: 'Passager',
            accessor: (p) => findNameInObject(p, 'passager')
          },
          {
            header: 'Chauffeur',
            accessor: (p) => findNameInObject(p, 'chauffeur')
          },
          { header: 'Montant', accessor: (p) => `${Number(p.montantTotal || 0).toLocaleString('fr-FR')} GNF` },
          { header: 'Commission', accessor: (p) => `${Number(p.commissionPlateforme || 0).toLocaleString('fr-FR')} GNF` },
          { header: 'Date', accessor: (p) => p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : 'N/A' },
          { header: 'Statut', accessor: 'statut' }
        ];
      } else if (type === 'geographic' || type === 'trajets') {
        const { data: res } = await adminService.getTrips({ limit: 1000 });
        data = res.trajets || [];
        columns = [
          { header: 'N°', accessor: (t, i) => i + 1 },
          {
            header: 'Passager',
            accessor: (t) => findNameInObject(t, 'passager')
          },
          {
            header: 'Chauffeur',
            accessor: (t) => findNameInObject(t, 'chauffeur')
          },
          {
            header: 'Départ', accessor: (t) => {
              const dep = t.depart || (t.pointDepart && t.pointDepart.adresse) || (t.reservation && t.reservation.depart) || 'N/A';
              return dep.split(',').slice(0, 2).join(', ').replace(' ! ', ', '); // Keep it short
            }
          },
          {
            header: 'Arrivée', accessor: (t) => {
              const arr = t.destination || (t.pointArrivee && t.pointArrivee.adresse) || (t.reservation && t.reservation.destination) || 'N/A';
              return arr.split(',').slice(0, 2).join(', ').replace(' ! ', ', '); // Keep it short
            }
          },
          { header: 'Catégorie', accessor: (t) => t.typeVehicule || t.categorie || (t.reservation && t.reservation.typeVehicule) || 'N/A' },
          {
            header: 'Prix', accessor: (t) => {
              const p = t.prix || t.montant || (t.reservation && t.reservation.prix);
              return p ? `${Number(p).toLocaleString('fr-FR')} GNF` : 'N/A';
            }
          },
          { header: 'Statut', accessor: 'statut' },
          { header: 'Date', accessor: (t) => t.createdAt ? new Date(t.createdAt).toLocaleDateString('fr-FR') : 'N/A' }
        ];
      } else {
        // Fallback pour les types non encore implémentés spécifiquement
        data = reports.filter(r => r.id === report.id);
        columns = exportColumns;
      }

      if (data.length === 0 && (type === 'users' || type === 'financial' || type === 'geographic' || type === 'trajets' || type === 'utilisateurs' || type === 'financier')) {
        showToast('Info', 'Aucune donnée trouvée pour ce type de rapport actuellement.', 'info');
        return;
      }

      // Appel de l'exporteur approprié
      const exportOptions = {
        data,
        columns,
        fileName,
        title: exportTitle,
        onToast: (t, m, s) => showToast(t, m, s)
      };

      if (reportFormat === 'pdf') {
        await exportToPDF(exportOptions);
      } else if (reportFormat === 'csv') {
        exportToCSV(exportOptions);
      } else if (reportFormat === 'word') {
        exportToWord(exportOptions);
      } else {
        // Fallback PDF
        await exportToPDF(exportOptions);
      }

      // Incrémenter le compteur côté serveur
      adminService.incrementReportDownload(report.id).catch(err => console.error("Increment failed", err));

      // Mettre à jour localement pour l'affichage immédiat
      setReports(prev => prev.map(r =>
        r.id === report.id ? { ...r, downloadCount: r.downloadCount + 1, lastAccessed: new Date().toLocaleDateString('fr-FR') } : r
      ));

    } catch (error) {
      console.error("Export error:", error);
      showToast('Erreur', 'Impossible de récupérer les données pour générer le fichier.', 'error');
    }
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

  const exportColumns = useMemo(() => [
    { header: "N°", accessor: (row, i) => i + 1 },
    { header: 'Titre', accessor: 'title' },
    {
      header: 'Type', accessor: 'type', formatter: (val) => {
        const types = { financial: 'Financier', users: 'Utilisateurs', geographic: 'Géographique', performance: 'Performance', security: 'Sécurité' };
        return types[val] || val;
      }
    },
    { header: 'Format', accessor: 'format', formatter: (val) => val?.toUpperCase() || val },
    {
      header: 'Statut', accessor: 'status', formatter: (val) => {
        const statuses = { generated: 'Généré', pending: 'En attente', failed: 'Échoué', processing: 'En cours' };
        return statuses[val] || val;
      }
    },
    { header: 'Créé le', accessor: 'createdAt' },
    { header: 'Période', accessor: 'period' }
  ], []);

  // Configuration des tabs
  const reportTypes = [
    { id: 'all', label: t('common.all', 'Tous'), icon: FileText },
    { id: 'financial', label: t('reports.financial', 'Financier'), icon: DollarSign },
    { id: 'users', label: t('nav.utilisateurs', 'Utilisateurs'), icon: Users },
    { id: 'geographic', label: t('reports.geographic', 'Géographique'), icon: MapPin },
    { id: 'performance', label: t('reports.driver_performance', 'Performance'), icon: Activity },
    { id: 'schedule', label: t('reports.planning', 'Planification'), icon: Clock }
  ];

  // Modal pour planifier un rapport
  // Modal pour générer un nouveau rapport

  return (
    <div className="space-y-4 md:space-y-6 p-2 ">
      {/* Modales */}
      <ReportDetailsModal
        report={modalState.selectedReport}
        isOpen={modalState.showDetails}
        onClose={() => setModalState(prev => ({ ...prev, showDetails: false }))}
        onDownload={handleDownloadReport}
        onRegenerate={handleGenerateReport}
        showToast={showToast}
      />
      <GenerateReportModal
        isOpen={modalState.showGenerate}
        onClose={() => setModalState(prev => ({ ...prev, showGenerate: false }))}
        newReport={newReport}
        setNewReport={setNewReport}
        onGenerate={handleGenerateReport}
        loading={modalState.loading}
      />
      <ScheduleReportModal
        isOpen={modalState.showSchedule}
        onClose={() => setModalState(prev => ({ ...prev, showSchedule: false }))}
        newSchedule={newSchedule}
        setNewSchedule={setNewSchedule}
        onSave={handleSaveSchedule}
        loading={modalState.loading}
      />



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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{t('reports.title', 'Rapports et analyses')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">{t('reports.subtitle', 'Analyses détaillées et rapports de performance')}</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <Button
            icon={Clock}
            onClick={() => setModalState(prev => ({ ...prev, showSchedule: true }))}
            className="w-full md:w-auto"
            variant='outline'
          >
            <span className="hidden md:inline">{t('reports.schedule_report', 'Planifier')}</span>
            <span className="md:hidden">Plannif.</span>
          </Button>
          <Button
            icon={Plus}
            onClick={() => setModalState(prev => ({ ...prev, showGenerate: true }))}
            className="w-full md:w-auto"
            variant='perso'
          >
            <span className="hidden md:inline">{t('reports.generate_report', 'Nouveau rapport')}</span>
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
      {activeReportType !== 'schedule' && (
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
      )}

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
              <CardTitle>
                {activeReportType === 'schedule'
                  ? t('reports.planned_tasks', 'Tâches planifiées')
                  : t('reports.title', 'Rapports')}
                ({activeReportType === 'schedule' ? schedules.length : totalItems})
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {activeReportType === 'schedule'
                  ? `${schedules.length} programmation(s) active(s)`
                  : t('common.showing_n_of_m', { n: filteredReports.length, m: totalItems, defaultValue: `${filteredReports.length} affiché(s) sur ${totalItems}` })}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{t('common.display', 'Afficher :')}</span>
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-10 h-10 text-green-500 animate-spin mb-4" />
              <p className="text-gray-500 animate-pulse">Chargement des rapports...</p>
            </div>
          ) : activeReportType === 'schedule' ? (
            /* Vue spécifique pour la planification */
            <div className="overflow-x-auto">
              <Table
                headers={[
                  t('reports.task_name', 'Tâche'),
                  t('common.categories', 'Type'),
                  t('reports.frequency', 'Fréquence'),
                  t('reports.next_run', 'Prochaine exécution'),
                  t('common.status', 'Statut'),
                  t('common.actions', 'Actions')
                ]}
              >
                {schedules.map((sch) => (
                  <TableRow key={sch.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{sch.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{sch.recipients.join(', ')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sch.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm dark:text-gray-300 capitalize">
                        {sch.frequency === 'daily' ? 'Quotidienne' : sch.frequency === 'weekly' ? 'Hebdomadaire' : 'Mensuelle'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {new Date(sch.nextRun).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">{sch.status === 'active' ? 'Activée' : 'Désactivée'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="small" icon={RefreshCw} tooltip="Exécuter maintenant" />
                        <Button
                          variant="ghost"
                          size="small"
                          icon={Trash2}
                          className="text-red-500"
                          tooltip="Supprimer"
                          onClick={() => handleDeleteSchedule(sch.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          ) : isMobile ? (
            <div className="space-y-3">
              {filteredReports.map((report) => (
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
                  t('reports.trip_summary', 'Rapport'),
                  t('common.categories', 'Type'),
                  t('common.status', 'Statut'),
                  t('commissions.created_at', 'Créé le'),
                  t('common.actions', 'Actions')
                ]}
              >
                {filteredReports.map((report) => (
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
        </CardContent>

        {/* Pagination */}
        {activeReportType !== 'schedule' && filteredReports.length > 0 && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-800">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              showInfo={true}
            />
          </div>
        )}

        {(activeReportType === 'schedule' ? schedules.length === 0 : filteredReports.length === 0) && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {activeReportType === 'schedule' ? 'Aucune tâche planifiée' : 'Aucun rapport trouvé'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {activeReportType === 'schedule'
                ? 'Commencez par planifier une génération automatique'
                : 'Essayez de modifier vos filtres ou générez un nouveau rapport'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reports;

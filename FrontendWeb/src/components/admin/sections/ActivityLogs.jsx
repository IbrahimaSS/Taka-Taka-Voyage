import { useState, useEffect } from 'react';
import { ShieldAlert, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { apiClient } from '../../../services/apiClient';
import { socketService } from '../../../services/socketService';
import { exportToPDF, exportToCSV, exportToWord } from '../../../utils/exporters';
import ActivityLogsFilterBar from './activitylogs/ActivityLogsFilterBar';
import ActivityLogsTable from './activitylogs/ActivityLogsTable';
import LogDetailsModal from './activitylogs/LogDetailsModal';
import PurgeLogsModal from './activitylogs/PurgeLogsModal';

const ActivityLogs = ({ showToast }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    module: '',
    statut: '',
    estSuspect: false,
    dateDebut: '',
    dateFin: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [purgeDays, setPurgeDays] = useState(90);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [stats, setStats] = useState({ totalSuspects: 0, echecsDuJour: 0 });

  const fetchLogs = async (page = pagination.page) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role,
        module: filters.module,
        statut: filters.statut,
        estSuspect: filters.estSuspect,
        dateDebut: filters.dateDebut,
        dateFin: filters.dateFin
      });

      const res = await apiClient.get(`/admin/logs?${queryParams.toString()}`);
      if (res.data.succes) {
        setLogs(res.data.logs);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      showToast('Erreur', `Échec : ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/admin/logs/stats');
      if (res.data.succes) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [pagination.page]);

  // ✅ DÉCLENCHEUR DE FILTRE AUTOMATIQUE + RECHERCHE INSTANTANÉE
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchLogs(1);
    }, 300); // Petit délai de 300ms pour éviter de surcharger le serveur en tapant

    return () => clearTimeout(timer);
  }, [filters.search, filters.role, filters.module, filters.statut, filters.estSuspect, filters.dateDebut, filters.dateFin]);

  const handleExport = async (formatType) => {
    setShowExportModal(false);
    showToast('Info', `Préparation de l'export ${formatType.toUpperCase()}...`, 'info');

    try {
      // 1. Récupération des données filtrées (limite augmentée pour l'export)
      const queryParams = new URLSearchParams({
        limit: 1000,
        search: filters.search || '',
        role: filters.role || '',
        module: filters.module || '',
        statut: filters.statut || '',
        estSuspect: filters.estSuspect ? 'true' : 'false',
        dateDebut: filters.dateDebut || '',
        dateFin: filters.dateFin || ''
      });

      const res = await apiClient.get(`/admin/logs?${queryParams.toString()}`);
      const exportData = res?.data?.logs || [];

      if (exportData.length === 0) {
        showToast('Info', 'Aucune donnée à exporter', 'warning');
        return;
      }

      // 2. Configuration des colonnes pour le moteur d'exportation
      const columns = [
        { header: "DATE & HEURE", accessor: (l) => format(new Date(l.createdAt), 'dd/MM/yyyy HH:mm') },
        { header: "UTILISATEUR", accessor: "nomUtilisateur" },
        { header: "RÔLE", accessor: "role" },
        { header: "ACTION", accessor: (l) => l.action.replace(/_/g, ' ') },
        { header: "MODULE", accessor: "module" },
        { header: "STATUT", accessor: "statut" }
      ];

      // 3. Appel du moteur d'exportation officiel
      const options = {
        data: exportData,
        columns,
        fileName: `Journal_Activites_TakaTaka`,
        title: "Journal des Activités Système",
        onToast: (title, msg, type) => showToast(title, msg, type)
      };

      if (formatType === 'pdf') {
        await exportToPDF({ ...options, orientation: 'landscape' });
      } else if (formatType === 'csv') {
        exportToCSV(options);
      } else if (formatType === 'word') {
        exportToWord(options);
      }

    } catch (error) {
      console.error("Export Error:", error);
      showToast('Erreur', "Échec de l'exportation. Veuillez réessayer.", 'error');
    }
  };

  // ✅ RÉACTIVITÉ EN TEMPS RÉEL
  useEffect(() => {
    const handleNewLog = (data) => {
      // Si on est sur la première page et qu'il n'y a pas de recherche active
      if (pagination.page === 1 && !filters.search && !filters.role && !filters.module) {
        setLogs(prev => {
          if (prev.some(l => l._id === data.log._id)) return prev;
          return [data.log, ...prev].slice(0, pagination.limit);
        });
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      }
      fetchStats();
    };

    socketService.on("admin:log:new", handleNewLog);
    return () => socketService.off("admin:log:new", handleNewLog);
  }, [pagination.page, pagination.limit, filters]);

  const handleReportUser = async (logId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir signaler cette activité comme suspecte ?")) return;

    try {
      const res = await apiClient.post('/admin/logs/report-user', { logId });
      if (res.data.succes) {
        showToast('Succès', 'Utilisateur signalé avec succès', 'success');
        setSelectedLog(null);
        fetchLogs();
        fetchStats();
      }
    } catch (err) {
      showToast('Erreur', 'Impossible de signaler l\'utilisateur', 'error');
    }
  };

  const handlePurgeLogs = async (overrideDays) => {
    const jours = overrideDays !== undefined ? overrideDays : purgeDays;
    try {
      const res = await apiClient.delete('/admin/logs/purge', { data: { jours: parseInt(jours) } });
      if (res.data.succes) {
        showToast('Succès', res.data.message, 'success');
        setShowPurgeModal(false);
        fetchLogs(1);
        fetchStats();
      }
    } catch (err) {
      showToast('Erreur', 'Échec de la purge des logs', 'error');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchLogs(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      role: '',
      module: '',
      statut: '',
      estSuspect: false,
      dateDebut: '',
      dateFin: ''
    });
    setPagination({ ...pagination, page: 1 });
    // Note: useEffect dependency is pagination.page, so we need to trigger manually if page is already 1
    fetchLogs(1);
  };

  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100vh-160px)]">
      <div className="flex-1 space-y-6">
        {/* Header & Stats Rapid */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Journal d'Activités</h1>
            <p className="text-slate-500 dark:text-slate-400">Suivi complet des actions et alertes de sécurité</p>
          </div>

          <div className="flex gap-3">
            <div className={`p-4 rounded-2xl border backdrop-blur-sm transition-all ${stats.totalSuspects > 0 ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-800/50' : 'bg-white/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.totalSuspects > 0 ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <ShieldAlert className={stats.totalSuspects > 0 ? 'text-rose-600' : 'text-slate-500'} size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alertes Suspectes</p>
                  <p className={`text-xl font-bold ${stats.totalSuspects > 0 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'}`}>{stats.totalSuspects}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <XCircle className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Échecs (24h)</p>
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{stats.echecsDuJour}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de Recherche et Filtres */}
        <ActivityLogsFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onSearchSubmit={handleSearch}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onRefresh={() => fetchLogs()}
          loading={loading}
          onOpenPurgeModal={() => setShowPurgeModal(true)}
          showExportModal={showExportModal}
          onToggleExportModal={() => setShowExportModal(!showExportModal)}
          onExport={handleExport}
          onResetFilters={resetFilters}
        />

        {/* Tableau des Logs */}
        <ActivityLogsTable
          logs={logs}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setPagination({ ...pagination, page })}
          onSelectLog={setSelectedLog}
        />

        {/* Détails du Log (Modale) */}
        <LogDetailsModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          onReportUser={handleReportUser}
        />

        {/* Modale de Purge (Vider) */}
        <PurgeLogsModal
          isOpen={showPurgeModal}
          onClose={() => setShowPurgeModal(false)}
          purgeDays={purgeDays}
          onPurgeDaysChange={setPurgeDays}
          onPurge={handlePurgeLogs}
        />
      </div>
    </div>
  );
};

export default ActivityLogs;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  RefreshCw,
  User,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { apiClient } from '../../../services/apiClient';
import { socketService } from '../../../services/socketService';
import AdminButton from '../ui/Bttn';
import { exportToPDF, exportToCSV, exportToWord } from '../../../utils/exporters';

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
      const errorMsg = err.response?.data?.error || err.message;
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

  const getRoleBadge = (role) => {
    const styles = {
      ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      CHAUFFEUR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      PASSAGER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      SYSTEME: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      VISITEUR: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
    };
    return styles[role] || 'bg-gray-100 text-gray-600';
  };

  const getModuleBadge = (module) => {
    const styles = {
      AUTH: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
      UTILISATEURS: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
      TRANSPORT: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
      SYSTEME: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
    };
    return styles[module] || 'bg-slate-50 text-slate-600';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
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
        <div className="glass-morphism p-4 rounded-2xl border border-white/20 dark:border-slate-800 shadow-xl overflow-visible">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un utilisateur ou une action..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </form>

            <div className="flex gap-2">
              <AdminButton
                variant="outline"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-primary-50 border-primary-200' : ''}
              >
                Filtres
              </AdminButton>
              <AdminButton
                variant="outline"
                icon={RefreshCw}
                onClick={() => fetchLogs()}
                disabled={loading}
              >
                Actualiser
              </AdminButton>
              <AdminButton
                variant="outline"
                icon={XCircle}
                onClick={() => setShowPurgeModal(true)}
                className="text-rose-600 hover:bg-rose-50"
              >
                Vider
              </AdminButton>
              <div className="relative">
                <AdminButton
                  variant="perso"
                  icon={Download}
                  onClick={() => setShowExportModal(!showExportModal)}
                >
                  Exporter
                </AdminButton>

                {/* Menu Popover (Style Image 7) */}
                {showExportModal && (
                  <div className="absolute right-0 top-[110%] z-[60] w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 overflow-hidden ring-1 ring-slate-200">
                    {[
                      { id: 'csv', name: 'Exporter en CSV', desc: 'Format tableur', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                      { id: 'word', name: 'Exporter en Word', desc: 'Document éditable', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                      { id: 'pdf', name: 'Exporter en PDF', desc: 'Document imprimable', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => handleExport(opt.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all rounded-2xl group"
                      >
                        <div className={`w-10 h-10 rounded-xl ${opt.bg} flex items-center justify-center ${opt.color} group-hover:scale-110 transition-transform`}>
                          <Download size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{opt.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panneau de Filtres */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Rôle</label>
                <select
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                >
                  <option value="">Tous les rôles</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="CHAUFFEUR">Chauffeur</option>
                  <option value="PASSAGER">Passager</option>
                  <option value="SYSTEME">Système</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Module</label>
                <select
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  value={filters.module}
                  onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                >
                  <option value="">Tous les modules</option>
                  <option value="AUTH">Authentification</option>
                  <option value="UTILISATEURS">Utilisateurs</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="SYSTEME">Système</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date début</label>
                <input
                  type="date"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  value={filters.dateDebut}
                  onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={filters.estSuspect}
                      onChange={(e) => setFilters({ ...filters, estSuspect: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Activités Suspectes</span>
                  </label>
                </div>
                <button
                  onClick={resetFilters}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg text-sm font-bold transition-all"
                >
                  Réinitialiser
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Tableau des Logs */}
        <div className="glass-morphism rounded-3xl border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Utilisateur</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Rôle</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Module</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date & Heure</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <RefreshCw className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                      <p className="text-slate-500">Chargement des données...</p>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <p className="text-lg font-semibold text-slate-400">Aucune activité trouvée</p>
                    </td>
                  </tr>
                ) : logs.map((log) => (
                  <tr
                    key={log._id}
                    className={`hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all ${log.estSuspect ? 'bg-rose-50/40 dark:bg-rose-900/10' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-white dark:border-slate-700 overflow-hidden shadow-sm">
                          {log.utilisateurId?.photoUrl ? (
                            <img src={log.utilisateurId.photoUrl.startsWith('http') ? log.utilisateurId.photoUrl : `${apiClient.defaults.baseURL.replace('/api', '')}${log.utilisateurId.photoUrl}`} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <span className="text-xs font-bold text-slate-500">{getInitials(log.nomUtilisateur)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">
                            {log.nomUtilisateur}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tighter">
                            {log.ip || 'Local'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getRoleBadge(log.role)}`}>
                        {log.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {log.estSuspect && <ShieldAlert size={14} className="text-rose-500" />}
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {log.action.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${getModuleBadge(log.module)}`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {format(new Date(log.createdAt), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                        <div className="flex items-center gap-1.5 opacity-60">
                          <Clock size={12} />
                          <span className="text-[11px] font-medium">{format(new Date(log.createdAt), 'HH:mm:ss')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {log.statut === 'REUSSI' ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                            <CheckCircle2 size={14} />
                            <span className="text-[10px] font-bold uppercase">Réussi</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-full">
                            <XCircle size={14} />
                            <span className="text-[10px] font-bold uppercase">Échoué</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-600"
                      >
                        <Eye size={18} className="text-slate-400 hover:text-primary-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Table */}
          <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500">
              Affichage de <span className="font-bold text-slate-700 dark:text-slate-200">{logs.length}</span> activités sur <span className="font-bold text-slate-700 dark:text-slate-200">{pagination.total}</span>
            </p>

            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold">
                {pagination.page} / {pagination.totalPages}
              </div>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50 hover:bg-slate-50 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Détails du Log (Modale) */}
        {selectedLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedLog(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-lg">
                      <History size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold dark:text-white">Détails de l'activité</h3>
                      <p className="text-sm text-slate-500">ID: {selectedLog._id}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                    <XCircle size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedLog.estSuspect && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl flex gap-3">
                      <AlertTriangle className="text-rose-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Alerte de Sécurité</p>
                        <p className="text-sm text-rose-600 dark:text-rose-300 font-medium">{selectedLog.messageAlerte || 'Cette activité a un comportement anormal.'}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Utilisateur</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedLog.nomUtilisateur}</p>
                      <p className="text-xs text-slate-500">{selectedLog.role}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Action</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedLog.action}</p>
                      <p className="text-xs text-slate-500">{selectedLog.module}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Informations Système</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">IP: {selectedLog.ip || 'Non spécifiée'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{selectedLog.navigateur || 'Navigateur inconnu'}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date & Statut</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{format(new Date(selectedLog.createdAt), 'Pp', { locale: fr })}</p>
                      <p className={`text-[10px] font-black uppercase ${selectedLog.statut === 'REUSSI' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {selectedLog.statut}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-400 font-mono text-xs overflow-auto max-h-40 shadow-inner">
                    <p className="text-slate-500 mb-2">// Données additionnelles</p>
                    {selectedLog.details && Object.keys(selectedLog.details).length > 0 ? (
                      <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
                    ) : (
                      <p className="text-slate-600 italic">Aucune donnée technique supplémentaire</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <AdminButton className="flex-1" variant="outline" onClick={() => setSelectedLog(null)}>
                    Fermer
                  </AdminButton>
                  <AdminButton
                    className="flex-1"
                    variant="perso"
                    onClick={() => handleReportUser(selectedLog._id)}
                  >
                    Signaler l'utilisateur
                  </AdminButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modale de Purge (Vider) */}
        {showPurgeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowPurgeModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 mx-auto mb-6">
                  <AlertTriangle size={32} />
                </div>

                <h3 className="text-xl font-bold text-center dark:text-white mb-2">Nettoyer les journaux</h3>
                <p className="text-sm text-slate-500 text-center mb-8">
                  Choisissez la période de conservation. Les données plus anciennes seront supprimées définitivement.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="grid grid-cols-2 gap-3">
                    {[7, 30, 90, 365].map((d) => (
                      <button
                        key={d}
                        onClick={() => setPurgeDays(d)}
                        className={`p-3 rounded-xl border text-sm font-bold transition-all ${purgeDays === d ? 'bg-primary-500 border-primary-500 text-white shadow-lg' : 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                      >
                        Plus de {d} jours
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Ou choisir manuellement (jours)</label>
                    <input
                      type="number"
                      value={purgeDays}
                      onChange={(e) => setPurgeDays(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm("⚠️ ATTENTION : Cette action supprimera TOUT l'historique, y compris les actions de ce jour. Confirmer ?")) {
                        handlePurgeLogs(0);
                      }
                    }}
                    className="w-full p-3 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest hover:bg-orange-100 transition-all"
                  >
                    Vider tout l'historique (0 jour)
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 transition-all dark:text-white"
                    onClick={() => setShowPurgeModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 dark:shadow-none transition-all"
                    onClick={handlePurgeLogs}
                  >
                    Vider maintenant
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;

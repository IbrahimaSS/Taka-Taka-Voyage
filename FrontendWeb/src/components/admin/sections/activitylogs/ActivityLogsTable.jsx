import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RefreshCw, ShieldAlert, Clock, CheckCircle2, XCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '../../../../services/apiClient';
import { getRoleBadge, getInitials } from './activityLogHelpers';
import { getModuleBadge } from './activityLogBadges';

const LogAvatar = ({ log }) => (
  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-white dark:border-slate-700 overflow-hidden shadow-sm shrink-0">
    {log.utilisateurId?.photoUrl ? (
      <img src={log.utilisateurId.photoUrl.startsWith('http') ? log.utilisateurId.photoUrl : `${apiClient.defaults.baseURL.replace('/api', '')}${log.utilisateurId.photoUrl}`} className="w-full h-full object-cover" alt="" />
    ) : (
      <span className="text-xs font-bold text-slate-500">{getInitials(log.nomUtilisateur)}</span>
    )}
  </div>
);

const StatusPill = ({ statut }) => (
  statut === 'REUSSI' ? (
    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
      <CheckCircle2 size={14} />
      <span className="text-[10px] font-bold uppercase">Réussi</span>
    </div>
  ) : (
    <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-full">
      <XCircle size={14} />
      <span className="text-[10px] font-bold uppercase">Échoué</span>
    </div>
  )
);

const ActivityLogsTable = ({ logs, loading, pagination, onPageChange, onSelectLog }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="glass-morphism rounded-3xl border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
      {loading ? (
        <div className="px-6 py-20 text-center">
          <RefreshCw className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Chargement des données...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="px-6 py-20 text-center">
          <p className="text-lg font-semibold text-slate-400">Aucune activité trouvée</p>
        </div>
      ) : isMobile ? (
        <div className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
          {logs.map((log) => (
            <div
              key={log._id}
              className={`p-4 space-y-3 ${log.estSuspect ? 'bg-rose-50/40 dark:bg-rose-900/10' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <LogAvatar log={log} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">
                      {log.nomUtilisateur}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tighter">
                      {log.ip || 'Local'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectLog(log)}
                  className="w-11 h-11 flex items-center justify-center shrink-0 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  <Eye size={18} className="text-slate-400 hover:text-primary-500" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {log.estSuspect && <ShieldAlert size={14} className="text-rose-500 shrink-0" />}
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {log.action.replace(/_/g, ' ')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getRoleBadge(log.role)}`}>
                  {log.role}
                </span>
                {getModuleBadge(log.module)}
                <StatusPill statut={log.statut} />
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Clock size={12} />
                <span className="text-[11px] font-medium">
                  {format(new Date(log.createdAt), 'dd MMMM yyyy HH:mm:ss', { locale: fr })}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
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
              {logs.map((log) => (
                <tr
                  key={log._id}
                  className={`hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all ${log.estSuspect ? 'bg-rose-50/40 dark:bg-rose-900/10' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <LogAvatar log={log} />
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
                    {getModuleBadge(log.module)}
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
                      <StatusPill statut={log.statut} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onSelectLog(log)}
                      className="w-11 h-11 inline-flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-600"
                    >
                      <Eye size={18} className="text-slate-400 hover:text-primary-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Table */}
      <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
        <p className="text-sm text-slate-500">
          Affichage de <span className="font-bold text-slate-700 dark:text-slate-200">{logs.length}</span> activités sur <span className="font-bold text-slate-700 dark:text-slate-200">{pagination.total}</span>
        </p>

        <div className="flex gap-2">
          <button
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
            className="w-11 h-11 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50 hover:bg-slate-50 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold">
            {pagination.page} / {pagination.totalPages}
          </div>
          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
            className="w-11 h-11 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50 hover:bg-slate-50 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsTable;

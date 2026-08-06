import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { History, XCircle, AlertTriangle } from 'lucide-react';
import AdminButton from '../../ui/Bttn';

const LogDetailsModal = ({ log, onClose, onReportUser }) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
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
                <p className="text-sm text-slate-500">ID: {log._id}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
              <XCircle size={24} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            {log.estSuspect && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl flex gap-3">
                <AlertTriangle className="text-rose-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Alerte de Sécurité</p>
                  <p className="text-sm text-rose-600 dark:text-rose-300 font-medium">{log.messageAlerte || 'Cette activité a un comportement anormal.'}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Utilisateur</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{log.nomUtilisateur}</p>
                <p className="text-xs text-slate-500">{log.role}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Action</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{log.action}</p>
                <p className="text-xs text-slate-500">{log.module}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Informations Système</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">IP: {log.ip || 'Non spécifiée'}</p>
                <p className="text-[10px] text-slate-500 truncate">{log.navigateur || 'Navigateur inconnu'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date & Statut</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{format(new Date(log.createdAt), 'Pp', { locale: fr })}</p>
                <p className={`text-[10px] font-black uppercase ${log.statut === 'REUSSI' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {log.statut}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-slate-400 font-mono text-xs overflow-auto max-h-40 shadow-inner">
              <p className="text-slate-500 mb-2">// Données additionnelles</p>
              {log.details && Object.keys(log.details).length > 0 ? (
                <pre>{JSON.stringify(log.details, null, 2)}</pre>
              ) : (
                <p className="text-slate-600 italic">Aucune donnée technique supplémentaire</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <AdminButton className="flex-1" variant="outline" onClick={onClose}>
              Fermer
            </AdminButton>
            <AdminButton
              className="flex-1"
              variant="perso"
              onClick={() => onReportUser(log._id)}
            >
              Signaler l'utilisateur
            </AdminButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LogDetailsModal;

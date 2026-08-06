import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const PURGE_PRESETS = [7, 30, 90, 365];

const PurgeLogsModal = ({ isOpen, onClose, purgeDays, onPurgeDaysChange, onPurge }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
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
              {PURGE_PRESETS.map((d) => (
                <button
                  key={d}
                  onClick={() => onPurgeDaysChange(d)}
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
                onChange={(e) => onPurgeDaysChange(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              onClick={() => {
                if (window.confirm("⚠️ ATTENTION : Cette action supprimera TOUT l'historique, y compris les actions de ce jour. Confirmer ?")) {
                  onPurge(0);
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
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 dark:shadow-none transition-all"
              onClick={() => onPurge()}
            >
              Vider maintenant
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PurgeLogsModal;

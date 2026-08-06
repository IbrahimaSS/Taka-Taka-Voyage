import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw, XCircle, Download } from 'lucide-react';
import AdminButton from '../../ui/Bttn';

const EXPORT_OPTIONS = [
  { id: 'csv', name: 'Exporter en CSV', desc: 'Format tableur', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'word', name: 'Exporter en Word', desc: 'Document éditable', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'pdf', name: 'Exporter en PDF', desc: 'Document imprimable', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' }
];

const ActivityLogsFilterBar = ({
  filters,
  onFilterChange,
  onSearchSubmit,
  showFilters,
  onToggleFilters,
  onRefresh,
  loading,
  onOpenPurgeModal,
  showExportModal,
  onToggleExportModal,
  onExport,
  onResetFilters
}) => {
  return (
    <div className="glass-morphism p-4 rounded-2xl border border-white/20 dark:border-slate-800 shadow-xl overflow-visible">
      <div className="flex flex-col lg:flex-row gap-4">
        <form onSubmit={onSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur ou une action..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          />
        </form>

        <div className="flex gap-2">
          <AdminButton
            variant="outline"
            icon={Filter}
            onClick={onToggleFilters}
            className={showFilters ? 'bg-primary-50 border-primary-200' : ''}
          >
            Filtres
          </AdminButton>
          <AdminButton
            variant="outline"
            icon={RefreshCw}
            onClick={onRefresh}
            disabled={loading}
          >
            Actualiser
          </AdminButton>
          <AdminButton
            variant="outline"
            icon={XCircle}
            onClick={onOpenPurgeModal}
            className="text-rose-600 hover:bg-rose-50"
          >
            Vider
          </AdminButton>
          <div className="relative">
            <AdminButton
              variant="perso"
              icon={Download}
              onClick={onToggleExportModal}
            >
              Exporter
            </AdminButton>

            {/* Menu Popover */}
            {showExportModal && (
              <div className="absolute right-0 top-[110%] z-[60] w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 overflow-hidden ring-1 ring-slate-200">
                {EXPORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => onExport(opt.id)}
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
              onChange={(e) => onFilterChange({ ...filters, role: e.target.value })}
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
              onChange={(e) => onFilterChange({ ...filters, module: e.target.value })}
            >
              <option value="">Tous les modules</option>
              <option value="AUTH">Authentification (OTP, etc.)</option>
              <option value="CONNEXION">Connexion & Déconnexion</option>
              <option value="TRAJETS">Trajets & Courses</option>
              <option value="PAIEMENTS">Paiements & Portefeuille</option>
              <option value="UTILISATEURS">Gestion Utilisateurs</option>
              <option value="PROFIL">Mises à jour Profil</option>
              <option value="SYSTEME">Actions Système</option>
              <option value="SUPPORT">Support & Litiges</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date début</label>
            <input
              type="date"
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              value={filters.dateDebut}
              onChange={(e) => onFilterChange({ ...filters, dateDebut: e.target.value })}
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={filters.estSuspect}
                  onChange={(e) => onFilterChange({ ...filters, estSuspect: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Activités Suspectes</span>
              </label>
            </div>
            <button
              onClick={onResetFilters}
              className="min-h-11 px-2 text-primary-600 hover:bg-primary-50 rounded-lg text-sm font-bold transition-all"
            >
              Réinitialiser
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ActivityLogsFilterBar;

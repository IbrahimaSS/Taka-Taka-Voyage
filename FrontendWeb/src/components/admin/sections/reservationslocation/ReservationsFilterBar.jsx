import { Search } from 'lucide-react';

const ReservationsFilterBar = ({ searchTerm, onSearchChange, filterStatut, onFilterChange }) => {
  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Rechercher par client, véhicule, référence..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>
      <select
        value={filterStatut}
        onChange={e => onFilterChange(e.target.value)}
        className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="TOUS">Tous les statuts</option>
        <option value="EN_ATTENTE">En attente</option>
        <option value="APPROUVÉE">Approuvées</option>
        <option value="EN_COURS">En cours</option>
        <option value="TERMINÉE">Terminées</option>
        <option value="ANNULÉE">Annulées</option>
      </select>
    </div>
  );
};

export default ReservationsFilterBar;

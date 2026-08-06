import { Search } from 'lucide-react';

const GarageFilterBar = ({ searchTerm, onSearchChange, filterStatut, onFilterStatutChange }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher par immatriculation, marque..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm "
            value={filterStatut}
            onChange={(e) => onFilterStatutChange(e.target.value)}
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="DISPONIBLE">Disponibles</option>
            <option value="EN_LOCATION">En Location</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default GarageFilterBar;

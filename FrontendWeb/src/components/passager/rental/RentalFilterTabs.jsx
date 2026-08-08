import { Car } from 'lucide-react';

const RentalFilterTabs = ({ activeFilter, onFilterChange }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
        <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20">
          <Car className="w-6 h-6 text-white" />
        </div>
        Mes Locations
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Retrouvez l'historique de vos locations et gérez vos retours.</p>
    </div>

    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
      <button
        onClick={() => onFilterChange('all')}
        className={`min-h-[44px] px-4 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${activeFilter === 'all' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
      >
        Toutes
      </button>
      <button
        onClick={() => onFilterChange('active')}
        className={`min-h-[44px] px-4 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${activeFilter === 'active' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
      >
        Actives
      </button>
      <button
        onClick={() => onFilterChange('completed')}
        className={`min-h-[44px] px-4 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${activeFilter === 'completed' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
      >
        Terminées
      </button>
    </div>
  </div>
);

export default RentalFilterTabs;

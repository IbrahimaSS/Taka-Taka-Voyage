import { Search, Filter } from 'lucide-react';
import { CardHeader } from '../../ui/Card';

const GuidesFilterBar = ({ searchQuery, onSearchChange, categories, filterCategorie, onFilterChange }) => {
  return (
    <CardHeader className="border-b border-slate-100 dark:border-slate-800">
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un guide..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onFilterChange(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterCategorie === cat.id
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </CardHeader>
  );
};

export default GuidesFilterBar;

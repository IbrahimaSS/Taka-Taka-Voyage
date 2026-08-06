import { useState, useEffect } from 'react';
import { Car, Edit3, Trash2, Loader2 } from 'lucide-react';
import { getFullAssetURL } from '../../../../utils/urlHelper';
import { StatusBadge } from './GarageUI';

const VehiclesTable = ({ items, loading, onEdit, onDelete }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin mb-4" />
          <p className="text-slate-500 animate-pulse">Chargement de la flotte...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Car size={48} className="opacity-20 mb-4" />
          <p>Aucun véhicule ne correspond à votre recherche</p>
        </div>
      ) : isMobile ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {items.map((v) => (
            <div key={v._id} className="p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="h-12 w-16 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                  {v.photos?.[0] ? (
                    <img src={getFullAssetURL(v.photos[0])} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Car size={20} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 dark:text-white truncate">
                    {v.marque} {v.modele}
                  </p>
                  <p className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded inline-block mt-1">
                    {v.immatriculation}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEdit(v)}
                    className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(v._id)}
                    className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm pt-2 border-t border-slate-100 dark:border-slate-700">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs">Catégorie</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 inline-block mt-0.5">
                    {v.categorie}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs">Tarif/J</span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">
                    {new Intl.NumberFormat('fr-GN').format(v.prix_jour)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs">Statut</span>
                  <StatusBadge status={v.statut} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Véhicule</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Tarif (GNF/J)</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {items.map((v) => (
                <tr key={v._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-16 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                        {v.photos?.[0] ? (
                          <img src={getFullAssetURL(v.photos[0])} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Car size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {v.marque} {v.modele}
                        </p>
                        <p className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded inline-block mt-1">
                          {v.immatriculation}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {v.categorie}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-primary-600 dark:text-primary-400">
                      {new Intl.NumberFormat('fr-GN').format(v.prix_jour)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={v.statut} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(v)}
                        className="w-11 h-11 inline-flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(v._id)}
                        className="w-11 h-11 inline-flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VehiclesTable;

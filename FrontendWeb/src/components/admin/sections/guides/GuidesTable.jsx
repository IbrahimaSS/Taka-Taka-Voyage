import { useState, useEffect } from 'react';
import { FileText, Eye, Edit2, Trash2 } from 'lucide-react';
import { CardContent } from '../../ui/Card';
import Badge from '../../ui/Badge';

const GuidesTable = ({ guides, loading, categories, onEdit, onDelete }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse px-6 py-4">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    );
  }

  if (guides.length === 0) {
    return (
      <CardContent className="p-0">
        <div className="px-6 py-12 text-center">
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Aucun guide trouvé</p>
          </div>
        </div>
      </CardContent>
    );
  }

  if (isMobile) {
    return (
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {guides.map((guide) => (
            <div key={guide._id} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{guide.titre}</p>
                  <p className="text-xs text-slate-500 truncate">{guide.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={categories.find(c => c.id === guide.categorie)?.color || 'slate'}>
                  {guide.categorie}
                </Badge>
                {guide.actif ? (
                  <Badge variant="success" dot>Actif</Badge>
                ) : (
                  <Badge variant="slate" dot>Inactif</Badge>
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">Ordre : {guide.ordre}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => window.open(guide.fichierUrl, '_blank')}
                  className="w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                  title="Voir le PDF"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(guide)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(guide._id)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
              <th className="px-6 py-4">Document</th>
              <th className="px-6 py-4">Catégorie</th>
              <th className="px-6 py-4">Ordre</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {guides.map((guide) => (
              <tr key={guide._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[250px]">{guide.titre}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[250px]">{guide.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={categories.find(c => c.id === guide.categorie)?.color || 'slate'}>
                    {guide.categorie}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{guide.ordre}</span>
                </td>
                <td className="px-6 py-4">
                  {guide.actif ? (
                    <Badge variant="success" dot>Actif</Badge>
                  ) : (
                    <Badge variant="slate" dot>Inactif</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => window.open(guide.fichierUrl, '_blank')}
                      className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                      title="Voir le PDF"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(guide)}
                      className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(guide._id)}
                      className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  );
};

export default GuidesTable;

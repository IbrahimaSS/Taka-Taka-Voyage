import { useState, useEffect } from 'react';
import { RefreshCw, Database, History, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Button from '../../ui/Bttn';

const BackupHistoryTable = ({ backups, isLoading, isRestoring, confirmAction, onRefresh, onCreateClick, onTriggerRestore, onTriggerDelete }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 dark:text-gray-100 flex items-center">
            <History className="w-5 h-5 mr-3" />
            Historique des sauvegardes serveurs
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            icon={isLoading ? Loader2 : RefreshCw}
            iconClassName={isLoading ? "animate-spin" : ""}
            onClick={onRefresh}
          >
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400 animate-pulse">Chargement de l'historique...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-24 px-6">
            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Database className="w-10 h-10 text-gray-300 dark:text-gray-700" />
            </div>
            <h5 className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-2">Aucune sauvegarde locale</h5>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm">
              Commencez par créer votre première sauvegarde manuelle pour sécuriser vos configurations système.
            </p>
            <Button
              variant="outline"
              className="mt-8 border-dashed border-2 hover:border-blue-500 hover:text-blue-600 transition-all"
              icon={History}
              onClick={onCreateClick}
            >
              Créer un point de restauration
            </Button>
          </div>
        ) : isMobile ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {backups.map((backup) => (
              <div key={backup._id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{backup.nom}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(backup.createdAt), 'dd MMMM yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full shrink-0 ${backup.type === 'AUTOMATIQUE'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                    {backup.type}
                  </span>
                </div>
                <div className="flex justify-end gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => onTriggerRestore(backup._id, backup.nom)}
                    className="w-11 h-11 flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl transition-all"
                    title="Restaurer"
                    disabled={isRestoring}
                  >
                    <RefreshCw className={`w-4 h-4 ${isRestoring && confirmAction.id === backup._id ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => onTriggerDelete(backup._id, backup.nom)}
                    className="w-11 h-11 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nom de la sauvegarde</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Type</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {backups.map((backup) => (
                  <tr key={backup._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                          <Database className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{backup.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(backup.createdAt), 'dd MMMM yyyy HH:mm', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${backup.type === 'AUTOMATIQUE'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                        {backup.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onTriggerRestore(backup._id, backup.nom)}
                          className="w-11 h-11 inline-flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl transition-all hover:scale-110"
                          title="Restaurer"
                          disabled={isRestoring}
                        >
                          <RefreshCw className={`w-4 h-4 ${isRestoring && confirmAction.id === backup._id ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => onTriggerDelete(backup._id, backup.nom)}
                          className="w-11 h-11 inline-flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-all hover:scale-110"
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
        )}
      </CardContent>
    </Card>
  );
};

export default BackupHistoryTable;

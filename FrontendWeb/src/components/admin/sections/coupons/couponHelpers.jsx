export const getStatusBadge = (statut) => {
  switch (statut) {
    case 'ACTIF': return <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold shadow-sm">ACTIF</span>;
    case 'EXPIRE': return <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold shadow-sm">EXPIRÉ</span>;
    case 'INACTIF': return <span className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs font-bold shadow-sm">DÉSACTIVÉ</span>;
    default: return null;
  }
};

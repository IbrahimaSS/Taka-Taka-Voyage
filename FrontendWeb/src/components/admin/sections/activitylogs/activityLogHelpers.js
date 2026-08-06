export const getRoleBadge = (role) => {
  const styles = {
    ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    CHAUFFEUR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    PASSAGER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    SYSTEME: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    VISITEUR: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
  };
  return styles[role] || 'bg-gray-100 text-gray-600';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

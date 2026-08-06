export const getStatusBadge = (status, t) => {
  const config = {
    'ACTIF': { label: t('common.active') || 'Actif', bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' },
    'INACTIF': { label: t('common.inactive') || 'Inactif', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500 dark:text-red-400', dot: 'bg-red-400' },
    'SUSPENDU': { label: t('common.suspended') || 'Suspendu', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' }
  };
  const { label, bg, text, dot } = config[status] || config.INACTIF;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dot}`}></span>
      {label}
    </span>
  );
};

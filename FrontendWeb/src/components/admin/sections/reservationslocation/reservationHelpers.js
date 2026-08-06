export const statutColors = {
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  APPROUVÉE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  EN_COURS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  TERMINÉE: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  ANNULÉE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LITIGE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export const statutLabels = {
  EN_ATTENTE: '🟡 En attente',
  APPROUVÉE: '🟢 Approuvée',
  EN_COURS: '🔵 En cours',
  TERMINÉE: '⚪ Terminée',
  ANNULÉE: '🔴 Annulée',
  LITIGE: '🟠 Litige',
};

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export const formatPrix = (prix) => new Intl.NumberFormat('fr-GN').format(prix || 0);

export const isLate = (reservation) => {
  if (reservation.statut !== 'EN_COURS' && reservation.statut !== 'RETOUR_SIGNALÉ') return false;
  const now = new Date();
  const dateFin = new Date(reservation.date_fin_prevue);
  return now > dateFin;
};

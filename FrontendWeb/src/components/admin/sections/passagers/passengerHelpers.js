import { getFullAssetURL } from '../../../../utils/urlHelper';

export const getAvatarUrl = (path) => getFullAssetURL(path);

export const getTimeAgo = (dateString, t) => {
  if (!dateString) return t('common.never') || 'Jamais';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t('common.today') || "Aujourd'hui";
  if (diffDays === 1) return t('common.yesterday') || 'Hier';
  if (diffDays < 7) return t('common.days_ago', { count: diffDays }) || `Il y a ${diffDays} jours`;
  if (diffDays < 30) return t('common.weeks_ago', { count: Math.floor(diffDays / 7) }) || `Il y a ${Math.floor(diffDays / 7)} semaines`;
  return t('common.months_ago', { count: Math.floor(diffDays / 30) }) || `Il y a ${Math.floor(diffDays / 30)} mois`;
};

import { getFullAssetURL } from '../../../../utils/urlHelper';

export const formatDate = (dateString, language = 'fr', t = (k, d) => d) => {
  if (!dateString) return t('common.not_available') || 'Non disponible';
  const date = new Date(dateString);
  return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').filter(Boolean).map(n => n[0]?.toUpperCase()).join('');
};

export const getAvatarUrl = (path) => getFullAssetURL(path);

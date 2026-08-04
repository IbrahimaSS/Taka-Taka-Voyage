import { getFullAssetURL } from '../../../../utils/urlHelper';

export const getAvatarUrl = (path) => getFullAssetURL(path);

export const getUserAvatarInitials = (person) => {
  if (!person) return '?';
  if (person.firstName || person.lastName) {
    return `${person.firstName?.charAt(0) || ''}${person.lastName?.charAt(0) || ''}`.toUpperCase() || '?';
  }
  if (person.name) {
    const parts = person.name.split(' ');
    if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    return person.name.charAt(0).toUpperCase();
  }
  return '?';
};

import { useState } from 'react';
import { getFullAssetURL } from '../../../../utils/urlHelper';

const Avatar = ({ name, photoUrl, type = 'passenger', size = 'w-8 h-8', className = 'mr-2' }) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (n) => {
    if (!n) return '?';
    const parts = n.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);
  const bgColor = type === 'driver' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600';

  const getFullFileUrl = (path) => getFullAssetURL(path);

  if (photoUrl && !imageError) {
    return (
      <img
        src={getFullFileUrl(photoUrl)}
        alt={name}
        className={`${size} rounded-full object-cover ${className} border border-gray-200 dark:border-gray-700`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${size} rounded-full ${bgColor} flex items-center justify-center ${className} text-xs font-bold border border-white dark:border-gray-800 shadow-sm`}>
      {initials}
    </div>
  );
};

export default Avatar;

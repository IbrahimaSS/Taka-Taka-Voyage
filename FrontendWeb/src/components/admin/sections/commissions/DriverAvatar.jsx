import { getFullAssetURL } from '../../../../utils/urlHelper';

// Helper pour l'avatar chauffeur (photo ou acronyme)
const DriverAvatar = ({ photo, nom, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-12 h-12 text-sm';
  const acronym = nom ? nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  if (photo) {
    const photoUrl = getFullAssetURL(photo);
    return (
      <div className={`${sizeClasses} rounded-full shadow-sm relative flex-shrink-0`}>
        <img
          src={photoUrl}
          alt={nom}
          className={`${sizeClasses} rounded-full object-cover border-2 border-white dark:border-gray-700`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div
          className={`${sizeClasses} rounded-full bg-gradient-to-br from-green-500 to-blue-700 items-center justify-center absolute inset-0`}
          style={{ display: 'none' }}
        >
          <span className="text-white font-bold">{acronym}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-green-500 to-blue-700 flex items-center justify-center shadow-sm flex-shrink-0`}>
      <span className="text-white font-bold">{acronym}</span>
    </div>
  );
};

export default DriverAvatar;

import { useTranslation } from 'react-i18next';
import { User, Camera, Calendar, Star, CheckCircle } from 'lucide-react';
import Badge from '../../admin/ui/Badge';

const formatDate = (dateString, language) => {
  if (!dateString) return 'Janvier 2025';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return 'Janvier 2025';
  }
};

const ProfileAvatarCard = ({
  profileData, setProfileData, isEditing, user, passenger,
  fileInputRef, onImageUpload, getImageUrl,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-center sm:space-x-6 space-y-4 sm:space-y-0 mb-8 text-center sm:text-left">
      <div className="relative shrink-0">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-green-100 to-blue-200 dark:from-green-900/40 dark:to-blue-900/40 flex items-center justify-center shadow-lg overflow-hidden">
          {profileData.avatar ? (
            <img src={getImageUrl(profileData.avatar)} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-12 h-12 sm:w-16 sm:h-16 text-blue-700 dark:text-blue-300" />
          )}
        </div>
        {isEditing && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 w-11 h-11 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors"
              title={t('common.change_logo')}
            >
              <Camera className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 mb-4">
          {isEditing ? (
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-green-500 focus:outline-none text-center sm:text-left"
            />
          ) : (
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{profileData.name}</h3>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" size="xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t('profile.verification.email')}
            </Badge>
            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" size="xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t('profile.verification.phone')}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4 mr-2 text-green-600" />
            {t('profile.info.since', { date: formatDate(user?.createdAt || passenger?.membreDepuis, i18n.language) })}
          </div>
          <div className="flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-300">
            <Star className="w-4 h-4 mr-2 text-amber-600" />
            {t('profile.info.rating', { rating: profileData.rating })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAvatarCard;

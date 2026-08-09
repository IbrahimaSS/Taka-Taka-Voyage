import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';

const ProfilePersonalInfoForm = ({ profileData, setProfileData, isEditing }) => {
  const { t } = useTranslation();

  return (
    <Card hoverable={false} className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle size="lg">{t('profile.personal_info.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">{t('profile.personal_info.firstname')}</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.prenom}
                onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
              />
            ) : (
              <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 font-medium break-words">
                {profileData.prenom}
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">{t('profile.personal_info.lastname')}</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.nom}
                onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
              />
            ) : (
              <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 font-medium break-words">
                {profileData.nom}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">{t('profile.personal_info.phone')}</label>
            <div className="relative">
              {isEditing ? (
                <input
                  type="tel"
                  inputMode="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition pl-12"
                />
              ) : (
                <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 font-medium pl-12 break-words">
                  {profileData.phone}
                </div>
              )}
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">{t('profile.personal_info.email')}</label>
            <div className="relative">
              {isEditing ? (
                <input
                  type="email"
                  inputMode="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition pl-12"
                />
              ) : (
                <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 font-medium pl-12 break-all">
                  {profileData.email}
                </div>
              )}
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">{t('profile.personal_info.location')}</label>
            <div className="relative">
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.localisation || ''}
                  onChange={(e) => setProfileData({ ...profileData, localisation: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition pl-12"
                  placeholder={t('profile.personal_info.location_placeholder')}
                />
              ) : (
                <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 font-medium pl-12 break-words">
                  {profileData.localisation || t('profile.personal_info.no_location')}
                </div>
              )}
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePersonalInfoForm;

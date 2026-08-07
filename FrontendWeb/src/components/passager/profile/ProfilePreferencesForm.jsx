import { useTranslation } from 'react-i18next';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';
import Switch from '../../admin/ui/Switch';

const ProfilePreferencesForm = ({ profileData, setProfileData }) => {
  const { t } = useTranslation();

  return (
    <Card hoverable={false} className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle size="lg">{t('profile.preferences.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 transition-colors cursor-pointer">
          <Switch
            checked={profileData.preferences?.silentRide || false}
            onChange={(e) => setProfileData({
              ...profileData,
              preferences: { ...profileData.preferences, silentRide: e.target.checked }
            })}
          />
          <div className="ml-4">
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('profile.preferences.silent_ride')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.preferences.silent_ride_desc')}</p>
          </div>
        </label>

        <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 transition-colors cursor-pointer">
          <Switch
            checked={profileData.preferences?.luggageHelp || true}
            onChange={(e) => setProfileData({
              ...profileData,
              preferences: { ...profileData.preferences, luggageHelp: e.target.checked }
            })}
          />
          <div className="ml-4">
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('profile.preferences.luggage_help')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.preferences.luggage_help_desc')}</p>
          </div>
        </label>

        <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 transition-colors cursor-pointer">
          <Switch
            checked={profileData.preferences?.experiencedDriver || false}
            onChange={(e) => setProfileData({
              ...profileData,
              preferences: { ...profileData.preferences, experiencedDriver: e.target.checked }
            })}
          />
          <div className="ml-4">
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('profile.preferences.experienced_driver')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.preferences.experienced_driver_desc')}</p>
          </div>
        </label>
      </CardContent>
    </Card>
  );
};

export default ProfilePreferencesForm;

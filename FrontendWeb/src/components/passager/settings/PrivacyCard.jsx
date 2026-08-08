import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';
import Switch from '../../admin/ui/Switch';

const PrivacyCard = ({ privacy, onToggle }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-500 mr-3" />
          <CardTitle>{t('passenger_settings.privacy')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.public_profile')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.public_profile_desc')}</p>
          </div>
          <Switch
            checked={privacy.publicProfile}
            onChange={() => onToggle('privacy', 'publicProfile')}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.location_sharing')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.location_sharing_desc')}</p>
          </div>
          <Switch
            checked={privacy.locationSharing}
            onChange={() => onToggle('privacy', 'locationSharing')}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.anonymous_history')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.anonymous_history_desc')}</p>
          </div>
          <Switch
            checked={privacy.anonymousHistory}
            onChange={() => onToggle('privacy', 'anonymousHistory')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacyCard;

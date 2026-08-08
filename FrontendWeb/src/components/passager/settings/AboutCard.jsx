import { useTranslation } from 'react-i18next';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';

const AboutCard = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('passenger_settings.about')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl border border-green-100 dark:border-green-800/30 shadow-sm">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Taka Taka Version 1.0</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Build 2024.12.01</p>
        </div>
        <div className="space-y-2">
          <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.privacy_policy')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.privacy_policy_desc')}</p>
          </button>
          <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.terms_of_service')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.terms_of_service_desc')}</p>
          </button>
          <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.help_center')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.help_center_desc')}</p>
          </button>
          <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.legal_notices')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.legal_notices_desc')}</p>
          </button>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.all_rights_reserved')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('passenger_settings.compliant')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutCard;

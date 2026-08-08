import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';
import Switch from '../../admin/ui/Switch';

const NotificationsCard = ({ notifications, onToggle }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Bell className="w-6 h-6 text-green-600 dark:text-green-500 mr-3" />
          <CardTitle>{t('passenger_settings.notifications')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.trip_notifications')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.trip_notifications_desc')}</p>
          </div>
          <Switch
            checked={notifications.tripUpdates}
            onChange={() => onToggle('notifications', 'tripUpdates')}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.promo_notifications')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.promo_notifications_desc')}</p>
          </div>
          <Switch
            checked={notifications.promotions}
            onChange={() => onToggle('notifications', 'promotions')}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.sms_notifications')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.sms_notifications_desc')}</p>
          </div>
          <Switch
            checked={notifications.sms}
            onChange={() => onToggle('notifications', 'sms')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;

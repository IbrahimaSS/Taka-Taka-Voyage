import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Smartphone, Mail, Bell } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Switch from '../ui/Switch';

const NotificationsSettings = ({ settings, updateSetting }) => {
  const { t } = useTranslation();
  const notificationChannels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'green',
      description: t('settings.whatsapp_notif')
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: Smartphone,
      color: 'blue',
      description: t('settings.sms_notif')
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'purple',
      description: t('settings.email_notif')
    },
    {
      id: 'push',
      name: t('common.push_notification'),
      icon: Bell,
      color: 'orange',
      description: t('settings.push_notif')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Canaux de notification */}
      <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-blue-100 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            {t('settings.notification_channels')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {notificationChannels.map(channel => {
              const Icon = channel.icon;
              const channelSettings = settings.notifications?.channels?.[channel.id] || { enabled: false };

              return (
                <div key={channel.id} className="flex items-center justify-between p-4 border-2 border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg bg-${channel.color}-100 flex items-center justify-center`}>
                      <Icon className={`text-${channel.color}-600 w-5 h-5`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-100">{channel.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{channel.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={channelSettings.enabled}
                    onChange={() => updateSetting(`notifications.channels.${channel.id}.enabled`, !channelSettings.enabled)}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Types de notifications */}
      <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-teal-100 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            {t('settings.notification_types')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 'ride_created', label: t('notif.ride_created'), description: t('notif.ride_created_desc') },
              { id: 'ride_accepted', label: t('notif.ride_accepted'), description: t('notif.ride_accepted_desc') },
              { id: 'ride_completed', label: t('notif.ride_completed'), description: t('notif.ride_completed_desc') },
              { id: 'payment_received', label: t('notif.payment_received'), description: t('notif.payment_received_desc') },
              { id: 'promotion', label: t('notif.promotion'), description: t('notif.promotion_desc') },
              { id: 'system', label: t('notif.system'), description: t('notif.system_desc') },
            ].map((type, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-800 rounded-xl hover:border-teal-300 transition-all">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{type.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{type.description}</p>
                </div>
                <Switch
                  checked={settings.notifications?.types?.[type.id] || false}
                  onChange={() => {
                    const current = settings.notifications?.types?.[type.id] || false;
                    updateSetting(`notifications.types.${type.id}`, !current);
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default NotificationsSettings;
// src/components/settings/components/NotificationsSettings.jsx
import React from 'react';
import { MessageCircle, Smartphone, Mail, Bell, Globe } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Switch from '../ui/Switch';
import Button from '../ui/Bttn';

const NotificationsSettings = ({ settings, updateSetting, updateNestedSetting, showToast }) => {
  const notificationChannels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'green',
      description: 'Envoyer des notifications via WhatsApp'
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: Smartphone,
      color: 'blue',
      description: 'Envoyer des notifications par SMS'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'purple',
      description: 'Envoyer des notifications par email'
    },
    {
      id: 'push',
      name: 'Notification Push',
      icon: Bell,
      color: 'orange',
      description: 'Envoyer des notifications push dans l\'application'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Canaux de notification */}
      <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-blue-100 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Canaux de notification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {notificationChannels.map(channel => {
              const Icon = channel.icon;
              const channelSettings = settings.notifications?.[channel.id] || { enabled: false };
              
              return (
                <Card key={channel.id} className="border-2 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:border-gray-700 transition-all duration-300">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-lg bg-${channel.color}-100 flex items-center justify-center`}>
                          <Icon className={`text-${channel.color}-600 w-5 h-5`} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-100">{channel.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{channel.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={channelSettings.enabled}
                        onChange={() => updateNestedSetting('notifications', channel.id, 'enabled', !channelSettings.enabled)}
                      />
                    </div>
                    
                    
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Types de notifications */}
      <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-teal-100 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-gray-5` flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Types de notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 'ride_created', label: 'Nouvelle course', description: 'Notifier lors d\'une nouvelle course' },
              { id: 'ride_accepted', label: 'Course acceptée', description: 'Notifier quand un chauffeur accepte une course' },
              { id: 'ride_completed', label: 'Course terminée', description: 'Notifier quand une course est terminée' },
              { id: 'payment_received', label: 'Paiement reçu', description: 'Notifier lors d\'un paiement reçu' },
              { id: 'promotion', label: 'Promotions', description: 'Envoyer des notifications promotionnelles' },
              { id: 'system', label: 'Système', description: 'Notifications système et de maintenance' },
            ].map((type, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-800 rounded-xl hover:border-teal-300 transition-all">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{type.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{type.description}</p>
                </div>
                <Switch
                  checked={settings.notificationTypes?.[type.id] || false}
                  onChange={() => {
                    const current = settings.notificationTypes?.[type.id] || false;
                    updateNestedSetting('notificationTypes', type.id, !current);
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
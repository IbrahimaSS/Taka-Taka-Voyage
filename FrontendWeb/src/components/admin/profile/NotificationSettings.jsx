// src/components/profile/components/NotificationSettings.jsx
import React, { useState } from 'react';
import { Mail, Bell, Smartphone, Shield, BellOff } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Switch from '../ui/Switch';
import Button from '../ui/Bttn';

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,

    securityAlerts: true
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleToggleAll = (enable) => {
    const newState = {};
    Object.keys(notifications).forEach(key => {
      newState[key] = enable;
    });
    setNotifications(newState);
  };

  return (
    <Card hoverable className="border-2 border-gray-100 dark:border-gray-900 hover:border-purple-100 transition-all duration-300">
      <CardHeader>
        <CardTitle>Préférences de notification</CardTitle>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Contrôlez comment et quand vous recevez des notifications</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 text-lg">Canaux de notification</h4>
            <div className="space-y-4">
              {[
                {
                  key: 'emailNotifications',
                  label: 'Notifications par email',
                  description: 'Recevez des notifications importantes par email',
                  icon: Mail
                },
                {
                  key: 'pushNotifications',
                  label: 'Notifications push',
                  description: 'Recevez des notifications sur votre appareil',
                  icon: Bell
                },
                {
                  key: 'smsNotifications',
                  label: 'Notifications SMS',
                  description: 'Recevez des notifications par SMS',
                  icon: Smartphone
                },

                {
                  key: 'securityAlerts',
                  label: 'Alertes de sécurité',
                  description: 'Recevez des alertes pour les activités suspectes',
                  icon: Shield
                }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 border-2 border-gray-100 dark:border-gray-900 rounded-xl hover:border-gray-200 dark:border-gray-900 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <item.icon className="text-purple-500 w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onChange={() => handleNotificationChange(item.key)}
                    size="lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="secondary" icon={BellOff} onClick={() => handleToggleAll(false)}>
          Tout désactiver
        </Button>
        <Button
          variant="perso"
          icon={Bell}
          onClick={() => handleToggleAll(true)}
        >
          Tout activer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;
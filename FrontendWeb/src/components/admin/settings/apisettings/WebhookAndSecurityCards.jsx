import { Webhook, Shield } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import Switch from '../../ui/Switch';

const WebhookAndSecurityCards = ({ t, settings, updateNestedSetting }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Webhooks */}
      <Card hoverable className="border-2 border-gray-100 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <Webhook className="w-5 h-5 mr-2" />
            {t('api.webhooks')}
          </CardTitle>
          <CardDescription>
            {t('api.webhook_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('api.webhook_url')}
            </label>
            <input
              type="url"
              value={settings.api?.webhooks?.url || ''}
              onChange={(e) => updateNestedSetting('api', 'webhooks', 'url', e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="https://votre-serveur.com/webhook"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">
              {t('api.events_to_notify')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'ride.created', label: t('notif.ride_created') },
                { id: 'payment.received', label: t('notif.payment_received') },
                { id: 'driver.online', label: t('api.driver_online') },
                { id: 'driver.offline', label: t('api.driver_offline') },
                { id: 'user.registered', label: t('api.user_registered') },
                { id: 'review.submitted', label: t('api.review_submitted') },
              ].map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{event.label}</span>
                  <Switch
                    size="sm"
                    checked={settings.api?.webhooks?.events?.[event.id] || false}
                    onChange={() => updateNestedSetting('api', 'webhooks', 'events', {
                      ...settings.api?.webhooks?.events,
                      [event.id]: !settings.api?.webhooks?.events?.[event.id]
                    })}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sécurité API */}
      <Card hoverable className="border-2 border-gray-100 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            {t('api.api_security')}
          </CardTitle>
          <CardDescription>
            {t('api.security_recommendations')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('api.cors_domains')}
            </label>
            <p className="text-xs text-gray-500 mb-2">{t('api.cors_domains_desc')}</p>
            <textarea
              value={settings.api?.security?.corsDomains || ''}
              onChange={(e) => updateNestedSetting('api', 'security', 'corsDomains', e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all font-mono text-xs"
              rows="3"
              placeholder="https://votre-app.com"
            />
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">{t('api.security_recommendations')}</h4>
            <ul className="space-y-3">
              {[
                t('api.rec_regen_keys'),
                t('api.rec_env_vars'),
                t('api.rec_limit_cors'),
                t('api.rec_2fa'),
              ].map((rec, i) => (
                <li key={i} className="flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookAndSecurityCards;

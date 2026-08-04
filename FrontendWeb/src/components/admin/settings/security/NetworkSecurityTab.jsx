import { useTranslation } from 'react-i18next';
import { Globe, AlertTriangle, Ban } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Switch from '../../ui/Switch';
import Slider from '../../ui/Slider';

const NetworkSecurityTab = ({ settings, updateNestedSetting }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            {t('security.cors_config')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.restrict_origins')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.restrict_origins_desc')}</p>
            </div>
            <Switch
              checked={settings.security?.cors?.enabled || false}
              onChange={() => updateNestedSetting('security', 'cors', 'enabled',
                !settings.security?.cors?.enabled
              )}
            />
          </div>

          {settings.security?.cors?.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('security.allowed_origins')}
              </label>
              <textarea
                value={(settings.security.cors.allowedOrigins || []).join('\n')}
                onChange={(e) => {
                  const origins = e.target.value.split('\n').filter(origin => origin.trim());
                  updateNestedSetting('security', 'cors', 'allowedOrigins', origins);
                }}
                rows="4"
                className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-mono text-sm"
                placeholder="https://app.takataka.com\nhttps://admin.takataka.com"
              />
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  • Utilisez * pour autoriser tous les sous-domaines : https://*.takataka.com
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  • Spécifiez le protocole (http:// ou https://)
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('security.allowed_headers')}
              </label>
              <input
                type="text"
                value={settings.security?.cors?.allowedHeaders || 'Content-Type, Authorization'}
                onChange={(e) => updateNestedSetting('security', 'cors', 'allowedHeaders', e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('security.allowed_methods')}
              </label>
              <input
                type="text"
                value={settings.security?.cors?.allowedMethods || 'GET, POST, PUT, DELETE, OPTIONS'}
                onChange={(e) => updateNestedSetting('security', 'cors', 'allowedMethods', e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-orange-100">
        <CardHeader>
          <CardTitle className="text-orange-800 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {t('security.rate_limiting')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.activate_limiting')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.activate_limiting_desc')}</p>
            </div>
            <Switch
              checked={settings.security?.rateLimiting?.enabled || false}
              onChange={() => updateNestedSetting('security', 'rateLimiting', 'enabled',
                !settings.security?.rateLimiting?.enabled
              )}
            />
          </div>

          {settings.security?.rateLimiting?.enabled && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('security.public_api_limit')}
                </label>
                <div className="flex items-center space-x-4">
                  <Slider
                    min="10"
                    max="500"
                    step="10"
                    value={settings.security.rateLimiting.publicRequestsPerMinute || 100}
                    onChange={(value) => updateNestedSetting('security', 'rateLimiting', 'publicRequestsPerMinute', value)}
                  />
                  <span className="w-20 text-right font-bold text-orange-700">
                    {settings.security.rateLimiting.publicRequestsPerMinute || 100}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('security.public_api_tip')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('security.private_api_limit')}
                </label>
                <div className="flex items-center space-x-4">
                  <Slider
                    min="50"
                    max="1000"
                    step="50"
                    value={settings.security.rateLimiting.privateRequestsPerMinute || 300}
                    onChange={(value) => updateNestedSetting('security', 'rateLimiting', 'privateRequestsPerMinute', value)}
                  />
                  <span className="w-20 text-right font-bold text-orange-700">
                    {settings.security.rateLimiting.privateRequestsPerMinute || 300}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('security.private_api_tip')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('security.block_duration')}
                </label>
                <div className="flex items-center space-x-4">
                  <Slider
                    min="1"
                    max="60"
                    value={settings.security.rateLimiting.blockDuration || 15}
                    onChange={(value) => updateNestedSetting('security', 'rateLimiting', 'blockDuration', value)}
                  />
                  <span className="w-20 text-right font-bold text-red-700">
                    {settings.security.rateLimiting.blockDuration || 15} min
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {t('security.block_duration_desc')}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">{t('common.exclusions')}</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.security.rateLimiting.excludeWebhooks || false}
                      onChange={(e) => updateNestedSetting('security', 'rateLimiting', 'excludeWebhooks', e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">{t('security.exclude_webhooks') || 'Exclure les webhooks'}</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.security.rateLimiting.excludeHealthCheck || true}
                      onChange={(e) => updateNestedSetting('security', 'rateLimiting', 'excludeHealthCheck', e.target.checked)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">{t('security.exclude_health') || 'Exclure les checks de santé'}</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-red-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Ban className="text-red-600 w-5 h-5" />
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">Protection DDoS</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Protection contre les attaques par déni de service</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('security.req_threshold_sec') || 'Seuil de requêtes (par seconde)'}
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={settings.security?.ddosProtection?.threshold || 100}
                  onChange={(e) => updateNestedSetting('security', 'ddosProtection', 'threshold',
                    parseInt(e.target.value) || 100
                  )}
                  className="flex-1 border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                />
                <span className="ml-3 text-gray-600 dark:text-gray-300">req/s</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('security.ddos_block_duration') || 'Durée de blocage DDoS'}
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={settings.security?.ddosProtection?.blockDuration || 60}
                  onChange={(e) => updateNestedSetting('security', 'ddosProtection', 'blockDuration',
                    parseInt(e.target.value) || 60
                  )}
                  className="flex-1 border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                />
                <span className="ml-3 text-gray-600 dark:text-gray-300">minutes</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-2">
            <input
              type="checkbox"
              id="enable_ddos"
              checked={settings.security?.ddosProtection?.enabled || false}
              onChange={(e) => updateNestedSetting('security', 'ddosProtection', 'enabled', e.target.checked)}
              className="rounded text-red-600"
            />
            <label htmlFor="enable_ddos" className="text-sm text-gray-700 dark:text-gray-200">
              {t('security.activate_auto_ddos') || 'Activer la protection DDoS automatique'}
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkSecurityTab;

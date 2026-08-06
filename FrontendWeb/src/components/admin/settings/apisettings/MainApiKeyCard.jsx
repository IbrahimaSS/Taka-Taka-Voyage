import { Key, Eye, EyeOff, Copy, Check } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Button from '../../ui/Bttn';
import Badge from '../../ui/Badge';

const MainApiKeyCard = ({ t, settings, updateNestedSetting, showApiKeys, copiedKey, toggleKeyVisibility, onCopyApiKey, onGenerateApiKey }) => {
  return (
    <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-blue-100 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center">
          <Key className="w-5 h-5 mr-2" />
          {t('api.main_key')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">{t('api.platform_key')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {t('api.platform_key_desc')}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 min-w-[300px]">
                <div className="flex items-center justify-between">
                  <code className="text-gray-800 dark:text-gray-100 font-mono text-sm truncate">
                    {showApiKeys.main
                      ? settings.api?.takataka?.apiKey || 'ttk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
                      : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <div className="flex items-center space-x-1 ml-4">
                    <button
                      onClick={() => toggleKeyVisibility('main')}
                      className="w-11 h-11 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300"
                      aria-label="Afficher/Masquer la clé"
                    >
                      {showApiKeys.main ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onCopyApiKey('main', settings.api?.takataka?.apiKey)}
                      className="w-11 h-11 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300"
                      aria-label="Copier la clé"
                    >
                      {copiedKey === 'main' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                className="bg-gradient-to-r from-blue-700 to-teal-700"
                onClick={onGenerateApiKey}
              >
                {t('common.generate')}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('api.rate_limit')}</p>
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  value={settings.api?.takataka?.rateLimit || 100}
                  onChange={(e) => updateNestedSetting('api', 'takataka', 'rateLimit', e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-bold text-lg text-blue-600"
                />
                <span className="text-xs text-gray-400 ml-2">req/min</span>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('api.token_expiry')}</p>
              <div className="flex items-center">
                <select
                  value={settings.api?.takataka?.tokenExpiry || '24h'}
                  onChange={(e) => updateNestedSetting('api', 'takataka', 'tokenExpiry', e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-bold text-lg text-teal-600"
                >
                  <option value="1h">1 {t('common.hours')}</option>
                  <option value="24h">24 {t('common.hours')}</option>
                  <option value="7d">7 {t('common.days')}</option>
                  <option value="30d">30 {t('common.days')}</option>
                  <option value="never">{t('common.never')}</option>
                </select>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('api.version')}</p>
              <div className="flex items-center">
                <span className="font-bold text-lg text-gray-800 dark:text-gray-100">v2.1.0</span>
                <Badge variant="outline" className="ml-auto text-[10px] py-0">{t('common.stable')}</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MainApiKeyCard;

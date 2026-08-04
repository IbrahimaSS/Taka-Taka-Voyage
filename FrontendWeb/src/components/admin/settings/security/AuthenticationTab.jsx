import { useTranslation } from 'react-i18next';
import { UserCheck, Lock, Clock, Shield } from 'lucide-react';
import Card, { CardContent } from '../../ui/Card';
import Switch from '../../ui/Switch';
import Badge from '../../ui/Badge';
import Slider from '../../ui/Slider';

const AuthenticationTab = ({ settings, updateNestedSetting }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <UserCheck className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100">{t('security.phone_verification')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.phone_verification_desc')}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {settings.security?.authentication?.requirePhoneVerification
                  ? t('security.mandatory_all')
                  : t('common.optional')}
              </span>
              <Switch
                checked={settings.security?.authentication?.requirePhoneVerification || false}
                onChange={() => updateNestedSetting('security', 'authentication', 'requirePhoneVerification',
                  !settings.security?.authentication?.requirePhoneVerification
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Lock className="text-green-600 w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100">{t('security.admin_2fa')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.admin_2fa_desc')}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {settings.security?.authentication?.twoFactorEnabled
                  ? t('security._2fa_enabled_admin')
                  : t('common.disabled')}
              </span>
              <Switch
                checked={settings.security?.authentication?.twoFactorEnabled || false}
                onChange={() => updateNestedSetting('security', 'authentication', 'twoFactorEnabled',
                  !settings.security?.authentication?.twoFactorEnabled
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">{t('security.session_config')}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.session_config_desc')}</p>
            </div>
            <Clock className="text-purple-600 w-5 h-5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('security.session_timeout')}
              </label>
              <div className="flex items-center space-x-3">
                <Slider
                  min="5"
                  max="480"
                  step="5"
                  value={settings.security?.authentication?.sessionTimeout || 30}
                  onChange={(value) => updateNestedSetting('security', 'authentication', 'sessionTimeout', value)}
                />
                <span className="w-16 text-right font-medium text-purple-700">
                  {settings.security?.authentication?.sessionTimeout || 30} min
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('security.after_inactivity')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('security.concurrent_sessions')}
              </label>
              <select
                value={settings.security?.authentication?.maxConcurrentSessions || 'unlimited'}
                onChange={(e) => updateNestedSetting('security', 'authentication', 'maxConcurrentSessions', e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
              >
                <option value="1">1 {t('common.device')}</option>
                <option value="3">3 {t('common.devices_max')}</option>
                <option value="5">5 {t('common.devices_max')}</option>
                <option value="unlimited">{t('common.unlimited')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('security.pwd_expiry')}
              </label>
              <select
                value={settings.security?.authentication?.passwordExpiry || 'never'}
                onChange={(e) => updateNestedSetting('security', 'authentication', 'passwordExpiry', e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
              >
                <option value="30">30 {t('common.days')}</option>
                <option value="60">60 {t('common.days')}</option>
                <option value="90">90 {t('common.days')}</option>
                <option value="180">6 {t('common.months')}</option>
                <option value="never">{t('common.never')}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-yellow-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">{t('security.pwd_complexity')}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.pwd_complexity_desc')}</p>
            </div>
            <Shield className="text-yellow-600 w-5 h-5" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.min_length_8')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.min_length_desc')}</p>
              </div>
              <Badge variant="success">{t('common.active')}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.breach_check')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.breach_check_desc')}</p>
              </div>
              <Switch
                checked={settings.security?.authentication?.checkBreachedPasswords || true}
                onChange={() => updateNestedSetting('security', 'authentication', 'checkBreachedPasswords',
                  !settings.security?.authentication?.checkBreachedPasswords
                )}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.pwd_history')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.pwd_history_desc')}</p>
              </div>
              <Switch
                checked={settings.security?.authentication?.passwordHistory || true}
                onChange={() => updateNestedSetting('security', 'authentication', 'passwordHistory',
                  !settings.security?.authentication?.passwordHistory
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthenticationTab;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Smartphone, MessageSquare, Hash, Key, Zap, Bell, Eye, EyeOff } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Switch from '../ui/Switch';
import Button from '../ui/Bttn';
import Badge from '../ui/Badge';

const SmsUssdSettings = ({ settings, updateNestedSetting, showToast }) => {
  const { t } = useTranslation();
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="space-y-8">
      {/* Configuration SMS */}
      <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-blue-100 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            {t('sms.service_title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">{t('sms.activate_service')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('sms.activate_desc')}</p>
            </div>
            <Switch
              checked={settings.smsUssd?.enabled || false}
              onChange={() => updateNestedSetting('smsUssd', 'enabled',
                !settings.smsUssd?.enabled
              )}
            />
          </div>

          {settings.smsUssd?.enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('sms.short_code')}
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <input
                      type="text"
                      value={settings.smsUssd?.shortCode || '8000'}
                      onChange={(e) => updateNestedSetting('smsUssd', 'shortCode', e.target.value)}
                      className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500"
                      placeholder="8000"
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('sms.short_code_desc')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('sms.sender_id')}
                  </label>
                  <input
                    type="text"
                    value={settings.smsUssd?.senderId || 'TAKATAKA'}
                    onChange={(e) => updateNestedSetting('smsUssd', 'senderId', e.target.value)}
                    className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="TAKATAKA"
                    maxLength="11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('sms.africastalking_key')}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.smsUssd?.apiKey || ''}
                    onChange={(e) => updateNestedSetting('smsUssd', 'apiKey', e.target.value)}
                    className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-10 py-3 outline-none focus:border-blue-500"
                    placeholder={t('common.enter_your_key')}
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300"
                  >
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => showToast(t('common.test'), t('sms.test_sending_msg'), 'info')}
                >
                  {t('sms.test_sms_btn')}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mots-clés USSD */}
      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            {t('sms.ussd_keywords') || 'Mots-clés USSD'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(settings.smsUssd?.keywords || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Zap className="text-green-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100 capitalize">{key}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {key === 'register' ? t('sms.ussd_registration') :
                        key === 'balance' ? t('sms.ussd_balance') :
                          t('sms.ussd_help')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateNestedSetting('smsUssd', 'keywords', {
                      ...settings.smsUssd?.keywords,
                      [key]: e.target.value.toUpperCase()
                    })}
                    className="w-32 border-2 border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-center font-mono outline-none focus:border-green-500"
                    maxLength="10"
                  />
                  <Badge variant="outline">USSD</Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
            <p className="text-sm text-green-800">
              <strong>{t('common.note') || 'Note'} :</strong> {t('sms.ussd_note_msg') || 'Les utilisateurs peuvent composer *8000*CODE# pour accéder aux services. Exemple : *8000*REG# pour s\'inscrire.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Réponses automatiques */}
      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            {t('sms.auto_responses') || 'Réponses automatiques'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('sms.welcome_msg') || 'Message de bienvenue'}
            </label>
            <textarea
              value={settings.smsUssd?.autoResponse?.welcome || ''}
              onChange={(e) => updateNestedSetting('smsUssd', 'autoResponse', {
                ...settings.smsUssd?.autoResponse,
                welcome: e.target.value
              })}
              rows="3"
              className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
              placeholder={t('sms.welcome_placeholder') || 'Bienvenue sur Taka Taka! Envoyez REG pour vous inscrire...'}
              maxLength="160"
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span>{t('sms.standard_sms_limit') || 'SMS standard (160 caractères max)'}</span>
              <span>{settings.smsUssd?.autoResponse?.welcome?.length || 0}/160</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('sms.balance_response') || 'Réponse solde'}
            </label>
            <textarea
              value={settings.smsUssd?.autoResponse?.balance || ''}
              onChange={(e) => updateNestedSetting('smsUssd', 'autoResponse', {
                ...settings.smsUssd?.autoResponse,
                balance: e.target.value
              })}
              rows="3"
              className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
              placeholder={t('sms.balance_placeholder') || "Votre solde est de {balance} GNF. Merci d'utiliser Taka Taka!"}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t('sms.balance_variable_tip') || "Utilisez {balance} pour insérer le solde de l'utilisateur"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('sms.help_response') || 'Réponse aide'}
            </label>
            <textarea
              value={settings.smsUssd?.autoResponse?.help || ''}
              onChange={(e) => updateNestedSetting('smsUssd', 'autoResponse', {
                ...settings.smsUssd?.autoResponse,
                help: e.target.value
              })}
              rows="3"
              className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
              placeholder={t('sms.help_placeholder') || 'Taka Taka - Service de transport. Commandez un véhicule en envoyant RIDE au 8000. Support: +224 XXX XX XX'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tarification SMS */}
      <Card className="border-2 border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="text-orange-800 flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            {t('sms.pricing_title') || 'Tarification SMS'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('sms.cost_per_sms') || 'Coût par SMS (GNF)'}
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  value={settings.smsUssd?.costPerSms || 50}
                  onChange={(e) => updateNestedSetting('smsUssd', 'costPerSms',
                    parseInt(e.target.value) || 0
                  )}
                  className="flex-1 border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
                />
                <span className="ml-3 text-gray-600 dark:text-gray-300">{t('common.currency_symbol') || 'GNF'}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('sms.cost_desc') || 'Coût facturé par le fournisseur'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('sms.daily_limit') || 'Limite quotidienne'}
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  value={settings.smsUssd?.dailyLimit || 10}
                  onChange={(e) => updateNestedSetting('smsUssd', 'dailyLimit',
                    parseInt(e.target.value) || 10
                  )}
                  className="flex-1 border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
                />
                <span className="ml-3 text-gray-600 dark:text-gray-300">{t('sms.sms_per_day') || 'SMS/jour'}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('sms.per_user') || 'Par utilisateur'}</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-xl border border-orange-200">
            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">{t('sms.cost_simulation') || 'Simulation de coûts'}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">{t('sms.active_users_label', { count: 1000 }) || '1000 utilisateurs actifs :'}</span>
                <span className="font-bold text-orange-700">
                  {((settings.smsUssd?.costPerSms || 50) * 1000).toLocaleString()} GNF/mois
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">{t('sms.daily_notifications') || 'Notifications quotidiennes :'}</span>
                <span className="font-bold text-orange-700">
                  {((settings.smsUssd?.costPerSms || 50) * 1000 * 30).toLocaleString()} GNF/mois
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmsUssdSettings;
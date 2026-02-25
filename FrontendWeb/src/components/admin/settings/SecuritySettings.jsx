import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Shield, Lock, Eye, EyeOff, Globe, UserCheck,
  AlertTriangle, Clock, Users, Key, Filter,
  RefreshCw, Ban, CheckCircle, XCircle,
  Hash, Server, Database, Cpu, Network
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Switch from '../ui/Switch';
import Button from '../ui/Bttn';
import Badge from '../ui/Badge';
import Slider from '../ui/Slider';

const SecuritySettings = ({ settings, updateNestedSetting, showToast }) => {
  const { t } = useTranslation();
  const [showSecret, setShowSecret] = useState({});
  const [activeTab, setActiveTab] = useState('authentication');

  const securityTabs = [
    { id: 'authentication', label: t('security.authentication'), icon: Lock },
    { id: 'access', label: t('security.access_control'), icon: Users },
    { id: 'network', label: t('security.network_security'), icon: Network },
    { id: 'monitoring', label: t('security.monitoring'), icon: Shield },
    { id: 'encryption', label: t('security.encryption'), icon: Key }
  ];

  const toggleKeyVisibility = (key) => {
    setShowSecret(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestSecurity = async (testType) => {
    showToast(t('security.test_title'), `${t('security.test_launching')} ${testType}...`, 'info');

    // Simulation de test
    setTimeout(() => {
      showToast(t('security.test_success'), `${t('security.test_finished')} ${testType} ${t('security.test_no_issue')}`, 'success');
    }, 2000);
  };

  const generateSecurityReport = () => {
    const issues = [];
    const strengths = [];

    // Analyse de sécurité
    if (!settings.security?.authentication?.twoFactorEnabled) {
      issues.push(t('security.alert_2fa_disabled'));
    } else {
      strengths.push(t('security.2fa_enabled'));
    }

    if (!settings.security?.rateLimiting?.enabled) {
      issues.push(t('security.alert_rate_limit_disabled'));
    } else {
      strengths.push(t('security.rate_limiting_enabled'));
    }

    if (settings.security?.cors?.allowedOrigins?.includes('*')) {
      issues.push(t('security.alert_cors_permissive'));
    }

    showToast(
      t('security.report_title'),
      `${strengths.length} ${t('security.strengths')}, ${issues.length} ${t('security.to_improve')}`,
      issues.length > 2 ? 'warning' : 'success'
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'authentication':
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

      case 'access':
        return (
          <div className="space-y-6">
            <Card className="border-2 border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {t('security.role_management')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-blue-800">{t('common.role')}</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-blue-800">{t('common.description')}</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-blue-800">{t('common.permissions')}</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-blue-800">{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          role: 'admin',
                          name: 'Administrateur',
                          description: 'Accès complet à tous les paramètres',
                          permissions: ['*'],
                          color: 'red'
                        },
                        {
                          role: 'manager',
                          name: 'Gestionnaire',
                          description: 'Gestion des chauffeurs et courses',
                          permissions: ['drivers.manage', 'rides.view', 'reports.view'],
                          color: 'orange'
                        },
                        {
                          role: 'driver',
                          name: 'Chauffeur',
                          description: 'Accès à l\'application chauffeur',
                          permissions: ['rides.accept', 'profile.update', 'earnings.view'],
                          color: 'blue'
                        },
                        {
                          role: 'customer',
                          name: 'Client',
                          description: 'Accès à l\'application client',
                          permissions: ['rides.create', 'rides.view', 'payment.make'],
                          color: 'green'
                        }
                      ].map((roleItem) => (
                        <tr key={roleItem.role} className="border-b border-blue-100 hover:bg-blue-50/30">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <Badge variant={roleItem.color} size="md">
                                {roleItem.name}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">({roleItem.role})</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-700 dark:text-gray-200">{roleItem.description}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {roleItem.permissions.slice(0, 3).map((perm, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-950 rounded text-xs text-gray-700 dark:text-gray-200">
                                  {perm}
                                </span>
                              ))}
                              {roleItem.permissions.length > 3 && (
                                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-xs text-gray-700 dark:text-gray-200">
                                  +{roleItem.permissions.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => showToast(t('common.edit'), `${t('security.edit_perm')} ${roleItem.name}`, 'info')}
                            >
                              {t('common.edit')}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => showToast(t('security.new_role'), t('security.new_role_msg'), 'info')}
                  >
                    + {t('security.add_role')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  {t('security.ip_access_control')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.ip_whitelist')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.ip_whitelist_desc')}</p>
                    </div>
                    <Switch
                      checked={settings.security?.ipWhitelist?.enabled || false}
                      onChange={() => updateNestedSetting('security', 'ipWhitelist', 'enabled',
                        !settings.security?.ipWhitelist?.enabled
                      )}
                    />
                  </div>

                  {settings.security?.ipWhitelist?.enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        {t('security.allowed_ips_label')}
                      </label>
                      <textarea
                        value={(settings.security.ipWhitelist.ips || []).join('\n')}
                        onChange={(e) => {
                          const ips = e.target.value.split('\n').filter(ip => ip.trim());
                          updateNestedSetting('security', 'ipWhitelist', 'ips', ips);
                        }}
                        rows="4"
                        className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500 font-mono text-sm"
                        placeholder="192.168.1.1\n10.0.0.0/24"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {t('security.ip_format_tip')}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.georestriction')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.georestriction_desc')}</p>
                    </div>
                    <Switch
                      checked={settings.security?.geoRestriction?.enabled || false}
                      onChange={() => updateNestedSetting('security', 'geoRestriction', 'enabled',
                        !settings.security?.geoRestriction?.enabled
                      )}
                    />
                  </div>

                  {settings.security?.geoRestriction?.enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        {t('security.allowed_countries')}
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['GN', 'CI', 'SN', 'ML', 'BF', 'TG', 'BJ', 'NE'].map(country => (
                          <label key={country} className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <input
                              type="checkbox"
                              checked={(settings.security.geoRestriction.countries || []).includes(country)}
                              onChange={(e) => {
                                const countries = settings.security.geoRestriction.countries || [];
                                const newCountries = e.target.checked
                                  ? [...countries, country]
                                  : countries.filter(c => c !== country);
                                updateNestedSetting('security', 'geoRestriction', 'countries', newCountries);
                              }}
                              className="rounded text-blue-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">{getCountryName(country)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'network':
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

      case 'monitoring':
        return (
          <div className="space-y-6">
            <Card className="border-2 border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Journalisation (Logging)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('security.logging_level') || 'Niveau de journalisation'}
                  </label>
                  <select
                    value={settings.security?.logging?.level || 'info'}
                    onChange={(e) => updateNestedSetting('security', 'logging', 'level', e.target.value)}
                    className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="error">{t('security.log_error') || 'Erreurs seulement'}</option>
                    <option value="warn">{t('security.log_warn') || 'Avertissements et erreurs'}</option>
                    <option value="info">{t('security.log_info') || 'Informations (recommandé)'}</option>
                    <option value="debug">{t('security.log_debug') || 'Débogage (détaillé)'}</option>
                    <option value="trace">{t('security.log_trace') || 'Trace (très détaillé)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('security.log_retention') || 'Conservation des logs'}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('security.app_logs') || "Logs d'application"}</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={settings.security?.logging?.retentionDays || 30}
                          onChange={(e) => updateNestedSetting('security', 'logging', 'retentionDays',
                            parseInt(e.target.value) || 30
                          )}
                          className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                        />
                        <span className="ml-2 text-gray-600 dark:text-gray-300">jours</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('security.audit_logs') || "Logs d'audit"}</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="30"
                          max="1095"
                          value={settings.security?.logging?.auditRetentionDays || 365}
                          onChange={(e) => updateNestedSetting('security', 'logging', 'auditRetentionDays',
                            parseInt(e.target.value) || 365
                          )}
                          className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                        />
                        <span className="ml-2 text-gray-600 dark:text-gray-300">jours</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('security.security_logs') || 'Logs de sécurité'}</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="90"
                          max="1825"
                          value={settings.security?.logging?.securityRetentionDays || 730}
                          onChange={(e) => updateNestedSetting('security', 'logging', 'securityRetentionDays',
                            parseInt(e.target.value) || 730
                          )}
                          className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                        />
                        <span className="ml-2 text-gray-600 dark:text-gray-300">jours</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.log_login_attempts') || 'Journaliser les tentatives de connexion'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.log_login_attempts_desc') || "Suivre toutes les tentatives (réussies et échouées)"}</p>
                    </div>
                    <Switch
                      checked={settings.security?.logging?.logLoginAttempts || true}
                      onChange={() => updateNestedSetting('security', 'logging', 'logLoginAttempts',
                        !settings.security?.logging?.logLoginAttempts
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.log_sensitive_changes') || 'Journaliser les modifications sensibles'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.log_sensitive_changes_desc') || 'Changements de paramètres, permissions, etc.'}</p>
                    </div>
                    <Switch
                      checked={settings.security?.logging?.logSensitiveChanges || true}
                      onChange={() => updateNestedSetting('security', 'logging', 'logSensitiveChanges',
                        !settings.security?.logging?.logSensitiveChanges
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.real_time_alerts') || 'Alertes en temps réel'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.real_time_alerts_desc') || 'Notifications pour événements de sécurité'}</p>
                    </div>
                    <Switch
                      checked={settings.security?.monitoring?.realTimeAlerts || false}
                      onChange={() => updateNestedSetting('security', 'monitoring', 'realTimeAlerts',
                        !settings.security?.monitoring?.realTimeAlerts
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  Monitoring de sécurité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-4">{t('security.auto_checks') || 'Vérifications automatiques'}</h4>
                    <div className="space-y-3">
                      {[
                        { id: 'ssl', label: 'Certificat SSL', enabled: true },
                        { id: 'headers', label: 'En-têtes de sécurité', enabled: true },
                        { id: 'dependencies', label: 'Dépendances vulnérables', enabled: true },
                        { id: 'backups', label: 'Sauvegardes récentes', enabled: false },
                        { id: 'firewall', label: 'État du firewall', enabled: false },
                        { id: 'intrusion', label: 'Détection d\'intrusion', enabled: false }
                      ].map(check => (
                        <div key={check.id} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-200">{t(`security.check_${check.id}`) || check.label}</span>
                          <div className="flex items-center space-x-2">
                            {check.enabled ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-green-600">{t('common.active') || 'Activé'}</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">{t('common.inactive') || 'Désactivé'}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-4">{t('security.monitoring_actions') || 'Actions de monitoring'}</h4>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        icon={RefreshCw}
                        onClick={() => handleTestSecurity('SSL/TLS')}
                      >
                        Vérifier le certificat SSL
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        icon={Shield}
                        onClick={() => handleTestSecurity('en-têtes de sécurité')}
                      >
                        Analyser les en-têtes HTTP
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        icon={Cpu}
                        onClick={() => generateSecurityReport()}
                      >
                        Générer un rapport de sécurité
                      </Button>

                      <Button
                        variant="danger"
                        className="w-full justify-start"
                        icon={AlertTriangle}
                        onClick={() => showToast('Alerte', 'Scan de vulnérabilités lancé', 'warning')}
                      >
                        Scanner les vulnérabilités
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-700">{t('security.recommendations_title') || 'Recommandations de sécurité'}</p>
                      <ul className="text-sm text-green-600 mt-2 space-y-1">
                        <li>• {t('security.rec_weekly_scans') || 'Effectuez des scans de sécurité hebdomadaires'}</li>
                        <li>• {t('security.rec_update_deps') || 'Maintenez les dépendances à jour'}</li>
                        <li>• {t('security.rec_monitor_login') || 'Surveillez les tentatives de connexion suspectes'}</li>
                        <li>• {t('security.rec_critical_alerts') || 'Configurez des alertes pour les événements critiques'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'encryption':
        return (
          <div className="space-y-6">
            <Card className="border-2 border-purple-100">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Chiffrement des données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.encryption_at_rest') || 'Chiffrement au repos'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.encryption_at_rest_desc') || 'Chiffrer les données sensibles dans la base de données'}</p>
                  </div>
                  <Switch
                    checked={settings.security?.encryption?.atRest || true}
                    onChange={() => updateNestedSetting('security', 'encryption', 'atRest',
                      !settings.security?.encryption?.atRest
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.encryption_in_transit') || 'Chiffrement en transit'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.encryption_in_transit_desc') || 'Forcer HTTPS/TLS pour toutes les communications'}</p>
                  </div>
                  <Badge variant="success">{t('security.always_enabled') || 'Toujours activé'}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      {t('security.encryption_algorithm') || 'Algorithme de chiffrement'}
                    </label>
                    <select
                      value={settings.security?.encryption?.algorithm || 'aes-256-gcm'}
                      onChange={(e) => updateNestedSetting('security', 'encryption', 'algorithm', e.target.value)}
                      className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
                    >
                      <option value="aes-128-gcm">AES-128-GCM</option>
                      <option value="aes-256-gcm">AES-256-GCM (recommandé)</option>
                      <option value="chacha20-poly1305">ChaCha20-Poly1305</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      {t('security.key_rotation') || 'Rotation des clés'}
                    </label>
                    <select
                      value={settings.security?.encryption?.keyRotation || '90'}
                      onChange={(e) => updateNestedSetting('security', 'encryption', 'keyRotation', e.target.value)}
                      className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
                    >
                      <option value="30">30 jours</option>
                      <option value="60">60 jours</option>
                      <option value="90">90 jours (recommandé)</option>
                      <option value="180">6 mois</option>
                      <option value="365">1 an</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('security.sensitive_data_encrypt') || 'Données sensibles à chiffrer'}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: 'passwords', label: 'Mots de passe', default: true },
                      { id: 'api_keys', label: 'Clés API', default: true },
                      { id: 'payment_info', label: 'Informations de paiement', default: true },
                      { id: 'personal_data', label: 'Données personnelles', default: true },
                      { id: 'messages', label: 'Messages', default: false },
                      { id: 'location', label: 'Localisation', default: false }
                    ].map(item => (
                      <label key={item.id} className="flex items-center space-x-2 p-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer hover:border-purple-300">
                        <input
                          type="checkbox"
                          checked={settings.security?.encryption?.sensitiveFields?.includes(item.id) || item.default}
                          onChange={(e) => {
                            const fields = settings.security?.encryption?.sensitiveFields || [];
                            if (e.target.checked) {
                              updateNestedSetting('security', 'encryption', 'sensitiveFields', [...fields, item.id]);
                            } else {
                              updateNestedSetting('security', 'encryption', 'sensitiveFields', fields.filter(f => f !== item.id));
                            }
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-200">{t(`security.data_${item.id}`) || item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-2">{t('security.master_encryption_key') || 'Clé de chiffrement principale'}</h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-white dark:bg-gray-900 border-2 border-purple-200 rounded-xl px-4 py-3">
                      <code className="text-gray-800 dark:text-gray-100 font-mono text-sm truncate">
                        {showSecret.masterKey ? 'enc_key_' + Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('') : '••••••••••••••••••••••••••••••••'}
                      </code>
                    </div>
                    <button
                      onClick={() => toggleKeyVisibility('masterKey')}
                      className="px-3 py-2 border-2 border-purple-300 rounded-xl text-purple-700 hover:bg-purple-50"
                    >
                      {showSecret.masterKey ? t('common.hide') || 'Masquer' : t('common.view') || 'Afficher'}
                    </button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => showToast('Alerte', 'Regénération de la clé principale', 'warning')}
                    >
                      {t('common.regenerate') || 'Regénérer'}
                    </Button>
                  </div>
                  <p className="text-sm text-purple-600 mt-2">
                    ⚠️ {t('security.master_key_warn') || 'La regénération de cette clé rendra toutes les données chiffrées illisibles sans backup'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center">
                  <Hash className="w-5 h-5 mr-2" />
                  {t('security.pwd_hashing_title') || 'Hashing des mots de passe'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('security.hashing_algorithm') || 'Algorithme de hachage'}
                  </label>
                  <select
                    value={settings.security?.hashing?.algorithm || 'bcrypt'}
                    onChange={(e) => updateNestedSetting('security', 'hashing', 'algorithm', e.target.value)}
                    className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="bcrypt">BCrypt ({t('common.recommended') || 'recommandé'})</option>
                    <option value="argon2">Argon2</option>
                    <option value="pbkdf2">PBKDF2</option>
                    <option value="scrypt">Scrypt</option>
                  </select>
                </div>

                {settings.security?.hashing?.algorithm === 'bcrypt' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      {t('security.hashing_cost') || 'Coût de hachage (rounds)'}
                    </label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        min="10"
                        max="15"
                        step="1"
                        value={settings.security.hashing.costFactor || 12}
                        onChange={(value) => updateNestedSetting('security', 'hashing', 'costFactor', value)}
                      />
                      <span className="w-16 text-right font-bold text-blue-700">
                        2^{settings.security.hashing.costFactor || 12}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Coût plus élevé = plus sécurisé mais plus lent (12 est recommandé)
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.unique_salt') || 'Sel unique par utilisateur'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.unique_salt_desc') || 'Générer un sel différent pour chaque mot de passe'}</p>
                  </div>
                  <Badge variant="success">{t('security.always_enabled') || 'Toujours activé'}</Badge>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
                  <div className="flex items-center">
                    <Key className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-700">{t('security.hashing_best_practices') || 'Bonnes pratiques de hachage'}</p>
                      <ul className="text-sm text-blue-600 mt-2 space-y-1">
                        <li>• {t('security.rec_bcrypt_12') || "Utilisez BCrypt avec un coût d'au moins 12"}</li>
                        <li>• {t('security.rec_no_plaintext') || 'Ne stockez jamais les mots de passe en clair'}</li>
                        <li>• {t('security.rec_unique_salts') || 'Utilisez des sels uniques pour chaque utilisateur'}</li>
                        <li>• {t('security.rec_update_algos') || 'Mettez à jour les algorithmes obsolètes régulièrement'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const getCountryName = (code) => {
    const countries = {
      'GN': 'Guinée',
      'CI': 'Côte d\'Ivoire',
      'SN': 'Sénégal',
      'ML': 'Mali',
      'BF': 'Burkina Faso',
      'TG': 'Togo',
      'BJ': 'Bénin',
      'NE': 'Niger'
    };
    return countries[code] || code;
  };

  return (
    <div className="space-y-8">
      {/* En-tête avec score de sécurité */}
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-teal-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('security.security_center') || 'Centre de sécurité'}</h2>
              <p className="text-gray-600 dark:text-gray-300">{t('security.security_center_desc') || 'Configurez et surveillez la sécurité de votre plateforme'}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">87%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{t('security.security_score') || 'Score de sécurité'}</div>
              </div>
              <Button
                variant="primary"
                className="bg-gradient-to-r from-blue-700 to-teal-700"
                icon={Shield}
                onClick={generateSecurityReport}
              >
                {t('security.check_security') || 'Vérifier la sécurité'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation par onglets */}
      <div className="overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {securityTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:border-gray-700'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu de l'onglet actif */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      {/* Alertes de sécurité critiques */}
      <Card className="border-2 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {t('security.security_alerts_title') || 'Alertes de sécurité'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-red-300">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.alert_2fa_disabled') || 'Authentification à deux facteurs désactivée'}</p>
                  <p className="text-sm text-red-600">{t('security.alert_2fa_desc') || 'Activez la 2FA pour les comptes administrateurs'}</p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => updateNestedSetting('security', 'authentication', 'twoFactorEnabled', true)}
              >
                {t('common.activate') || 'Activer'}
              </Button>
            </div>

            {!settings.security?.rateLimiting?.enabled && (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-red-300">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.alert_rate_limit_disabled') || 'Limitation de requêtes désactivée'}</p>
                    <p className="text-sm text-red-600">{t('security.alert_rate_limit_desc') || 'Votre API est vulnérable aux attaques par force brute'}</p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => updateNestedSetting('security', 'rateLimiting', 'enabled', true)}
                >
                  {t('common.activate') || 'Activer'}
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-yellow-300">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.alert_old_audit') || 'Dernier audit de sécurité : il y a 30 jours'}</p>
                  <p className="text-sm text-yellow-600">{t('security.alert_audit_rec') || 'Effectuez un audit complet chaque semaine'}</p>
                </div>
              </div>
              <Button
                variant="warning"
                size="sm"
                onClick={() => handleTestSecurity('audit complet')}
              >
                {t('security.launch_audit_btn') || 'Lancer un audit'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
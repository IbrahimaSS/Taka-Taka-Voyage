import { useTranslation } from 'react-i18next';
import { Users, Filter } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Badge from '../../ui/Badge';
import Button from '../../ui/Bttn';
import Switch from '../../ui/Switch';

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

const AccessControlTab = ({ settings, updateNestedSetting, showToast }) => {
  const { t } = useTranslation();

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
};

export default AccessControlTab;

import { useState, useRef } from 'react';
import { Upload, Clock, Building } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Button from '../../ui/Bttn';

const currencies = [
  { code: 'GNF', name: 'Franc Guinéen', symbol: 'FG' },
  { code: 'XOF', name: 'Franc CFA', symbol: 'CFA' },
  { code: 'USD', name: 'Dollar US', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' }
];

const timezones = [
  'Africa/Conakry',
  'Africa/Abidjan',
  'Africa/Dakar',
  'Africa/Bamako',
  'Africa/Nouakchott'
];

const PlatformInfoCard = ({ t, settings, updateSetting, showToast }) => {
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast(t('common.error'), t('settings.logo_size_error'), 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        updateSetting('platform.logo', e.target.result);
        showToast(t('common.success'), t('settings.logo_updated'), 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-blue-100 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center">
          <Building className="w-5 h-5 mr-2" />
          {t('settings.platform_info')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('settings.platform_name')}
            </label>
            <input
              type="text"
              value={settings.platform?.name || ''}
              onChange={(e) => updateSetting('platform.name', e.target.value)}
              placeholder='Taka Taka'
              className="w-full border-2 border-gray-200 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('settings.tagline')}
            </label>
            <input
              type="text"
              value={settings.platform?.tagline || ''}
              onChange={(e) => updateSetting('platform.tagline', e.target.value)}
              className="w-full border-2 border-gray-200 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="Votre transport, notre priorité"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('settings.main_currency')}
            </label>
            <select
              value={settings.platform?.currency || 'GNF'}
              onChange={(e) => updateSetting('platform.currency', e.target.value)}
              className="w-full border-2 border-gray-200 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('settings.timezone')}
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <select
                value={settings.platform?.timezone || 'Africa/Conakry'}
                onChange={(e) => updateSetting('platform.timezone', e.target.value)}
                className="w-full border-2 border-gray-200 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {t('settings.platform_logo')}
          </label>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 flex items-center justify-center overflow-hidden">
                {logoPreview || settings.platform?.logo ? (
                  <img
                    src={logoPreview || settings.platform?.logo}
                    alt="Logo"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="text-center">
                    <Building className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Logo</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
                ref={fileInputRef}
              />
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {t('settings.logo_recommendation') || 'Taille recommandée: 512x512 pixels. Formats acceptés: PNG, JPG, SVG (max 2MB)'}
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  icon={Upload}
                  className="cursor-pointer"
                  onClick={handleImportClick}
                >
                  {t('common.change_logo')}
                </Button>
                {(logoPreview || settings.platform?.logo) && (
                  <Button
                    variant="danger"
                    onClick={() => {
                      setLogoPreview(null);
                      updateSetting('platform.logo', null);
                    }}
                  >
                    {t('common.delete')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">{t('settings.contact_info')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('settings.contact_email')}
              </label>
              <input
                type="email"
                value={settings.platform?.contactEmail || ''}
                onChange={(e) => updateSetting('platform.contactEmail', e.target.value)}
                className="w-full border-2 border-gray-200 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="contact@takataka.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('settings.contact_phone')}
              </label>
              <input
                type="tel"
                value={settings.platform?.contactPhone || ''}
                onChange={(e) => updateSetting('platform.contactPhone', e.target.value)}
                className="w-full border-2 border-gray-200 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="+224 000 000 000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('settings.website')}
              </label>
              <input
                type="url"
                value={settings.platform?.website || ''}
                onChange={(e) => updateSetting('platform.website', e.target.value)}
                className="w-full border-2 border-gray-200 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="https://takataka.com"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformInfoCard;

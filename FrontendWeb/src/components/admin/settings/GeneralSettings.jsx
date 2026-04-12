// src/components/settings/components/GeneralSettings.jsx
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Upload, Globe, Clock, MessageSquare, Shield, Building, FileText } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Bttn';
import Switch from '../ui/Switch';
import i18n from '../../../i18n/config';
import { apiClient } from '../../../services/apiClient';

// Liste des langues supportées par la plateforme
const SUPPORTED_LANGUAGES = [
  { code: 'fr', translationKey: 'languages.french', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'en', translationKey: 'languages.english', flag: '🇬🇧', nativeName: 'English' },
  { code: 'pular', translationKey: 'languages.pular', flag: '🇬🇳', nativeName: 'Pulaar' },
  { code: 'soussou', translationKey: 'languages.soussou', flag: '🇬🇳', nativeName: 'Susu' },
  { code: 'malinke', translationKey: 'languages.malinke', flag: '🇬🇳', nativeName: 'Maninka' }
];

const GeneralSettings = ({ settings, updateSetting, showToast }) => {
  const { t } = useTranslation();
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

  return (
    <div className="space-y-8">
      {/* Informations de la plateforme */}
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

      {/* Maintenance */}
      <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-red-100 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            {t('settings.maintenance_mode')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-800 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Shield className="text-red-600 w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{t('settings.activate_maintenance')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('settings.maintenance_description')}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.platform?.maintenanceMode || false}
              onChange={() => updateSetting('platform.maintenanceMode', !settings.platform?.maintenanceMode)}
            />
          </div>

          {settings.platform?.maintenanceMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  {t('settings.maintenance_message')}
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <textarea
                    value={settings.platform?.maintenanceMessage || ''}
                    onChange={(e) => updateSetting('platform.maintenanceMessage', e.target.value)}
                    rows="4"
                    className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="Message à afficher aux utilisateurs..."
                  />
                </div>

                <div className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">
                    <strong>{t('common.note')} :</strong> {t('settings.maintenance_note')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Localisation */}
      <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-teal-100 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-gray-500 dark:text-gray-400 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            {t('settings.localization_title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('settings.default_language')}
              </label>
              <select
                value={settings.platform?.language || 'fr'}
                onChange={(e) => {
                  const newLang = e.target.value;
                  const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === newLang);
                  updateSetting('platform.language', newLang);
                  // Changement immédiat de la langue i18n
                  i18n.changeLanguage(newLang);
                  
                  try {
                    apiClient.post('/admin/logs/manuel', {
                      action: "CHANGEMENT_LANGUE",
                      module: "FRONTEND",
                      details: { nouvelleLangue: newLang, interfaces: "ADMIN" }
                    });
                  } catch (e) {
                    console.warn("Log language failed", e);
                  }

                  if (showToast && langInfo) {
                    showToast(
                      t('common.success'),
                      t('languages.language_changed', { lang: langInfo.nativeName }),
                      'success'
                    );
                  }
                }}
                className="w-full border-2 border-gray-200 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {t(lang.translationKey)} ({lang.nativeName})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('languages.language_change_desc', {
                  lang: SUPPORTED_LANGUAGES.find(l => l.code === (settings.platform?.language || 'fr'))?.nativeName || 'Français'
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('settings.operating_country')}
              </label>
              <select
                value={settings.platform?.country || 'GN'}
                onChange={(e) => updateSetting('platform.country', e.target.value)}
                className="w-full border-2 border-gray-200 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              >
                <option value="GN">Guinée</option>
                <option value="CI">Côte d'Ivoire</option>
                <option value="SN">Sénégal</option>
                <option value="ML">Mali</option>
                <option value="BF">Burkina Faso</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('settings.company_address')}
            </label>
            <textarea
              value={settings.platform?.companyAddress || ''}
              onChange={(e) => updateSetting('platform.companyAddress', e.target.value)}
              rows="3"
              className="w-full border-2 border-gray-200 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              placeholder={t('settings.address_placeholder')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;
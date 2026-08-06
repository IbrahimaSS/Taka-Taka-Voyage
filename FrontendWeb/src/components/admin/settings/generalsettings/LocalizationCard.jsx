import { Globe } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import i18n from '../../../../i18n/config';
import { apiClient } from '../../../../services/apiClient';

// Liste des langues supportées par la plateforme
const SUPPORTED_LANGUAGES = [
  { code: 'fr', translationKey: 'languages.french', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'en', translationKey: 'languages.english', flag: '🇬🇧', nativeName: 'English' },
  { code: 'pular', translationKey: 'languages.pular', flag: '🇬🇳', nativeName: 'Pulaar' },
  { code: 'soussou', translationKey: 'languages.soussou', flag: '🇬🇳', nativeName: 'Susu' },
  { code: 'malinke', translationKey: 'languages.malinke', flag: '🇬🇳', nativeName: 'Maninka' }
];

const LocalizationCard = ({ t, settings, updateSetting, showToast }) => {
  return (
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
  );
};

export default LocalizationCard;

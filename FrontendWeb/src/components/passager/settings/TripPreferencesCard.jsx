import { useTranslation } from 'react-i18next';
import { Car, Globe } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';
import { SUPPORTED_LANGUAGES } from './supportedLanguages';

const TripPreferencesCard = ({ preferences, resetKey, onUpdatePreference }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Car className="w-6 h-6 text-green-600 dark:text-green-500 mr-3" />
          <CardTitle>{t('passenger_settings.trip_preferences')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">{t('passenger_settings.preferred_vehicle')}</label>
            <select
              key={`vehicle-${resetKey}`}
              value={preferences.vehicle}
              onChange={(e) => onUpdatePreference('vehicle', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
            >
              <option value="moto">{t('passenger_settings.vehicle_moto')}</option>
              <option value="taxi">{t('passenger_settings.vehicle_taxi')}</option>
              <option value="voiture">{t('passenger_settings.vehicle_car')}</option>
              <option value="any">{t('passenger_settings.vehicle_any')}</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              {t('passenger_settings.preferred_language')}
            </label>
            <select
              key={`language-${resetKey}`}
              value={preferences.language}
              onChange={(e) => onUpdatePreference('language', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="dark:bg-gray-800">
                  {lang.flag} {t(lang.translationKey)} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">{t('passenger_settings.default_payment')}</label>
            <select
              key={`payment-${resetKey}`}
              value={preferences.paymentMethod}
              onChange={(e) => onUpdatePreference('paymentMethod', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
            >
              <option value="mobile_money">{t('passenger_settings.payment_mobile_money')}</option>
              <option value="wallet">{t('passenger_settings.payment_wallet')}</option>
              <option value="cash">{t('passenger_settings.payment_cash')}</option>
              <option value="card">{t('passenger_settings.payment_card')}</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">{t('passenger_settings.preferred_contact')}</label>
            <select
              key={`contact-${resetKey}`}
              value={preferences.contactPreference}
              onChange={(e) => onUpdatePreference('contactPreference', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
            >
              <option value="call">{t('passenger_settings.contact_call')}</option>
              <option value="message">{t('passenger_settings.contact_message')}</option>
              <option value="both">{t('passenger_settings.contact_both')}</option>
              <option value="none">{t('passenger_settings.contact_none')}</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripPreferencesCard;

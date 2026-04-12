import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Shield, Car, Globe, CreditCard, Phone, Moon, Sun, Lock, Smartphone, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

// Composants réutilisables
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import Button from '../admin/ui/Bttn';
import Switch from '../admin/ui/Switch';
import Badge from '../admin/ui/Badge';
import ConfirmModal from '../admin/ui/ConfirmModal';

// Liste des langues supportées (cohérent avec i18n/config.js et LanguageSwitcher.jsx)
const SUPPORTED_LANGUAGES = [
  { code: 'fr', translationKey: 'languages.french', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'en', translationKey: 'languages.english', flag: '🇬🇧', nativeName: 'English' },
  { code: 'pular', translationKey: 'languages.pular', flag: '🇬🇳', nativeName: 'Pulaar' },
  { code: 'soussou', translationKey: 'languages.soussou', flag: '🇬🇳', nativeName: 'Susu' },
  { code: 'malinke', translationKey: 'languages.malinke', flag: '🇬🇳', nativeName: 'Maninka' }
];

const Settings = () => {
  const { t, i18n } = useTranslation();

  const [settings, setSettings] = useState({
    notifications: {
      tripUpdates: true,
      promotions: true,
      sms: false,
    },
    privacy: {
      publicProfile: true,
      locationSharing: false,
      anonymousHistory: false,
    },
    preferences: {
      vehicle: 'taxi',
      language: i18n.language || 'fr',
      paymentMethod: 'mobile_money',
      contactPreference: 'call',
    },
    theme: 'light',
    sound: true,
  });

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const toggleSetting = (category, key) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }));
  };

  const updatePreference = (key, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));

    // 🌍 Si c'est la langue : changer immédiatement toute la plateforme
    if (key === 'language') {
      i18n.changeLanguage(value);
      try {
        apiClient.post('/admin/logs/manuel', {
          action: "CHANGEMENT_LANGUE",
          module: "FRONTEND",
          details: { nouvelleLangue: value }
        });
      } catch (e) {
        console.warn("Log language failed", e);
      }
    }
  };

  const handleSave = () => {
    console.log('Paramètres sauvegardés:', settings);
    setShowSaveConfirm(false);
  };

  const handleCancel = () => {
    setResetKey(prev => prev + 1);
    // Restaurer la langue d'origine si annulé
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, language: i18n.language }
    }));
    setShowCancelConfirm(false);
  };

  const handleDeleteAccount = () => {
    console.log('Compte supprimé');
    setShowDeleteAccount(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Paramètres principaux */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('passenger_settings.account_settings')}</h2>
          <Badge variant="info" size="sm">Version 1.0</Badge>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="w-6 h-6 text-green-600 dark:text-green-500 mr-3" />
                <CardTitle>{t('passenger_settings.notifications')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.trip_notifications')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.trip_notifications_desc')}</p>
                </div>
                <Switch
                  checked={settings.notifications.tripUpdates}
                  onChange={() => toggleSetting('notifications', 'tripUpdates')}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.promo_notifications')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.promo_notifications_desc')}</p>
                </div>
                <Switch
                  checked={settings.notifications.promotions}
                  onChange={() => toggleSetting('notifications', 'promotions')}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.sms_notifications')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.sms_notifications_desc')}</p>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onChange={() => toggleSetting('notifications', 'sms')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Confidentialité */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-500 mr-3" />
                <CardTitle>{t('passenger_settings.privacy')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.public_profile')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.public_profile_desc')}</p>
                </div>
                <Switch
                  checked={settings.privacy.publicProfile}
                  onChange={() => toggleSetting('privacy', 'publicProfile')}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.location_sharing')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.location_sharing_desc')}</p>
                </div>
                <Switch
                  checked={settings.privacy.locationSharing}
                  onChange={() => toggleSetting('privacy', 'locationSharing')}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.anonymous_history')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.anonymous_history_desc')}</p>
                </div>
                <Switch
                  checked={settings.privacy.anonymousHistory}
                  onChange={() => toggleSetting('privacy', 'anonymousHistory')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Préférences de trajet */}
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
                    value={settings.preferences.vehicle}
                    onChange={(e) => updatePreference('vehicle', e.target.value)}
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
                    value={settings.preferences.language}
                    onChange={(e) => updatePreference('language', e.target.value)}
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
                    value={settings.preferences.paymentMethod}
                    onChange={(e) => updatePreference('paymentMethod', e.target.value)}
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
                    value={settings.preferences.contactPreference}
                    onChange={(e) => updatePreference('contactPreference', e.target.value)}
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

          {/* Boutons de sauvegarde */}
          <Card>
            <CardFooter align="between">
              <Button
                variant="danger"
                onClick={() => setShowDeleteAccount(true)}
              >
                {t('passenger_settings.delete_account')}
              </Button>
              <div className="flex space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowSaveConfirm(true)}
                >
                  {t('passenger_settings.save_changes')}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Apparence */}
        <Card>
          <CardHeader>
            <CardTitle>{t('passenger_settings.appearance')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.dark_mode')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.dark_mode_desc')}</p>
              </div>
              <Switch
                checked={settings.theme === 'dark'}
                onChange={() => setSettings(prev => ({
                  ...prev,
                  theme: prev.theme === 'light' ? 'dark' : 'light'
                }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.sounds')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.sounds_desc')}</p>
              </div>
              <Switch
                checked={settings.sound}
                onChange={() => setSettings(prev => ({ ...prev, sound: !prev.sound }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* À propos */}
        <Card>
          <CardHeader>
            <CardTitle>{t('passenger_settings.about')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl border border-green-100 dark:border-green-800/30 shadow-sm">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Taka Taka Version 1.0</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Build 2024.12.01</p>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.privacy_policy')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.privacy_policy_desc')}</p>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.terms_of_service')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.terms_of_service_desc')}</p>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.help_center')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.help_center_desc')}</p>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.legal_notices')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.legal_notices_desc')}</p>
              </button>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.all_rights_reserved')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('passenger_settings.compliant')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals de confirmation */}
      <ConfirmModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSave}
        title={t('passenger_settings.save_confirm_title')}
        message={t('passenger_settings.save_confirm_msg')}
        type="info"
        confirmText={t('passenger_settings.save_btn')}
        cancelText={t('common.cancel')}
      />

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title={t('passenger_settings.cancel_confirm_title')}
        message={t('passenger_settings.cancel_confirm_msg')}
        type="warning"
        confirmText={t('passenger_settings.yes_cancel')}
        cancelText={t('passenger_settings.no_keep')}
      />

      <ConfirmModal
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onConfirm={handleDeleteAccount}
        title={t('passenger_settings.delete_confirm_title')}
        message={t('passenger_settings.delete_confirm_msg')}
        type="delete"
        confirmText={t('passenger_settings.delete_permanently')}
        cancelText={t('common.cancel')}
        destructive={true}
        showComment={true}
        commentLabel={t('passenger_settings.delete_reason_label')}
        commentPlaceholder={t('passenger_settings.delete_reason_placeholder')}
      />
    </div>
  );
};

export default Settings;
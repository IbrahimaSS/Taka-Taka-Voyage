import { useTranslation } from 'react-i18next';
import Badge from '../admin/ui/Badge';

import { useSettingsForm } from './settings/useSettingsForm';
import NotificationsCard from './settings/NotificationsCard';
import PrivacyCard from './settings/PrivacyCard';
import TripPreferencesCard from './settings/TripPreferencesCard';
import SettingsActionsCard from './settings/SettingsActionsCard';
import AppearanceCard from './settings/AppearanceCard';
import AboutCard from './settings/AboutCard';
import SettingsConfirmModals from './settings/SettingsConfirmModals';

const Settings = () => {
  const { t } = useTranslation();
  const {
    settings, setSettings,
    resetKey,
    toggleSetting, updatePreference,
    showSaveConfirm, setShowSaveConfirm,
    showCancelConfirm, setShowCancelConfirm,
    showDeleteAccount, setShowDeleteAccount,
    handleSave, handleCancel, handleDeleteAccount,
  } = useSettingsForm();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Paramètres principaux */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('passenger_settings.account_settings')}</h2>
          <Badge variant="info" size="sm">Version 1.0</Badge>
        </div>

        <div className="space-y-6">
          <NotificationsCard
            notifications={settings.notifications}
            onToggle={toggleSetting}
          />

          <PrivacyCard
            privacy={settings.privacy}
            onToggle={toggleSetting}
          />

          <TripPreferencesCard
            preferences={settings.preferences}
            resetKey={resetKey}
            onUpdatePreference={updatePreference}
          />

          <SettingsActionsCard
            onDeleteAccount={() => setShowDeleteAccount(true)}
            onCancel={() => setShowCancelConfirm(true)}
            onSave={() => setShowSaveConfirm(true)}
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <AppearanceCard
          theme={settings.theme}
          sound={settings.sound}
          onToggleTheme={() => setSettings(prev => ({
            ...prev,
            theme: prev.theme === 'light' ? 'dark' : 'light'
          }))}
          onToggleSound={() => setSettings(prev => ({ ...prev, sound: !prev.sound }))}
        />

        <AboutCard />
      </div>

      <SettingsConfirmModals
        showSaveConfirm={showSaveConfirm}
        onCloseSave={() => setShowSaveConfirm(false)}
        onConfirmSave={handleSave}
        showCancelConfirm={showCancelConfirm}
        onCloseCancel={() => setShowCancelConfirm(false)}
        onConfirmCancel={handleCancel}
        showDeleteAccount={showDeleteAccount}
        onCloseDelete={() => setShowDeleteAccount(false)}
        onConfirmDelete={handleDeleteAccount}
      />
    </div>
  );
};

export default Settings;

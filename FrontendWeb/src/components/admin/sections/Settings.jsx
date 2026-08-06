// src/components/sections/Settings.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, RefreshCw, Database, Cog,
  Bell, Users, CreditCard,
  Settings as SettingsIcon,
  CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Bttn';
import { useTranslation } from 'react-i18next';

// Composants de paramétrage
import GeneralSettings from '../settings/GeneralSettings';
import NotificationsSettings from '../settings/NotificationsSettings';
import ApiSettings from '../settings/ApiSettings';
import BackupSettings from '../settings/BackupSettings';
import PaymentsSettings from '../settings/PaymentsSettings';
// import SmsUssdSettings from '../settings/SmsUssdSettings';

// Composants Settings
import SettingsSidebarNav from './settingsdashboard/SettingsSidebarNav';
import ServiceManagement from './settingsdashboard/ServiceManagement';

// Hooks
import { useSettings } from '../../../context/SettingsContext';
import { useNotificationCenter } from '../../../context/NotificationContext';
import { useSettingsSave } from './settingsdashboard/useSettingsSave';

const Settings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const { addNotification } = useNotificationCenter();

  const {
    settings,
    isLoading,
    hasChanges,
    updateSetting,
    updateNestedSetting,
    resetToDefaults,
    exportSettings,
    importSettings,
    saveToBackend
  } = useSettings();

  const {
    saveProgress,
    saveStatus,
    lastAutoSave,
    showToast,
    handleSave,
    handleImport,
    handleReset,
  } = useSettingsSave({ hasChanges, saveToBackend, importSettings, resetToDefaults, addNotification });

  const tabs = [
    { id: 'general', label: t('nav.general'), icon: Cog, color: 'blue' },
    { id: 'services', label: t('nav.services'), icon: Users, color: 'green' },
    { id: 'payments', label: t('nav.payments'), icon: CreditCard, color: 'purple' },
    { id: 'notifications', label: t('nav.notifications'), icon: Bell, color: 'orange' },
    { id: 'backup', label: t('nav.backup'), icon: Database, color: 'gray' }
  ];

  const renderTabContent = () => {
    const tabComponents = {
      general: <GeneralSettings settings={settings} updateSetting={updateSetting} showToast={showToast} />,
      services: <ServiceManagement settings={settings} updateNestedSetting={updateNestedSetting} showToast={showToast} />,
      payments: <PaymentsSettings settings={settings} updateNestedSetting={updateNestedSetting} showToast={showToast} />,
      notifications: <NotificationsSettings settings={settings} updateNestedSetting={updateNestedSetting} showToast={showToast} />,
      // 'sms-ussd': <SmsUssdSettings settings={settings} updateNestedSetting={updateNestedSetting} showToast={showToast} />,
      api: <ApiSettings settings={settings} updateNestedSetting={updateNestedSetting} showToast={showToast} />,
      backup: <BackupSettings onExport={exportSettings} onImport={handleImport} onReset={resetToDefaults} showToast={showToast} />
    };

    return tabComponents[activeTab] || (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Cette section est en cours de développement</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen  p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{t('settings.title')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{t('settings.description')}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <div className={`w-3 h-3 rounded-full ${hasChanges ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {hasChanges ? t('settings.unsaved_changes') : t('settings.all_saved')}
              </span>
              {hasChanges && lastAutoSave && (
                <span className="text-xs text-blue-500 ml-2">
                  <Clock className="inline w-3 h-3 mr-1" />
                  {lastAutoSave}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                icon={RefreshCw}
                onClick={handleReset}
                disabled={saveStatus === 'saving' || isLoading}
                size="sm"
                className="min-w-[120px]"
              >
                {t('common.default')}
              </Button>

              <Button
                variant="primary"
                className={`bg-gradient-to-r from-blue-700 to-teal-700 hover:from-blue-800 hover:to-teal-800 min-w-[120px] transition-all ${saveStatus === 'saving' ? 'opacity-90 cursor-not-allowed' : ''
                  }`}
                icon={saveStatus === 'success' ? CheckCircle : Save}
                onClick={handleSave}
                disabled={!hasChanges || saveStatus === 'saving' || isLoading}
                size="sm"
              >
                {saveStatus === 'saving' ? t('common.saving') :
                  saveStatus === 'success' ? `✓ ${t('common.saved')}` :
                    saveStatus === 'error' ? t('common.error') : t('common.save')}
              </Button>
            </div>
          </div>
        </motion.div>




        {/* Onglets et contenu */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation latérale pour desktop */}
          <SettingsSidebarNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {/* Contenu principal */}
          <div className="flex-1">
            <Card className="border-2 border-gray-100 dark:border-gray-900 shadow-sm min-h-[500px] overflow-hidden">
              {/* Navigation mobile */}
              <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-800 bg-slate-200/30 dark:bg-gray-800">
                <div className="relative">
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full border-2 border-gray-200 dark:border-gray-900 rounded-xl px-4 py-3 outline-none focus:border-blue-500 bg-white dark:bg-gray-800 appearance-none"
                  >
                    {tabs.map(tab => (
                      <option key={tab.id} value={tab.id}>{tab.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-3.5 pointer-events-none">
                    <SettingsIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

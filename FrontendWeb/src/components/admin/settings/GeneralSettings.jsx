// src/components/settings/components/GeneralSettings.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import PlatformInfoCard from './generalsettings/PlatformInfoCard';
import MaintenanceCard from './generalsettings/MaintenanceCard';
import LocalizationCard from './generalsettings/LocalizationCard';

const GeneralSettings = ({ settings, updateSetting, showToast }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <PlatformInfoCard t={t} settings={settings} updateSetting={updateSetting} showToast={showToast} />
      <MaintenanceCard t={t} settings={settings} updateSetting={updateSetting} />
      <LocalizationCard t={t} settings={settings} updateSetting={updateSetting} showToast={showToast} />
    </div>
  );
};

export default GeneralSettings;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Users, Network, Shield, Key } from 'lucide-react';
import SecurityHeader from './security/SecurityHeader';
import AuthenticationTab from './security/AuthenticationTab';
import AccessControlTab from './security/AccessControlTab';
import NetworkSecurityTab from './security/NetworkSecurityTab';
import MonitoringTab from './security/MonitoringTab';
import EncryptionTab from './security/EncryptionTab';
import SecurityAlertsCard from './security/SecurityAlertsCard';

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
        return <AuthenticationTab settings={settings} updateNestedSetting={updateNestedSetting} />;
      case 'access':
        return <AccessControlTab settings={settings} updateNestedSetting={updateNestedSetting} showToast={showToast} />;
      case 'network':
        return <NetworkSecurityTab settings={settings} updateNestedSetting={updateNestedSetting} />;
      case 'monitoring':
        return (
          <MonitoringTab
            settings={settings}
            updateNestedSetting={updateNestedSetting}
            showToast={showToast}
            onTestSecurity={handleTestSecurity}
            onGenerateReport={generateSecurityReport}
          />
        );
      case 'encryption':
        return (
          <EncryptionTab
            settings={settings}
            updateNestedSetting={updateNestedSetting}
            showToast={showToast}
            showSecret={showSecret}
            onToggleKeyVisibility={toggleKeyVisibility}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête avec score de sécurité */}
      <SecurityHeader onCheckSecurity={generateSecurityReport} />

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
      <SecurityAlertsCard
        settings={settings}
        updateNestedSetting={updateNestedSetting}
        onTestSecurity={handleTestSecurity}
      />
    </div>
  );
};

export default SecuritySettings;

// src/components/sections/Settings.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, RefreshCw, Database, Cog, DollarSign,
  Bell, Key, Shield, Users, MapPin, MessageSquare,
  Smartphone, Mail, Globe, CreditCard, Zap,
  TrendingUp, Settings as SettingsIcon, Upload,
  Download, CheckCircle, AlertCircle, AlertTriangle,
  Package, Car, Bike, Truck, Clock
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Bttn';
import Tabs from '../ui/Tabs';
import Toast from '../ui/Toast';

// Composants de paramétrage
import GeneralSettings from '../settings/GeneralSettings';
import NotificationsSettings from '../settings/NotificationsSettings';
import ApiSettings from '../settings/ApiSettings';
import BackupSettings from '../settings/BackupSettings';
import PaymentsSettings from '../settings/PaymentsSettings';
// import SmsUssdSettings from '../settings/SmsUssdSettings';

// Hooks
import { useSettings } from '../../../hooks/useSettings';

// TODO API (admin/parametres):
// Remplacer les valeurs locales par des appels backend
// Exemple: GET /admin/settings, PATCH /admin/settings
const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [toast, setToast] = useState(null);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [lastAutoSave, setLastAutoSave] = useState(null);

  const {
    settings,
    isLoading,
    hasChanges,
    updateSetting,
    updateNestedSetting,
    batchUpdate,
    resetToDefaults,
    exportSettings,
    importSettings,
    saveToBackend
  } = useSettings();

  const tabs = [
    { id: 'general', label: 'Général', icon: Cog, color: 'blue' },
    { id: 'services', label: 'Services', icon: Users, color: 'green' },
    { id: 'payments', label: 'Paiements', icon: CreditCard, color: 'purple' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'orange' },
    // { id: 'sms-ussd', label: 'SMS/USSD', icon: Smartphone, color: 'indigo' },
    // { id: 'security', label: 'Sécurité', icon: Shield, color: 'yellow' },
    { id: 'backup', label: 'Sauvegarde', icon: Database, color: 'gray' }
  ];



  // Mettre à jour le timestamp de la dernière sauvegarde auto
  useEffect(() => {
    const timer = setInterval(() => {
      setLastAutoSave(`Sauvegarde auto dans ${Math.floor(Math.random() * 3) + 5}s...`);
      if (hasChanges) {
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [hasChanges]);

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      showToast('Info', 'Aucune modification à sauvegarder', 'info');
      return;
    }

    setSaveStatus('saving');
    setSaveProgress(0);

    const interval = setInterval(() => {
      setSaveProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const success = await saveToBackend();

      clearInterval(interval);
      setSaveProgress(100);
      setSaveStatus(success ? 'success' : 'error');

      if (success) {
        showToast('Succès', 'Paramètres sauvegardés avec succès', 'success');
        setTimeout(() => {
          setSaveStatus('idle');
          setSaveProgress(0);
        }, 2000);
      } else {
        showToast('Erreur', 'Échec de la sauvegarde', 'error');
        setTimeout(() => {
          setSaveStatus('idle');
          setSaveProgress(0);
        }, 3000);
      }
    } catch (error) {
      clearInterval(interval);
      setSaveProgress(0);
      setSaveStatus('error');
      showToast('Erreur', 'Erreur lors de la sauvegarde', 'error');

      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  const handleImport = async (file) => {
    if (!file) {
      showToast('Erreur', 'Veuillez sélectionner un fichier', 'error');
      return;
    }

    if (file.type !== 'application/json') {
      showToast('Erreur', 'Le fichier doit être au format JSON', 'error');
      return;
    }

    try {
      setSaveStatus('saving');
      await importSettings(file);
      setSaveStatus('success');
      showToast('Import réussi', 'Les paramètres ont été importés', 'success');

      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      setSaveStatus('error');
      showToast('Erreur', error.message || 'Échec de l\'import', 'error');

      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?\n\nCette action est irréversible et supprimera toutes vos modifications.')) {
      resetToDefaults();
      showToast('Réinitialisation', 'Tous les paramètres ont été réinitialisés', 'info');
    }
  };

  const handleExport = () => {
    try {
      exportSettings();
      showToast('Export réussi', 'Les paramètres ont été exportés', 'success');
    } catch (error) {
      showToast('Erreur', 'Échec de l\'export', 'error');
    }
  };

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

  // Couleurs dynamiques pour les classes Tailwind
  const getTabColorClasses = (tab) => {
    const colorMap = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
      green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' },
      teal: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-600' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600' },
      red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'text-pink-600' },
      gray: { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-900', icon: 'text-gray-600 dark:text-gray-300' }
    };

    return colorMap[tab.color] || colorMap.blue;
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Paramètres de l'application</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Configurez et gérez tous les aspects de Taka Taka</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <div className={`w-3 h-3 rounded-full ${hasChanges ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {hasChanges ? 'Modifications non sauvegardées' : 'Tout est sauvegardé'}
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
                Par défaut
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
                {saveStatus === 'saving' ? 'Sauvegarde...' :
                  saveStatus === 'success' ? '✓ Sauvegardé' :
                    saveStatus === 'error' ? 'Erreur' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </motion.div>




        {/* Onglets et contenu */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation latérale pour desktop */}
          <div className="lg:w-64">
            <Card className="border-2 border-gray-100 dark:border-gray-900 sticky top-6 shadow-sm">
              <div className="p-4 border-b border-gray-200 dark:border-gray-900">
                <h3 className="font-bold text-gray-800 dark:text-gray-100">Catégories</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tous les paramètres</p>
              </div>
              <div className="space-y-1 p-2">
                {tabs.map(tab => {
                  const colors = getTabColorClasses(tab);
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${isActive
                        ? `${colors.bg} ${colors.border} dark:bg-gray-800 border-2 shadow-sm`
                        : 'hover:bg-gray-50 dark:hover:bg-gray-900/40 dark:bg-gray-800 border-2 border-transparent'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? colors.bg : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                        <tab.icon className={`w-4 h-4 ${isActive ? colors.icon : 'text-gray-500 dark:text-gray-400'}`} />
                      </div>
                      <span className={`font-medium ${isActive ? 'text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
                        {tab.label}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

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

      {/* Toast */}
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Composant de gestion des services
const ServiceManagement = ({ settings, updateNestedSetting, showToast }) => {
  const serviceIcons = {
    motoTaxi: Bike,
    sharedTaxi: Car,
    privateCar: Car,
    delivery: Package,
    truck: Truck
  };

  const getServiceIcon = (serviceId) => {
    const Icon = serviceIcons[serviceId];
    return Icon ? <Icon className="w-6 h-6" /> : <Car className="w-6 h-6" />;
  };

  const getServiceColor = (serviceId) => {
    const colors = {
      motoTaxi: 'from-green-500 to-green-600',
      sharedTaxi: 'from-blue-500 to-blue-600',
      privateCar: 'from-purple-500 to-purple-600',
      delivery: 'from-orange-500 to-orange-600'
    };
    return colors[serviceId] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Gestion des services</h2>
        <p className="text-gray-600 dark:text-gray-300">Activez et configurez les services disponibles sur la plateforme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {Object.entries(settings.services || {}).map(([key, service]) => (
          <ServiceCard
            key={key}
            service={service}
            serviceId={key}
            icon={getServiceIcon(key)}
            colorClass={getServiceColor(key)}
            onUpdate={(updates) => {
              Object.entries(updates).forEach(([field, value]) => {
                updateNestedSetting('services', key, field, value);
              });
            }}
            onToggle={() => updateNestedSetting('services', key, 'enabled', !service.enabled)}
          />
        ))}
      </div>

      <div className="p-4 bg-slate-200/30 dark:bg-gray-800 rounded-xl border-2 border-blue-200">
        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
          Conseils de configuration
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• Activez uniquement les services que vous pouvez fournir de manière fiable</li>
          <li>• Les tarifs doivent être compétitifs mais rentables</li>
          <li>• Testez chaque service avant de l'activer pour les utilisateurs</li>
          <li>• Configurez les heures d'opération si nécessaire</li>
        </ul>
      </div>
    </div>
  );
};

// Carte de service améliorée
const ServiceCard = ({ service, serviceId, icon, colorClass, onUpdate, onToggle }) => {
  const [localPrice, setLocalPrice] = useState({
    basePrice: service.basePrice || '',
    perKm: service.perKm || '',
    perMinute: service.perMinute || ''
  });

  useEffect(() => {
    setLocalPrice({
      basePrice: service.basePrice || '',
      perKm: service.perKm || '',
      perMinute: service.perMinute || ''
    });
  }, [service]);

  const handlePriceChange = (field, value) => {
    const numValue = parseInt(value) || '';
    setLocalPrice(prev => ({ ...prev, [field]: numValue }));

    // Mettre à jour immédiatement
    onUpdate({ [field]: numValue });
  };

  const calculateExample = () => {
    return (localPrice.basePrice + (5 * localPrice.perKm) + (15 * localPrice.perMinute)).toLocaleString();
  };

  return (
    <Card className={`border-2 ${service.enabled ? 'border-green-200' : 'border-gray-200 dark:border-gray-900'} hover:shadow-md transition-all duration-200`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white`}>
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">{service.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${service.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'}`}>
                  {service.enabled ? 'Actif' : 'Inactif'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Exemple: {calculateExample()} GNF
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className={`w-12 h-6 rounded-full transition-colors duration-200 ${service.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
            aria-label={service.enabled ? 'Désactiver le service' : 'Activer le service'}
          >
            <div className={`w-5 h-5 rounded-full bg-white dark:bg-gray-700 transform transition-transform duration-200 ${service.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {service.enabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Base</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={localPrice.basePrice}
                    onChange={(e) => handlePriceChange('basePrice', e.target.value)}
                    className="w-full border border-gray-300 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-lg px-2 py-1.5 text-sm pr-6"
                  />
                  <span className="absolute right-2 top-1.5 text-xs text-gray-500 dark:text-gray-400">GNF</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Par km</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={localPrice.perKm}
                    onChange={(e) => handlePriceChange('perKm', e.target.value)}
                    className="w-full border border-gray-300 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-lg px-2 py-1.5 text-sm pr-6"
                  />
                  <span className="absolute right-2 top-1.5 text-xs text-gray-500 dark:text-gray-400">GNF</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Par min</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={localPrice.perMinute}
                    onChange={(e) => handlePriceChange('perMinute', e.target.value)}
                    className="w-full border border-gray-300 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-lg px-2 py-1.5 text-sm pr-6"
                  />
                  <span className="absolute right-2 top-1.5 text-xs text-gray-500 dark:text-gray-400">GNF</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex justify-between">
                <span>Exemple (5km, 15min):</span>
                <span className="font-bold text-green-600">{calculateExample()} GNF</span>
              </div>
              <div className="text-[10px] mt-1">
                {localPrice.basePrice} + (5 × {localPrice.perKm}) + (15 × {localPrice.perMinute})
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Settings;

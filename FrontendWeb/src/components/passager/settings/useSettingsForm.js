import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../../services/apiClient';

export const useSettingsForm = () => {
  const { i18n } = useTranslation();

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

    // Si c'est la langue : changer immédiatement toute la plateforme
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

  return {
    settings, setSettings,
    resetKey,
    toggleSetting, updatePreference,
    showSaveConfirm, setShowSaveConfirm,
    showCancelConfirm, setShowCancelConfirm,
    showDeleteAccount, setShowDeleteAccount,
    handleSave, handleCancel, handleDeleteAccount,
  };
};

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from '../../../../context/NotificationContext';

export const useSettingsSave = ({ hasChanges, saveToBackend, importSettings, resetToDefaults, addNotification }) => {
  const { t } = useTranslation();
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [lastAutoSave, setLastAutoSave] = useState(null);

  // Mettre à jour le timestamp de la dernière sauvegarde auto
  useEffect(() => {
    const timer = setInterval(() => {
      setLastAutoSave(`Sauvegarde auto dans ${Math.floor(Math.random() * 3) + 5}s...`);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const showToast = (title, message, type = 'success') => {
    addNotification({
      title,
      message,
      type: type === 'error' ? NOTIFICATION_TYPES.ERROR :
        type === 'warning' ? NOTIFICATION_TYPES.WARNING :
          type === 'info' ? NOTIFICATION_TYPES.INFO : NOTIFICATION_TYPES.SUCCESS,
      category: NOTIFICATION_CATEGORIES.SYSTEM
    });
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
        // Harmonisé avec le message du serveur pour le dédoublonnage
        addNotification({
          title: t('settings.system_update_title'),
          message: t('settings.system_update_msg'),
          type: NOTIFICATION_TYPES.SUCCESS,
          category: NOTIFICATION_CATEGORIES.SYSTEM
        });

        setTimeout(() => {
          setSaveStatus('idle');
          setSaveProgress(0);
        }, 2000);
      } else {
        showToast(t('common.error'), t('settings.save_failed'), 'error');
        setTimeout(() => {
          setSaveStatus('idle');
          setSaveProgress(0);
        }, 3000);
      }
    } catch (error) {
      clearInterval(interval);
      setSaveProgress(0);
      setSaveStatus('error');
      showToast(t('common.error'), t('settings.save_error'), 'error');

      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  const handleImport = async (file) => {
    if (!file) {
      showToast(t('common.error'), t('settings.select_file_error'), 'error');
      return;
    }

    if (file.type !== 'application/json') {
      showToast(t('common.error'), t('settings.json_format_error'), 'error');
      return;
    }

    try {
      setSaveStatus('saving');
      await importSettings(file);
      setSaveStatus('success');
      showToast(t('settings.import_success_title'), t('settings.import_success_msg'), 'success');

      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      setSaveStatus('error');
      showToast(t('common.error'), error.message || t('settings.import_failed'), 'error');

      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  const handleReset = () => {
    if (window.confirm(t('settings.reset_confirm_msg'))) {
      resetToDefaults();
      showToast(t('settings.reset_title'), t('settings.reset_all_success'), 'info');
    }
  };

  return {
    saveProgress,
    saveStatus,
    lastAutoSave,
    showToast,
    handleSave,
    handleImport,
    handleReset,
  };
};

import { Car, Motorbike, Store } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { socketService } from '../services/socketService';

export const useSettings = (initialSettings = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState(null);

  // Structure par défaut complète
  const getDefaultSettings = () => ({
    // Général
    platform: {
      name: 'Taka Taka',
      logo: null,
      tagline: 'Votre transport, notre priorité',
      currency: 'GNF',
      timezone: 'Africa/Conakry',
      language: 'fr',
      country: 'GN',
      companyAddress: '',
      contactEmail: 'contact@takataka.com',
      contactPhone: '+224 000 000 000',
      website: 'https://takataka.com',
      maintenanceMode: false,
      maintenanceMessage: 'Plateforme en maintenance. Veuillez réessayer plus tard.'
    },

    // Services
    services: {
      motoTaxi: {
        id: 'motoTaxi',
        name: 'Moto-taxi',
        icon: Motorbike,
        color: 'green',
        basePrice: 5000,
        perKm: 1500,
        perMinute: 300,
        minimumFare: 5000,
        enabled: true,
        description: 'Service de moto-taxi économique et rapide'
      },
      sharedTaxi: {
        id: 'sharedTaxi',
        name: 'Taxi partagé',
        icon: Car,
        color: 'blue',
        basePrice: 10000,
        perKm: 2000,
        perMinute: 400,
        minimumFare: 10000,
        enabled: true,
        description: 'Taxi partagé pour plusieurs passagers'
      },
      privateCar: {
        id: 'privateCar',
        name: 'Voiture privée',
        icon: Car,
        color: 'purple',
        basePrice: 15000,
        perKm: 2500,
        perMinute: 500,
        minimumFare: 15000,
        enabled: true,
        description: 'Voiture privée avec chauffeur'
      },
      delivery: {
        id: 'delivery',
        name: 'Livraison',
        icon: Store,
        color: 'orange',
        basePrice: 3000,
        perKm: 1000,
        perMinute: 200,
        minimumFare: 3000,
        enabled: false,
        description: 'Service de livraison de colis'
      }
    },

    // Paiements
    payments: {
      methods: {
        cash: { enabled: true, minAmount: 1000 },
        orangeMoney: {
          enabled: true,
          commission: 2.5,
          apiKey: '',
          username: '',
          sandbox: true
        },
        mtnMoney: {
          enabled: true,
          commission: 2.5,
          apiKey: '',
          userId: '',
          sandbox: true
        },
        stripe: {
          enabled: false,
          commission: 3.5,
          publicKey: '',
          secretKey: ''
        }
      },
      autoWithdrawal: {
        enabled: true,
        threshold: 50000,
        schedule: 'daily'
      }
    },

    // Notifications
    notifications: {
      channels: {
        whatsapp: {
          enabled: true,
          template: 'Bonjour {customer_name}, votre course #{ride_id} est confirmée! 🚗\nChauffeur: {driver_name}\nVéhicule: {vehicle_type}\nPrix: {amount} GNF',
          businessAccountId: ''
        },
        sms: {
          enabled: false,
          provider: 'africastalking',
          apiKey: '',
          senderId: 'TAKATAKA'
        },
        email: {
          enabled: true,
          provider: 'smtp',
          smtp: {
            host: '',
            port: 587,
            username: '',
            password: '',
            encryption: 'tls'
          }
        },
        push: {
          enabled: true,
          firebaseConfig: {}
        }
      },
      types: {
        ride_created: true,
        ride_accepted: true,
        ride_completed: true,
        payment_received: true,
        promotion: false,
        system: true
      }
    },

    // Sécurité
    security: {
      authentication: {
        requirePhoneVerification: true,
        requireEmailVerification: false,
        twoFactorEnabled: false,
        sessionTimeout: 30
      },
      permissions: {
        admin: ['*'],
        driver: ['rides.view', 'rides.accept', 'profile.update'],
        customer: ['rides.create', 'rides.view', 'payment.make']
      },
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 100,
        blockDuration: 15
      },
      cors: {
        enabled: true,
        allowedOrigins: ['https://takataka.com']
      }
    },

    // Configuration SMS/USSD
    smsUssd: {
      shortCode: '8000',
      keywords: {
        register: 'REG',
        balance: 'BAL',
        help: 'HELP'
      },
      autoResponse: {
        welcome: 'Bienvenue sur Taka Taka! Pour vous inscrire, envoyez REG au 8000',
        balance: 'Votre solde est de {balance} GNF'
      }
    },

    // Métadonnées
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0'
    },
    ...initialSettings
  });

  const [settings, setSettings] = useState(getDefaultSettings());

  // Helper pour fusion profonde simple
  const deepMerge = (target, source) => {
    const output = { ...target };
    if (source && typeof source === 'object') {
      Object.keys(source).forEach(key => {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  };

  // Charger les paramètres depuis le backend au montage
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await adminService.getParametres();
        if (response.data && response.data.data) {
          const backendSettings = response.data.data;
          setSettings(prev => deepMerge(prev, backendSettings));
          localStorage.setItem('takataka_settings', JSON.stringify(backendSettings));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        const savedSettings = localStorage.getItem('takataka_settings');
        if (savedSettings) {
          try {
            setSettings(prev => deepMerge(prev, JSON.parse(savedSettings)));
          } catch (e) {
            console.error('Erreur parsing local settings', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // ✅ Synchronisation en temps réel via Socket.IO
  useEffect(() => {
    const handleSettingsUpdate = () => {
      console.log('🔄 [SETTINGS] Mise à jour détectée via Socket, actualisation...');

      // Refetch from backend to get latest values
      adminService.getParametres()
        .then(response => {
          if (response.data && response.data.data) {
            const backendSettings = response.data.data;
            setSettings(prev => deepMerge(prev, backendSettings));
            localStorage.setItem('takataka_settings', JSON.stringify(backendSettings));
          }
        })
        .catch(err => console.error('Erreur sync settings:', err));
    };

    socketService.on('platform:settings:updated', handleSettingsUpdate);

    return () => {
      socketService.off('platform:settings:updated', handleSettingsUpdate);
    };
  }, []);

  // ✅ Mise à jour du titre du document (onglet navigateur)
  useEffect(() => {
    const platformName = settings?.platform?.name || 'Taka Taka';
    document.title = platformName;
  }, [settings?.platform?.name]);

  // Fonction de mise à jour profonde immutable
  const setDeep = (obj, path, value) => {
    const keys = path.split('.');
    const output = { ...obj };
    let current = output;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current[key] = { ...current[key] };
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return output;
  };

  const updateSetting = useCallback((path, value) => {
    setSettings(prev => {
      const newSettings = setDeep(prev, path, value);

      if (newSettings.metadata) {
        newSettings.metadata = {
          ...newSettings.metadata,
          updatedAt: new Date().toISOString()
        };
      }

      return newSettings;
    });

    setHasChanges(true);

    if (saveTimeout) clearTimeout(saveTimeout);

    const timeoutId = setTimeout(() => {
      setSettings(current => {
        localStorage.setItem('takataka_settings', JSON.stringify(current));
        return current;
      });
    }, 2000);

    setSaveTimeout(timeoutId);
  }, [saveTimeout]);

  const updateNestedSetting = useCallback((category, key, subKey, value) => {
    updateSetting(`${category}.${key}.${subKey}`, value);
  }, [updateSetting]);

  const batchUpdate = useCallback((updates) => {
    setSettings(prev => {
      let current = { ...prev };
      updates.forEach(({ path, value }) => {
        current = setDeep(current, path, value);
      });

      if (current.metadata) {
        current.metadata = {
          ...current.metadata,
          updatedAt: new Date().toISOString()
        };
      }

      return current;
    });

    setHasChanges(true);
    if (saveTimeout) clearTimeout(saveTimeout);

    const timeoutId = setTimeout(() => {
      setSettings(current => {
        localStorage.setItem('takataka_settings', JSON.stringify(current));
        return current;
      });
    }, 2000);

    setSaveTimeout(timeoutId);
  }, [saveTimeout]);

  const resetToDefaults = useCallback(() => {
    const defaults = getDefaultSettings();
    setSettings(defaults);
    setHasChanges(true);
    localStorage.setItem('takataka_settings', JSON.stringify(defaults));

    if (saveTimeout) clearTimeout(saveTimeout);
  }, [saveTimeout]);

  const exportSettings = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `takataka_settings_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [settings]);

  const importSettings = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setSettings(prev => deepMerge(prev, imported));
          setHasChanges(true);
          if (saveTimeout) clearTimeout(saveTimeout);
          resolve();
        } catch (error) {
          reject(new Error('Fichier JSON invalide'));
        }
      };
      reader.readAsText(file);
    });
  }, [saveTimeout]);

  const saveToBackend = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.updateParametres(settings);

      if (response.data.success) {
        localStorage.setItem('takataka_settings', JSON.stringify(settings));
        setHasChanges(false);
        if (saveTimeout) clearTimeout(saveTimeout);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur API lors de la sauvegarde:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return {
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
  };
};
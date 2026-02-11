// src/hooks/useSettings.js
import { Car, Motorbike, Store } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

export const useSettings = (initialSettings = {}) => {
   const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
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
        icon:  Motorbike,
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
        icon:  Car,
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


   const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('takataka_settings');
    return savedSettings 
      ? JSON.parse(savedSettings)
      : getDefaultSettings();
  });

  // Fonctions de mise à jour
  const updateSetting = useCallback((path, value) => {
    setSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      
      return {
        ...newSettings,
        metadata: {
          ...newSettings.metadata,
          updatedAt: new Date().toISOString()
        }
      };
    });
    
    // Marquer comme modifié
    setHasChanges(true);
    
    // Annuler le timeout précédent s'il existe
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Programmer la sauvegarde automatique après 3 secondes d'inactivité
    const timeoutId = setTimeout(() => {
      localStorage.setItem('takataka_settings', JSON.stringify(settings));
      setHasChanges(false); // SEULEMENT après la sauvegarde automatique
    }, 5000);
    
    setSaveTimeout(timeoutId);
  }, [settings, saveTimeout]);

  const updateNestedSetting = useCallback((category, key, subKey, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: {
          ...prev[category][key],
          [subKey]: value
        }
      },
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString()
      }
    }));
    
    // Marquer comme modifié
    setHasChanges(true);
    
    // Annuler le timeout précédent
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Programmer la sauvegarde automatique
    const timeoutId = setTimeout(() => {
      localStorage.setItem('takataka_settings', JSON.stringify(settings));
      setHasChanges(false);
    }, 3000);
    
    setSaveTimeout(timeoutId);
  }, [settings, saveTimeout]);

  // Batch update
  const batchUpdate = useCallback((updates) => {
    setSettings(prev => {
      let newSettings = { ...prev };
      updates.forEach(({ path, value }) => {
        const keys = path.split('.');
        let current = newSettings;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
      });
      
      return {
        ...newSettings,
        metadata: {
          ...newSettings.metadata,
          updatedAt: new Date().toISOString()
        }
      };
    });
    
    setHasChanges(true);
    
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeoutId = setTimeout(() => {
      localStorage.setItem('takataka_settings', JSON.stringify(settings));
      setHasChanges(false);
    }, 3000);
    
    setSaveTimeout(timeoutId);
  }, [settings, saveTimeout]);

  // Reset complet
  const resetToDefaults = useCallback(() => {
    const defaults = getDefaultSettings();
    localStorage.setItem('takataka_settings', JSON.stringify(defaults));
    setSettings(defaults);
    setHasChanges(false);
    
    // Annuler tout timeout en cours
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
  }, [saveTimeout]);

  // Export/Import
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
          if (!imported.platform || !imported.services) {
            throw new Error('Format de fichier invalide');
          }
          
          setSettings({
            ...imported,
            metadata: {
              ...imported.metadata,
              updatedAt: new Date().toISOString()
            }
          });
          localStorage.setItem('takataka_settings', JSON.stringify(imported));
          setHasChanges(false);
          
          // Annuler tout timeout en cours
          if (saveTimeout) {
            clearTimeout(saveTimeout);
          }
          
          resolve();
        } catch (error) {
          reject(new Error('Fichier JSON invalide'));
        }
      };
      reader.readAsText(file);
    });
  }, [saveTimeout]);

  // Sauvegarde manuelle (bouton "Sauvegarder")
  const saveToBackend = async () => {
    setIsLoading(true);
    try {
      // Sauvegarder immédiatement dans localStorage
      localStorage.setItem('takataka_settings', JSON.stringify(settings));
      
      // Simuler un appel API (1 seconde)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Marquer comme sauvegardé
      setHasChanges(false);
      
      // Annuler tout timeout en cours
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur API:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Nettoyer le timeout lors du démontage
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
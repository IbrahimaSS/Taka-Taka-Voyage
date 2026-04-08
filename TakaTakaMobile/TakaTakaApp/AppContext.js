import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { getTheme } from './constants/theme';

import { translations } from './constants/translations';

const STORAGE_KEYS = {
    DARK_MODE: 'appDarkMode',
    LANGUAGE: 'appLanguage',
    MAINTENANCE: 'appMaintenanceMode',
    BRANDING: 'appBranding',
    RIDE_DRAFT: 'appRideDraft',
    USER: 'user', // Match authService storage
};

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState('fr');

    // Fonction de traduction
    const t = (key) => {
        return translations[language]?.[key] || translations['fr']?.[key] || key;
    };

    const [preferencesLoaded, setPreferencesLoaded] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [pendingRideIntent, setPendingRideIntent] = useState(false); // AJOUTÉ
    const [navigationIntent, setNavigationIntent] = useState(null); // AJOUTÉ : Pour naviguer vers des onglets spécifiques
    const [rideDraft, setRideDraft] = useState({ pickup: '', destination: '' }); // AJOUTÉ
    const [branding, setBrandingState] = useState({ platformName: 'Taka-Taka Voyage', slogan: 'Déplacements intelligents en Guinée' });
    const [user, setUser] = useState(null);

    const [paymentMethods, setPaymentMethods] = useState([
        {
            id: 1,
            type: 'credit_card',
            number: '**** **** **** 1234',
            name: 'Carte Visa',
            isDefault: true,
            expiry: '12/25',
        },
        {
            id: 2,
            type: 'mobile_money',
            number: '+224 621 00 00 00',
            name: 'Orange Money',
            isDefault: false,
            provider: 'Orange',
        },
        {
            id: 3,
            type: 'mobile_money',
            number: '+224 622 11 11 11',
            name: 'MTN Mobile Money',
            isDefault: false,
            provider: 'MTN',
        },
    ]);

    const [benefits, setBenefits] = useState([
        {
            id: 1,
            title: 'Réductions sur les trajets',
            description: '10% de réduction sur tous les trajets le weekend',
            icon: 'percent',
            isActive: true,
            expiry: '31/12/2024',
        },
        {
            id: 2,
            title: 'Annulation gratuite',
            description: 'Annulez votre trajet sans frais jusqu\'à 5 minutes avant',
            icon: 'close-circle',
            isActive: true,
            expiry: 'Indéfini',
        },
        {
            id: 3,
            title: 'Support prioritaire',
            description: 'Accès au support client en moins de 5 minutes',
            icon: 'headset',
            isActive: true,
            expiry: 'Indéfini',
        },
        {
            id: 4,
            title: 'Trajet offert',
            description: '1 trajet offert tous les 10 trajets',
            icon: 'gift',
            isActive: true,
            progress: 8, // 8/10
        },
    ]);

    const languages = {
        fr: { code: 'fr', name: 'Français', nativeName: 'Français' },
        en: { code: 'en', name: 'Anglais', nativeName: 'English' },
        ml: { code: 'ml', name: 'Malinké', nativeName: 'Mandenkan' },
        sus: { code: 'sus', name: 'Sousous', nativeName: 'Sosoxui' },
        pul: { code: 'pul', name: 'Pular', nativeName: 'Pular' },
    };

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const [savedDarkMode, savedLanguage, savedMaintenance, savedBranding, savedRideDraft, savedUser] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE),
                    AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
                    AsyncStorage.getItem(STORAGE_KEYS.MAINTENANCE),
                    AsyncStorage.getItem(STORAGE_KEYS.BRANDING),
                    AsyncStorage.getItem(STORAGE_KEYS.RIDE_DRAFT),
                    AsyncStorage.getItem(STORAGE_KEYS.USER),
                ]);
                if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true');
                if (savedLanguage !== null) {
                    setLanguage(savedLanguage);
                } else {
                    const deviceLocale = (Localization.getLocales?.()?.[0]?.languageCode || 'fr').toLowerCase();
                    const supported = ['fr', 'en', 'ml', 'sus', 'pul'];
                    if (supported.includes(deviceLocale)) setLanguage(deviceLocale);
                    else if (deviceLocale.startsWith('en')) setLanguage('en');
                    else if (deviceLocale.startsWith('fr')) setLanguage('fr');
                }
                if (savedMaintenance !== null) setMaintenanceMode(savedMaintenance === 'true');
                if (savedBranding) try { setBrandingState(JSON.parse(savedBranding)); } catch (_) { }
                if (savedRideDraft) try { setRideDraft(JSON.parse(savedRideDraft)); } catch (_) { }
                if (savedUser) try { setUser(JSON.parse(savedUser)); } catch (_) { }
            } catch (error) {
                console.error('Erreur chargement préférences:', error);
            } finally {
                setPreferencesLoaded(true);
            }
        };
        loadPreferences();
    }, []);

    useEffect(() => {
        if (!preferencesLoaded) return;
        const savePreferences = async () => {
            try {
                await Promise.all([
                    AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, String(darkMode)),
                    AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language),
                    AsyncStorage.setItem(STORAGE_KEYS.MAINTENANCE, String(maintenanceMode)),
                    AsyncStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(branding)),
                    AsyncStorage.setItem(STORAGE_KEYS.RIDE_DRAFT, JSON.stringify(rideDraft)),
                    AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
                ]);
            } catch (error) {
                console.error('Erreur sauvegarde préférences:', error);
            }
        };
        savePreferences();
    }, [darkMode, language, maintenanceMode, branding, rideDraft, user, preferencesLoaded]);

    const setBranding = (data) => setBrandingState(prev => ({ ...prev, ...data }));

    const toggleDarkMode = (forceValue) => {
        if (typeof forceValue === 'boolean') {
            setDarkMode(forceValue);
        } else {
            setDarkMode(prev => !prev);
        }
    };

    const changeLanguage = (langCode) => {
        setLanguage(langCode);
    };

    const updateUser = (userData) => {
        if (!userData) return setUser(null);
        setUser(prev => prev ? ({ ...prev, ...userData }) : userData);
    };

    const addPaymentMethod = (method) => {
        setPaymentMethods(prev => [...prev, method]);
    };

    const removePaymentMethod = (id) => {
        setPaymentMethods(prev => prev.filter(method => method.id !== id));
    };

    const setDefaultPaymentMethod = (id) => {
        setPaymentMethods(prev =>
            prev.map(method => ({
                ...method,
                isDefault: method.id === id
            }))
        );
    };

    const theme = getTheme(darkMode);

    const value = {
        darkMode,
        theme,
        language,
        t, // Export de la fonction de traduction
        maintenanceMode,
        branding,
        user,
        paymentMethods,
        benefits,
        languages,
        toggleDarkMode,
        changeLanguage,
        setMaintenanceMode,
        setBranding,
        updateUser,
        addPaymentMethod,
        removePaymentMethod,
        setDefaultPaymentMethod,
        pendingRideIntent,
        setPendingRideIntent,
        rideDraft,
        setRideDraft,
        navigationIntent,
        setNavigationIntent,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
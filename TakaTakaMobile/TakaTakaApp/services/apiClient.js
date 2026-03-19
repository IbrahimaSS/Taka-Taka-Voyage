import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://taka-taka-voyage.onrender.com/api').trim();

/**
 * Client API universel utilisant fetch pour React Native.
 * Gère automatiquement l'ajout du jeton d'authentification et le formatage JSON.
 */
export const apiClient = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;

    // Récupérer le token depuis le stockage local
    const token = await AsyncStorage.getItem('authToken');

    const defaultHeaders = {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    // Timeout de 120 secondes (Render peut être très lent au démarrage)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const config = {
        ...options,
        headers: defaultHeaders,
        signal: controller.signal
    };

    // Si data est présent, le transformer en JSON string
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = {};
        }

        if (!response.ok) {
            // Gérer le 401 (non autorisé)
            if (response.status === 401) {
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('user');
            }
            
            // Extraire le message d'erreur le plus pertinent
            let errorMessage = data.message || 'Une erreur est survenue';
            
            // Si le backend renvoie une liste d'erreurs de validation
            if (data.erreurs && Array.isArray(data.erreurs) && data.erreurs.length > 0) {
                errorMessage = data.erreurs[0].msg || data.erreurs[0].message || errorMessage;
            }
            
            return { error: errorMessage, status: response.status, ...data };
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('API Client Error:', error);
        if (error.name === 'AbortError') {
            return { error: 'Le serveur met trop de temps à répondre (Timeout)' };
        }
        return { error: 'Erreur de connexion au serveur. Vérifiez votre internet.' };
    }
};

export const API_ROUTES = {
    auth: {
        login: '/auth/connexion',
        me: '/auth/me',
        logout: '/auth/logout',
        initInscription: '/auth/init-inscription',
        verifyOtp: '/auth/verifier-otp',
        finaliserInscription: '/auth/finaliser-inscription',
    },
    // Ajoutez d'autres routes au besoin, calquées sur le backend
};

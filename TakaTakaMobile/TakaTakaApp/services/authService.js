import { apiClient, API_ROUTES } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Normalise l'objet utilisateur pour le frontend mobile
 */
const normalizeUser = (rawUser) => {
    if (!rawUser) return null;

    // Récupération de l'URL de base pour les images
    let BASE_URL = process.env.EXPO_PUBLIC_API_URL || '';
    if (BASE_URL.endsWith('/api')) {
        BASE_URL = BASE_URL.substring(0, BASE_URL.length - 4);
    } else if (BASE_URL.endsWith('/api/')) {
        BASE_URL = BASE_URL.substring(0, BASE_URL.length - 5);
    }

    let photo = rawUser.photo || rawUser.photoUrl || rawUser.avatar || null;
    if (photo && typeof photo === 'string' && !photo.startsWith('http')) {
        const cleanPath = photo.startsWith('/') ? photo : `/${photo}`;
        const finalBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
        photo = `${finalBase}${cleanPath}`;
    }

    return {
        ...rawUser,
        name: `${rawUser.prenom || ''} ${rawUser.nom || ''}`.trim() || 'Utilisateur',
        photo: photo,
        phone: rawUser.telephone || '',
        // Priorité aux stats étendues si elles existent
        rating: rawUser.rating || rawUser.noteMoyenne || 5,
        trips: rawUser.trips || rawUser.nombreTrajets || 0,
        memberSince: rawUser.createdAt || rawUser.membreDepuis || new Date().toISOString()
    };
};

export const authService = {
    /**
     * Connecte l'utilisateur et récupère son profil complet
     */
    login: async (email, password, otpCode = null, deviceId = null) => {
        let finalDeviceId = deviceId || await AsyncStorage.getItem('deviceId');

        const body = { identifiant: email, motDePasse: password };
        if (otpCode) body.otpCode = otpCode;
        if (finalDeviceId) body.deviceId = finalDeviceId;

        const response = await apiClient(API_ROUTES.auth.login, {
            method: 'POST',
            body: body,
        });

        if (response.deviceId) {
            await AsyncStorage.setItem('deviceId', response.deviceId);
        }

        if (response.succes && response.token) {
            await AsyncStorage.setItem('authToken', response.token);

            // On tente de récupérer le profil complet tout de suite pour avoir les stats
            let fullUser = response.utilisateur;
            try {
                const profileRes = await apiClient('/passager/profile/profil');
                if (profileRes.succes && profileRes.profil) {
                    fullUser = { ...fullUser, ...profileRes.profil };

                    // On peut aussi tenter les stats de trajet
                    const statsRes = await apiClient('/passager/profile/stats');
                    if (statsRes.succes && statsRes.stats) {
                        fullUser = {
                            ...fullUser,
                            trips: statsRes.stats.trips,
                            rating: statsRes.stats.averageRating
                        };
                    }
                }
            } catch (e) {
                console.warn('Could not fetch extended profile stats:', e);
            }

            const normalizedUser = normalizeUser(fullUser);
            await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
            return { succes: true, user: normalizedUser };
        }

        if (response.requires2FA) return { requires2FA: true, ...response };
        return { succes: false, error: response.error || response.message || 'Identifiants invalides' };
    },

    /**
     * Récupère les infos complètes de l'utilisateur courant
     */
    getCurrentUser: async () => {
        try {
            // On récupère d'abord l'ID de base
            const response = await apiClient(API_ROUTES.auth.me);
            if (!response.succes) return null;

            let fullUser = response.utilisateur;

            // On tente systématiquement de récupérer le profil étendu (stats, date inscription)
            try {
                const profileRes = await apiClient('/passager/profile/profil');
                if (profileRes.succes && profileRes.profil) {
                    fullUser = { ...fullUser, ...profileRes.profil };
                }

                const statsRes = await apiClient('/passager/profile/stats');
                if (statsRes.succes && statsRes.stats) {
                    fullUser = {
                        ...fullUser,
                        trips: statsRes.stats.trips,
                        rating: statsRes.stats.averageRating
                    };
                }
            } catch (e) {
                console.warn('Extended profile fetch failed', e);
            }

            const normalizedUser = normalizeUser(fullUser);
            await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
            return normalizedUser;
        } catch (error) {
            return null;
        }
    },

    logout: async () => {
        try {
            await apiClient(API_ROUTES.auth.logout, { method: 'POST' });
        } catch (e) { }
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
    }
};

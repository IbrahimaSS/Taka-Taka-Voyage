import { useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

/**
 * Hook pour obtenir la position actuelle de l'utilisateur.
 * Retourne getCurrentLocation() qui résout avec la région { latitude, longitude, latitudeDelta, longitudeDelta }
 * ou affiche une alerte et lance en cas d'erreur.
 * Le composant appelant gère lui-même (setState) loading, départ, région, marqueurs.
 */
export const useLocation = () => {
    const getCurrentLocation = useCallback(async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                "Permission refusée",
                "L'application a besoin de votre localisation pour fonctionner correctement."
            );
            return null;
        }

        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            return newRegion;
        } catch (error) {
            Alert.alert("Erreur", "Impossible d'obtenir votre position");
            console.error(error);
            throw error;
        }
    }, []);

    return { getCurrentLocation };
};

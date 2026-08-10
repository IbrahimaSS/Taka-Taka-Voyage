import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import UserLocationMap from '../../maps/UserLocationMap';
import { GeolocationService } from '../../../services/geolocation';

// Composant de localisation en temps réel
const LocationCard = () => {
    const { t } = useTranslation();
    const [userLocation, setUserLocation] = useState({
        lat: 9.6412, // Conakry, Guinée par défaut
        lng: -13.5784,
        address: "Conakry, Guinée"
    });
    const [isLoading, setIsLoading] = useState(true);

    // Obtenir la position de l'utilisateur
    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const position = await GeolocationService.getCurrentPosition();
                setUserLocation({
                    lat: position.lat,
                    lng: position.lng,
                    address: t('dashboard.current_position')
                });
            } catch (error) {
                console.log("Erreur de géolocalisation:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocation();
    }, [t]);

    if (isLoading) {
        return (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">{t('dashboard.locating_msg')}</p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* En-tête */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-500/5 to-green-500/5">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('dashboard.position_guinea')}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {userLocation.address} | {userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°
                    </p>
                </div>

                {/* Carte OpenStreetMap */}
                <div className="relative h-72 sm:h-96">
                    <UserLocationMap lat={userLocation.lat} lng={userLocation.lng} height={384} />
                </div>
            </div>
        </div>
    );
};

export default LocationCard;

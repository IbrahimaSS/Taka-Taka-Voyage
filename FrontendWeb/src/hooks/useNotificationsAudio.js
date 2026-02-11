/**
 * useNotifications.js
 * Hook personnalisé pour gérer les notifications sonores et les vibrations
 */

import { useCallback, useRef, useEffect } from 'react';

// URL du son de notification (utilise un son système ou un fichier local)
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export const useNotifications = () => {
    const audioRef = useRef(null);
    const hasPermission = useRef(false);

    // Initialiser l'audio au montage
    useEffect(() => {
        audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
        audioRef.current.volume = 0.7;

        // Demander la permission pour les notifications système
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                hasPermission.current = permission === 'granted';
            });
        } else if (Notification.permission === 'granted') {
            hasPermission.current = true;
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    /**
     * Jouer le son de notification
     */
    const playNotificationSound = useCallback(() => {
        if (audioRef.current) {
            // Remettre au début si déjà en lecture
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(error => {
                console.warn('[Notifications] Impossible de jouer le son:', error.message);
            });
        }
    }, []);

    /**
     * Arrêter le son de notification
     */
    const stopNotificationSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    /**
     * Faire vibrer l'appareil (si supporté)
     * @param {number|number[]} pattern - Durée ou pattern de vibration en ms
     */
    const vibrate = useCallback((pattern = 200) => {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch (error) {
                console.warn('[Notifications] Vibration non supportée:', error.message);
            }
        }
    }, []);

    /**
     * Afficher une notification système
     * @param {string} title - Titre de la notification
     * @param {Object} options - Options de la notification
     */
    const showSystemNotification = useCallback((title, options = {}) => {
        if (!('Notification' in window)) {
            console.warn('[Notifications] Notifications non supportées');
            return null;
        }

        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: options.tag || 'default',
                requireInteraction: options.requireInteraction || false,
                silent: options.silent || false,
                ...options
            });

            // Fermer automatiquement après un délai
            if (options.autoClose !== false) {
                setTimeout(() => {
                    notification.close();
                }, options.duration || 10000);
            }

            return notification;
        }

        return null;
    }, []);

    /**
     * Notification complète (son + vibration + système)
     * @param {string} title - Titre de la notification
     * @param {Object} options - Options
     */
    const notifyNewTrip = useCallback((tripData) => {
        // Jouer le son
        playNotificationSound();

        // Faire vibrer (pattern: vibrer 200ms, pause 100ms, vibrer 200ms)
        vibrate([200, 100, 200]);

        // Notification système si l'app est en arrière-plan
        if (document.hidden && hasPermission.current) {
            showSystemNotification('Nouvelle course disponible !', {
                body: `${tripData.passengerName}\n${tripData.pickupAddress} → ${tripData.destinationAddress}\n${tripData.estimatedFare?.toLocaleString('fr-FR')} GNF`,
                tag: `trip-${tripData.id}`,
                requireInteraction: true,
                data: tripData,
            });
        }
    }, [playNotificationSound, vibrate, showSystemNotification]);

    /**
     * Notification de course acceptée
     */
    const notifyTripAccepted = useCallback(() => {
        vibrate(100);
    }, [vibrate]);

    /**
     * Demander la permission pour les notifications
     */
    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            hasPermission.current = permission === 'granted';
            return hasPermission.current;
        } catch (error) {
            console.error('[Notifications] Erreur lors de la demande de permission:', error);
            return false;
        }
    }, []);

    return {
        playNotificationSound,
        stopNotificationSound,
        vibrate,
        showSystemNotification,
        notifyNewTrip,
        notifyTripAccepted,
        requestPermission,
        hasPermission: hasPermission.current,
    };
};

export default useNotifications;

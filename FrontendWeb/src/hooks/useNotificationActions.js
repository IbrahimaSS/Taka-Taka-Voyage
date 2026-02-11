/**
 * useNotificationActions.js
 * Enhanced hook for triggering actor-specific notifications with full UI/Audio/Vibrate support.
 */

import { useCallback } from 'react';
import { useNotificationCenter, NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from '../context/NotificationContext';
import useNotifications from './useNotificationsAudio'; // The legacy sound/vibrate hook

export const useNotificationActions = () => {
    const { addNotification } = useNotificationCenter();
    const { playNotificationSound, vibrate } = useNotifications();

    /**
     * Generic trigger with full effects
     */
    const trigger = useCallback((data) => {
        // 1. Add to context (State + Persistence + Toast)
        const id = addNotification(data);

        // 2. Play sound based on type/priority
        if (data.type === NOTIFICATION_TYPES.URGENT || data.priority === 'high') {
            playNotificationSound();
            vibrate([400, 200, 400]);
        } else {
            vibrate(100);
        }

        return id;
    }, [addNotification, playNotificationSound, vibrate]);

    // --- PASSENGER ACTIONS ---
    const passenger = {
        notifyTripFound: (driverName) => trigger({
            actor: 'passenger',
            category: NOTIFICATION_CATEGORIES.TRIP,
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Chauffeur trouvé !',
            message: `${driverName} a accepté votre course et arrive vers vous.`,
            link: '/passager/suivi',
            priority: 'high'
        }),
        notifyTripStarted: () => trigger({
            actor: 'passenger',
            category: NOTIFICATION_CATEGORIES.TRIP,
            type: NOTIFICATION_TYPES.INFO,
            title: 'Course démarrée',
            message: 'Bon voyage ! Votre trajet vers votre destination a commencé.'
        }),
        notifyPaymentSuccess: (amount) => trigger({
            actor: 'passenger',
            category: NOTIFICATION_CATEGORIES.PAYMENT,
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Paiement confirmé',
            message: `Votre paiement de ${amount} GNF a été traité avec succès.`,
            link: '/passager/paiements',
            metadata: { price: amount }
        }),
        notifyArrival: () => trigger({
            actor: 'passenger',
            category: NOTIFICATION_CATEGORIES.TRIP,
            type: NOTIFICATION_TYPES.INFO,
            title: 'Chauffeur arrivé',
            message: 'Votre chauffeur est au point de prise en charge.',
            priority: 'high'
        })
    };

    // --- DRIVER ACTIONS ---
    const driver = {
        notifyNewTrip: (pickup, price) => trigger({
            actor: 'driver',
            category: NOTIFICATION_CATEGORIES.TRIP,
            type: NOTIFICATION_TYPES.URGENT,
            title: 'Nouvelle demande !',
            message: `Trajet disponible : ${pickup}.`,
            link: '/chauffeur/trips',
            metadata: { price },
            priority: 'high'
        }),
        notifyTripCancelled: () => trigger({
            actor: 'driver',
            category: NOTIFICATION_CATEGORIES.TRIP,
            type: NOTIFICATION_TYPES.ERROR,
            title: 'Course annulée',
            message: 'Le passager a annulé la demande.',
            priority: 'high'
        }),
        notifyPayoutAvailable: (amount) => trigger({
            actor: 'driver',
            category: NOTIFICATION_CATEGORIES.FINANCIAL,
            type: NOTIFICATION_TYPES.SUCCESS,
            title: 'Gains disponibles',
            message: `Vous pouvez retirer ${amount} GNF maintenant.`,
            link: '/chauffeur/revenues',
            metadata: { price: amount }
        })
    };

    // --- ADMIN ACTIONS ---
    const admin = {
        notifyEmergency: (id) => trigger({
            actor: 'admin',
            category: NOTIFICATION_CATEGORIES.EMERGENCY,
            type: NOTIFICATION_TYPES.URGENT,
            title: 'ALERTE URGENCE !',
            message: `Le bouton d'urgence a été activé sur le trajet #${id}. Intervenez immédiatement !`,
            priority: 'high'
        }),
        notifyNewDriver: (name) => trigger({
            actor: 'admin',
            category: NOTIFICATION_CATEGORIES.MODERATION,
            type: NOTIFICATION_TYPES.INFO,
            title: 'Nouveau chauffeur',
            message: `${name} vient de soumettre ses documents pour validation.`
        })
    };

    return {
        trigger,
        passenger,
        driver,
        admin
    };
};

export default useNotificationActions;

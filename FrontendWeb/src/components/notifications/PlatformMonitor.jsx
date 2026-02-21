import React, { useEffect, useState } from 'react';
import { socketService } from '../../services/socketService';
import { useNotificationCenter, NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import MaintenanceOverlay from './MaintenanceOverlay';
import { toast } from 'react-hot-toast';

/**
 * PlatformMonitor
 * Composant invisible (sauf maintenance) qui écoute les événements globaux de la plateforme.
 * Notifie les utilisateurs des changements de services, de prix et du mode maintenance.
 */
const PlatformMonitor = () => {
    const { addNotification } = useNotificationCenter();
    const { settings, isLoading } = useSettings();
    const { user } = useAuth();
    const [maintenance, setMaintenance] = useState({
        isActive: false,
        message: ''
    });

    // On ne bloque QUE si l'utilisateur n'est pas un admin
    const isAdmin = user?.role === 'ADMIN';

    // ── État initial depuis les paramètres chargés ──
    useEffect(() => {
        if (!isLoading && settings?.platform?.maintenanceMode) {
            setMaintenance({
                isActive: true,
                message: settings.platform.maintenanceMessage || 'La plateforme est momentanément indisponible.'
            });
        }
    }, [isLoading, settings?.platform?.maintenanceMode, settings?.platform?.maintenanceMessage]);

    useEffect(() => {
        // ── 1. Mode Maintenance ──
        const onMaintenanceOn = (data) => {
            console.log('🔧 [PLATFORM] Maintenance ACTIVÉE', data);
            setMaintenance({
                isActive: true,
                message: data.message
            });

            addNotification({
                type: NOTIFICATION_TYPES.URGENT,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: '⚠️ Maintenance en cours',
                message: data.message || 'La plateforme est momentanément indisponible.',
                priority: 'high'
            });
        };

        const onMaintenanceOff = (data) => {
            console.log('✅ [PLATFORM] Maintenance TERMINÉE', data);
            setMaintenance({ isActive: false, message: '' });

            addNotification({
                type: NOTIFICATION_TYPES.SUCCESS,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: '✅ Plateforme disponible',
                message: data.message || 'La maintenance est terminée. Merci de votre patience !',
                priority: 'high'
            });
        };

        // ── 2. Services (Activation/Désactivation) ──
        const onServiceDesactive = (data) => {
            console.log('🚫 [PLATFORM] Service désactivé', data);
            addNotification({
                type: NOTIFICATION_TYPES.WARNING,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: `Service ${data.nom} suspendu`,
                message: data.message,
                priority: 'high'
            });
        };

        const onServiceActive = (data) => {
            console.log('✅ [PLATFORM] Service activé', data);
            addNotification({
                type: NOTIFICATION_TYPES.SUCCESS,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: `Service ${data.nom} disponible`,
                message: data.message,
            });
        };

        // ── 3. Tarification ──
        const onTarifsUpdated = (data) => {
            console.log('💰 [PLATFORM] Tarifs mis à jour', data);
            addNotification({
                type: NOTIFICATION_TYPES.INFO,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: 'Mise à jour des tarifs 💰',
                message: data.message,
            });
        };

        // ── 4. Méthodes de Paiement ──
        const onPaymentDesactive = (data) => {
            console.log('🚫 [PLATFORM] Paiement désactivé', data);
            addNotification({
                type: NOTIFICATION_TYPES.WARNING,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: `Paiement ${data.nom} suspendu`,
                message: data.message,
                priority: 'high'
            });
        };

        const onPaymentActive = (data) => {
            console.log('✅ [PLATFORM] Paiement activé', data);
            addNotification({
                type: NOTIFICATION_TYPES.SUCCESS,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: `Paiement ${data.nom} disponible`,
                message: data.message,
            });
        };

        // ── 5. Changements généraux ──
        const onSettingsUpdated = (data) => {
            console.log('⚙️ [PLATFORM] Paramètres mis à jour', data);
            addNotification({
                type: NOTIFICATION_TYPES.INFO,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: 'Mise à jour système',
                message: data.message || 'Les paramètres de la plateforme ont été mis à jour.',
            });
        };

        // Enregistrement des listeners
        socketService.on('platform:maintenance:on', onMaintenanceOn);
        socketService.on('platform:maintenance:off', onMaintenanceOff);
        socketService.on('platform:service:desactive', onServiceDesactive);
        socketService.on('platform:service:active', onServiceActive);
        socketService.on('platform:service:tarifs_mis_a_jour', onTarifsUpdated);
        socketService.on('platform:payment:desactive', onPaymentDesactive);
        socketService.on('platform:payment:active', onPaymentActive);
        socketService.on('platform:settings:updated', onSettingsUpdated);

        // Nettoyage au démontage
        return () => {
            socketService.off('platform:maintenance:on', onMaintenanceOn);
            socketService.off('platform:maintenance:off', onMaintenanceOff);
            socketService.off('platform:service:desactive', onServiceDesactive);
            socketService.off('platform:service:active', onServiceActive);
            socketService.off('platform:service:tarifs_mis_a_jour', onTarifsUpdated);
            socketService.off('platform:payment:desactive', onPaymentDesactive);
            socketService.off('platform:payment:active', onPaymentActive);
            socketService.off('platform:settings:updated', onSettingsUpdated);
        };
    }, [addNotification]);

    return (
        <MaintenanceOverlay
            isVisible={maintenance.isActive && !isAdmin}
            message={maintenance.message}
        />
    );
};

export default PlatformMonitor;

// src/hooks/usePlatformNotifications.js
// Écoute les événements Socket.IO de la plateforme :
//   - Mode maintenance activé/désactivé
//   - Service activé/désactivé
import { useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import socketService from '../services/socketService';

/**
 * Hook à monter AU NIVEAU ROOT de chaque application (passager, chauffeur, admin)
 *
 * @param {Object} options
 * @param {Function} options.onMaintenanceOn   - Appelé quand la maintenance est activée { message }
 * @param {Function} options.onMaintenanceOff  - Appelé quand la maintenance est désactivée
 * @param {Function} options.onServiceChange   - Appelé quand un service change { serviceId, nom, message, enabled }
 */
const usePlatformNotifications = ({
    onMaintenanceOn,
    onMaintenanceOff,
    onServiceChange,
} = {}) => {

    const handleMaintenanceOn = useCallback((data) => {
        console.log('🔧 [PLATFORM] Maintenance activée (hook):', data);
        onMaintenanceOn?.(data);
    }, [onMaintenanceOn]);

    const handleMaintenanceOff = useCallback((data) => {
        console.log('✅ [PLATFORM] Maintenance terminée (hook):', data);
        onMaintenanceOff?.(data);
    }, [onMaintenanceOff]);

    const handleServiceDesactive = useCallback((data) => {
        console.log('🚫 [PLATFORM] Service désactivé:', data);
        toast(data.message || `Le service "${data.nom}" est désactivé`, {
            id: `service-off-${data.serviceId}`,
            duration: 8000,
            icon: '⚠️',
            style: {
                background: '#1a1a2e',
                color: '#fbbf24',
                border: '1px solid #fbbf24',
                fontWeight: '500',
            },
        });
        onServiceChange?.({ ...data, enabled: false });
    }, [onServiceChange]);

    const handleServiceActive = useCallback((data) => {
        console.log('✅ [PLATFORM] Service réactivé:', data);
        // Fermer l'éventuel toast "désactivé" correspondant
        toast.dismiss(`service-off-${data.serviceId}`);
        toast.success(data.message || `Le service "${data.nom}" est disponible !`, {
            id: `service-on-${data.serviceId}`,
            duration: 6000,
            icon: '✅',
        });
        onServiceChange?.({ ...data, enabled: true });
    }, [onServiceChange]);

    useEffect(() => {
        socketService.on('platform:maintenance:on', handleMaintenanceOn);
        socketService.on('platform:maintenance:off', handleMaintenanceOff);
        socketService.on('platform:service:desactive', handleServiceDesactive);
        socketService.on('platform:service:active', handleServiceActive);

        return () => {
            socketService.off('platform:maintenance:on', handleMaintenanceOn);
            socketService.off('platform:maintenance:off', handleMaintenanceOff);
            socketService.off('platform:service:desactive', handleServiceDesactive);
            socketService.off('platform:service:active', handleServiceActive);
        };
    }, [handleMaintenanceOn, handleMaintenanceOff, handleServiceDesactive, handleServiceActive]);
};

export default usePlatformNotifications;

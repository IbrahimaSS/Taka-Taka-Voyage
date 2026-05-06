import React, { useEffect, useState } from 'react';
import { socketService } from '../../services/socketService';
import { useNotificationCenter, NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import MaintenanceOverlay from './MaintenanceOverlay';

/**
 * PlatformMonitor
 * Composant invisible (sauf maintenance) qui écoute les événements globaux de la plateforme.
 * Notifie les utilisateurs des changements de services, de prix et du mode maintenance.
 */
const PlatformMonitor = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { addNotification } = useNotificationCenter();
    const { settings, isLoading } = useSettings();
    const { user } = useAuth();

    const [maintenance, setMaintenance] = useState({
        isActive: false,
        message: ''
    });

    // NOUVEAU: Compte à rebours avant blocage brutal
    const [countdown, setCountdown] = useState(null);
    const [pendingMessage, setPendingMessage] = useState('');
    const prevMaintenanceMode = React.useRef(false);

    // Chemins autorisés même en maintenance (pour permettre à l'admin de se connecter)
    const allowedPaths = ['/connexion', '/login', '/admin/login'];
    const isAllowedPath = allowedPaths.some(path => location.pathname.startsWith(path));

    // On ne bloque QUE si l'utilisateur n'est pas un admin ET qu'on n'est pas sur une page autorisée
    const isAdmin = user?.role === 'ADMIN';
    const shouldShowOverlay = maintenance.isActive && !isAdmin && !isAllowedPath;

    // ── Gestion du compte à rebours ──
    useEffect(() => {
        if (countdown === null) return;
        if (countdown > 0) {
            const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timerId);
        } else {
            // Fin du compte à rebours -> Activation de l'overlay de maintenance
            setMaintenance({
                isActive: true,
                message: pendingMessage
            });
            setCountdown(null);
        }
    }, [countdown, pendingMessage]);

    // ── État depuis les paramètres chargés ──
    useEffect(() => {
        if (isLoading) return;

        const currentMode = settings?.platform?.maintenanceMode;
        const msg = settings?.platform?.maintenanceMessage || t('notifications.platform_notifications.maintenance_on_msg');

        if (currentMode && !prevMaintenanceMode.current) {
            // Le mode vient de s'activer pendant que l'utilisateur est en ligne !
            if (!isAdmin && !isAllowedPath && countdown === null && !maintenance.isActive) {
                setPendingMessage(msg);
                setCountdown(10); // Déclenchement du compte à rebours 10s
            } else if (isAdmin || isAllowedPath) {
                setMaintenance({ isActive: true, message: msg });
            }
        } else if (!currentMode && prevMaintenanceMode.current) {
            // Le mode vient de se désactiver
            setMaintenance({ isActive: false, message: '' });
            setCountdown(null);
        } else if (currentMode && !maintenance.isActive && countdown === null) {
            // Cas du rechargement de la page : déjà en maintenance, on bloque tout de suite
            setMaintenance({ isActive: true, message: msg });
        }

        prevMaintenanceMode.current = !!currentMode;
    }, [isLoading, settings?.platform?.maintenanceMode, settings?.platform?.maintenanceMessage, t, isAdmin, isAllowedPath, maintenance.isActive, countdown]);

    useEffect(() => {
        // ── 1. Mode Maintenance (Sockets) ──
        const onMaintenanceOn = (data) => {
            console.log('🔧 [PLATFORM] Maintenance DECLENCHEE (Socket)', data);

            // Le frontend captera ça via le sync des settings aussi, mais si on veut réagir plus vite:
            if (!maintenance.isActive && countdown === null && !isAdmin && !isAllowedPath) {
                setPendingMessage(data.message || t('notifications.platform_notifications.maintenance_on_msg'));
                setCountdown(10);
            }

            addNotification({
                type: NOTIFICATION_TYPES.URGENT,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: t('notifications.platform_notifications.maintenance_on_title'),
                message: data.message || t('notifications.platform_notifications.maintenance_on_msg'),
                priority: 'high'
            });
        };

        const onMaintenanceOff = (data) => {
            console.log('✅ [PLATFORM] Maintenance TERMINÉE (Socket)', data);
            setMaintenance({ isActive: false, message: '' });
            setCountdown(null);

            addNotification({
                type: NOTIFICATION_TYPES.SUCCESS,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: t('notifications.platform_notifications.maintenance_off_title'),
                message: data.message || t('notifications.platform_notifications.maintenance_off_msg'),
                priority: 'high'
            });
        };

        // ── 2. Services (Activation/Désactivation) ──
        const onServiceDesactive = (data) => {
            console.log('🚫 [PLATFORM] Service désactivé', data);
            addNotification({
                type: NOTIFICATION_TYPES.WARNING,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: t('notifications.platform_notifications.service_suspended_title', { name: data.nom }),
                message: data.message,
                priority: 'high'
            });
        };

        const onServiceActive = (data) => {
            console.log('✅ [PLATFORM] Service activé', data);
            addNotification({
                type: NOTIFICATION_TYPES.SUCCESS,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: t('notifications.platform_notifications.service_available_title', { name: data.nom }),
                message: data.message,
            });
        };

        // ── 3. Tarification ──
        const onTarifsUpdated = (data) => {
            console.log('💰 [PLATFORM] Tarifs mis à jour', data);
            addNotification({
                type: NOTIFICATION_TYPES.INFO,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: t('notifications.platform_notifications.price_updated_title'),
                message: data.message,
            });
        };

        // ── 4. Méthodes de Paiement ──
        const onPaymentDesactive = (data) => {
            console.log('🚫 [PLATFORM] Paiement désactivé', data);
            addNotification({
                type: NOTIFICATION_TYPES.WARNING,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: t('notifications.platform_notifications.payment_suspended_title', { name: data.nom }),
                message: data.message,
                priority: 'high'
            });
        };

        const onPaymentActive = (data) => {
            console.log('✅ [PLATFORM] Paiement activé', data);
            addNotification({
                type: NOTIFICATION_TYPES.SUCCESS,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: t('notifications.platform_notifications.payment_available_title', { name: data.nom }),
                message: data.message,
            });
        };

        // ── 5. Changements généraux ──
        const onSettingsUpdated = (data) => {
            console.log('⚙️ [PLATFORM] Paramètres mis à jour', data);
            addNotification({
                type: NOTIFICATION_TYPES.INFO,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: t('notifications.platform_notifications.settings_updated_title'),
                message: data.message || t('notifications.platform_notifications.settings_updated_msg'),
            });
        };

        // ── 6. Locations (Baraka Trans) ──
        const onNouvelleLocation = (data) => {
            if (isAdmin) {
                console.log('🚗 [PLATFORM] Nouvelle demande de location', data);
                const audio = new Audio('/sounds/notification.mp3');
                audio.play().catch(e => console.warn("Erreur audio:", e));
                addNotification({
                    type: NOTIFICATION_TYPES.INFO,
                    category: NOTIFICATION_CATEGORIES.SYSTEM,
                    title: "🚗 Nouvelle Location",
                    message: data.message,
                    priority: 'high'
                });
            }
        };

        const onLocationStatutChange = (data) => {
            console.log('📝 [PLATFORM] Statut location mis à jour', data);
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(e => console.warn("Erreur audio:", e));
            addNotification({
                type: data.statut === 'ANNULÉE' ? NOTIFICATION_TYPES.ERROR : NOTIFICATION_TYPES.SUCCESS,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: "Location Mise à jour",
                message: data.message,
                priority: 'high'
            });
        };

        // ── 7. Communauté ──
        const onNouveauCommentaire = (data) => {
            console.log('💬 [COMMUNITY] Nouveau commentaire', data);
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(e => console.warn("Erreur audio:", e));
            addNotification({
                type: NOTIFICATION_TYPES.INFO,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: "💬 Nouveau commentaire",
                message: data.message,
                priority: 'normal'
            });
        };

        const onNouveauMessageDirect = (data) => {
            console.log('✉️ [COMMUNITY] Nouveau message direct', data);
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(e => console.warn("Erreur audio:", e));
            addNotification({
                type: NOTIFICATION_TYPES.INFO,
                category: NOTIFICATION_CATEGORIES.SYSTEM,
                title: "✉️ Nouveau message",
                message: `Vous avez reçu un message de ${data.expediteur?.prenom}`,
                priority: 'high',
                link: '/community' // Ou un paramètre pour ouvrir le hub
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
        socketService.on('location:nouvelle_demande', onNouvelleLocation);
        socketService.on('location:statut_change', onLocationStatutChange);
        socketService.on('community:nouveau_commentaire', onNouveauCommentaire);
        socketService.on('community:nouveau_message', onNouveauMessageDirect);

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
            socketService.off('location:nouvelle_demande', onNouvelleLocation);
            socketService.off('location:statut_change', onLocationStatutChange);
            socketService.off('community:nouveau_commentaire', onNouveauCommentaire);
            socketService.off('community:nouveau_message', onNouveauMessageDirect);
        };
    }, [addNotification, t]);

    return (
        <>
            <MaintenanceOverlay
                isVisible={shouldShowOverlay}
                message={maintenance.message}
            />
            {countdown !== null && (
                <div className="fixed top-4 left-4 z-[9999] bg-[#dc2626] backdrop-blur-md border-2 border-red-400/50 p-5 rounded-2xl shadow-2xl flex items-start gap-4 text-white pointer-events-none transition-all duration-500 w-[90%] max-w-[400px]">
                    <div className="bg-white/20 p-3 rounded-full flex-shrink-0 mt-1 animate-pulse">
                        <span className="text-2xl" role="img" aria-label="warning">⚠️</span>
                    </div>
                    <div className="flex-1 text-left">
                        <h1 className="text-lg font-extrabold tracking-tight mb-1.5 drop-shadow-md">
                            Maintenance Imminente
                        </h1>
                        <p className="text-sm font-medium text-red-50 leading-relaxed mb-3 drop-shadow-sm">
                            La plateforme va se verrouiller pour une mise à jour. Merci de finaliser vos actions en cours.
                        </p>
                        <div className="flex items-center gap-3 bg-red-900/40 rounded-xl p-3 border border-red-400/20">
                            <div className="flex-1 text-xs font-bold uppercase tracking-wider text-red-200">
                                Verrouillage dans :
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="inline-block font-black text-3xl tabular-nums text-white leading-none">{countdown}</span>
                                <span className="text-xs font-bold text-red-200">sec</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PlatformMonitor;

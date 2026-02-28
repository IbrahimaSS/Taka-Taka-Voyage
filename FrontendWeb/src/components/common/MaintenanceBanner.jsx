// src/components/common/MaintenanceBanner.jsx
// Bannière globale de maintenance — affichée par-dessus toute l'interface
// quand l'admin active le mode maintenance via Socket.IO
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Wifi, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import socketService from '../../services/socketService';

const MaintenanceBanner = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { user } = useAuth();
    const [maintenanceData, setMaintenanceData] = useState(null); // null = pas de maintenance

    // Chemins autorisés même en maintenance
    const allowedPaths = ['/connexion', '/login', '/admin/login'];
    const isAllowedPath = allowedPaths.some(path => location.pathname.startsWith(path));
    const isAdmin = user?.role === 'ADMIN';

    // On ne montre la bannière QUE si on n'est pas admin et pas sur un chemin autorisé
    const shouldShowBanner = maintenanceData && !isAdmin && !isAllowedPath;

    useEffect(() => {
        const handleOn = (data) => {
            setMaintenanceData(data);
        };

        const handleOff = () => {
            setMaintenanceData(null);
        };

        socketService.on('platform:maintenance:on', handleOn);
        socketService.on('platform:maintenance:off', handleOff);

        return () => {
            socketService.off('platform:maintenance:on', handleOn);
            socketService.off('platform:maintenance:off', handleOff);
        };
    }, []);

    return (
        <AnimatePresence>
            {shouldShowBanner && (
                <motion.div
                    key="maintenance-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 99999,
                        background: 'rgba(10, 10, 20, 0.96)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                        style={{
                            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
                            border: '1px solid rgba(255, 107, 107, 0.35)',
                            borderRadius: '24px',
                            padding: '48px 40px',
                            maxWidth: '480px',
                            width: '100%',
                            textAlign: 'center',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,107,107,0.1)',
                        }}
                    >
                        {/* Icone animée */}
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, -5, 5, 0],
                            }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                            style={{
                                width: '88px',
                                height: '88px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 183, 77, 0.2))',
                                border: '2px solid rgba(255, 107, 107, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                            }}
                        >
                            <AlertTriangle style={{ width: '44px', height: '44px', color: '#ff6b6b' }} />
                        </motion.div>

                        {/* Titre */}
                        <h2 style={{
                            fontSize: '26px',
                            fontWeight: '800',
                            color: '#ffffff',
                            marginBottom: '12px',
                            letterSpacing: '-0.5px',
                        }}>
                            {t('maintenance.title')}
                        </h2>

                        {/* Logo / nom de la plateforme */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '100px',
                            padding: '4px 16px',
                            marginBottom: '20px',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                            <span style={{ fontSize: '13px', color: '#a0a0c0', fontWeight: '600' }}>
                                🚖 Taka Taka
                            </span>
                        </div>

                        {/* Message */}
                        <p style={{
                            fontSize: '15px',
                            color: '#9090b0',
                            lineHeight: '1.7',
                            marginBottom: '32px',
                        }}>
                            {maintenanceData.message}
                        </p>

                        {/* Animation "en cours" */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            color: '#fbbf24',
                            fontSize: '13px',
                            fontWeight: '600',
                            marginBottom: '24px',
                        }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                            >
                                <RefreshCw style={{ width: '16px', height: '16px' }} />
                            </motion.div>
                            {t('maintenance.working_msg')}
                        </div>

                        {/* Tip */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <Wifi style={{ width: '14px', height: '14px', color: '#6b7280', flexShrink: 0 }} />
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, textAlign: 'left' }}>
                                {t('maintenance.eta')}
                            </p>
                        </div>

                        {/* Lien Admin */}
                        <div style={{ marginTop: '32px' }}>
                            <Link
                                to="/connexion"
                                style={{
                                    color: 'rgba(255,255,255,0.25)',
                                    fontSize: '11px',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Lock size={12} />
                                Accès administration
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MaintenanceBanner;

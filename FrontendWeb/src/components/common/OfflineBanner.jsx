import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineBanner = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [showRestored, setShowRestored] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            setShowRestored(true);
            setTimeout(() => setShowRestored(false), 3000);
        };
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    style={{ zIndex: 999999 }}
                    className="fixed top-0 left-0 right-0 bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-3 shadow-2xl border-b border-white/20"
                >
                    <WifiOff size={20} className="animate-pulse" />
                    <span className="text-sm font-bold uppercase tracking-wider">
                        Connexion perdue. Taka-Taka enregistre vos données en local...
                    </span>
                </motion.div>
            )}

            {showRestored && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    style={{ zIndex: 999999 }}
                    className="fixed top-0 left-0 right-0 bg-green-600 text-white py-2 px-4 flex items-center justify-center gap-3 shadow-2xl"
                >
                    <Wifi size={20} />
                    <span className="text-sm font-bold uppercase tracking-wider">
                        Connexion rétablie ! Synchronisation effectuée.
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfflineBanner;

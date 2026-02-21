import React from 'react';
import { Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MaintenanceOverlay = ({ isVisible, message }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md"
                >
                    <div className="max-w-md w-full text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary-500/30 shadow-2xl shadow-primary-500/20"
                        >
                            <Settings className="w-12 h-12 text-primary-500" />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-bold text-white mb-4 tracking-tight"
                        >
                            Maintenance en cours
                        </motion.h1>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-slate-300 text-lg mb-8 leading-relaxed"
                        >
                            {message || "La plateforme Taka Taka est momentanément indisponible pour des travaux de maintenance."}
                        </motion.p>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex justify-center"
                        >
                            <div className="px-6 py-2 bg-slate-800/50 rounded-full border border-slate-700 text-slate-400 text-sm flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                </span>
                                Récupération automatique dès que possible
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MaintenanceOverlay;

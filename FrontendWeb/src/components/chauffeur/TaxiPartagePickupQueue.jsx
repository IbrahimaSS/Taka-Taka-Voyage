// src/components/chauffeur/TaxiPartagePickupQueue.jsx
// Composant de file d'attente de ramassage pour le mode Taxi Partagé
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, MapPin, Phone, Navigation, CheckCircle, Clock,
    ArrowRight, AlertCircle, Flag, Car, UserCheck, Loader2
} from 'lucide-react';
import Bttn from '../admin/ui/Bttn';
import Badge from '../admin/ui/Badge';
import Card, { CardHeader, CardTitle, CardContent } from '../admin/ui/Card';
import ConfirmModal from '../admin/ui/ConfirmModal';
import { useDriverContext } from '../../context/DriverContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// Statut visuel pour chaque passager
const getStatutConfig = (statut) => {
    switch (statut) {
        case 'EN_ATTENTE':
            return {
                label: 'En attente',
                color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                icon: Clock,
                dotColor: 'bg-amber-500',
                badgeVariant: 'warning'
            };
        case 'EN_COURS_DE_RAMASSAGE':
            return {
                label: 'En route',
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                icon: Navigation,
                dotColor: 'bg-blue-500 animate-pulse',
                badgeVariant: 'info'
            };
        case 'RAMASSE':
            return {
                label: 'À bord',
                color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                icon: CheckCircle,
                dotColor: 'bg-emerald-500',
                badgeVariant: 'success'
            };
        default:
            return {
                label: 'Inconnu',
                color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                icon: AlertCircle,
                dotColor: 'bg-gray-500',
                badgeVariant: 'default'
            };
    }
};

const TaxiPartagePickupQueue = () => {
    const navigate = useNavigate();
    const {
        groupeTaxiPartage,
        fileRamassageTP,
        peutDemarrerTP,
        passagersEnAttenteTP,
        passagersRamassesTP,
        enRoutePassagerTP,
        signalerRamassageTP,
        demarrerTrajetTP,
        getEtatGroupeTP,
        tripStep,
    } = useDriverContext();

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: '',
        action: null,
        title: '',
        message: ''
    });

    // Rafraîchir l'état au montage
    useEffect(() => {
        if (groupeTaxiPartage?._id) {
            getEtatGroupeTP(groupeTaxiPartage._id);
        }
    }, []);

    const totalPassagers = fileRamassageTP.length;
    const ramasses = fileRamassageTP.filter(p => p.statut === 'RAMASSE').length;
    const enAttente = fileRamassageTP.filter(p => p.statut === 'EN_ATTENTE').length;
    const enCours = fileRamassageTP.filter(p => p.statut === 'EN_COURS_DE_RAMASSAGE').length;

    // Prochain passager à récupérer
    const prochainPassager = fileRamassageTP.find(
        p => p.statut === 'EN_ATTENTE' || p.statut === 'EN_COURS_DE_RAMASSAGE'
    );

    const handleEnRoute = (reservationId) => {
        setConfirmModal({
            isOpen: true,
            type: 'info',
            action: () => enRoutePassagerTP(reservationId),
            title: 'Rejoindre le passager',
            message: 'Confirmer que vous êtes en route vers ce passager ?'
        });
    };

    const handleRamassage = (reservationId) => {
        setConfirmModal({
            isOpen: true,
            type: 'success',
            action: () => signalerRamassageTP(reservationId),
            title: 'Passager ramassé',
            message: 'Confirmer que ce passager est à bord du véhicule ?'
        });
    };

    const handleDemarrer = () => {
        setConfirmModal({
            isOpen: true,
            type: 'success',
            action: () => {
                demarrerTrajetTP();
                navigate('/chauffeur/live-tracking');
            },
            title: '🚀 Démarrer le trajet',
            message: 'Tous les passagers sont à bord. Voulez-vous démarrer le trajet principal ?'
        });
    };

    const handleConfirmAction = () => {
        if (confirmModal.action) confirmModal.action();
        setConfirmModal({ isOpen: false, type: '', action: null, title: '', message: '' });
    };

    if (!groupeTaxiPartage || fileRamassageTP.length === 0) {
        return (
            <Card className="max-w-2xl mx-auto" animate>
                <CardContent className="text-center p-8">
                    <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <CardTitle size="lg" className="mb-2">Aucun groupe actif</CardTitle>
                    <p className="text-gray-500 dark:text-gray-400">
                        Acceptez des réservations de type Taxi Partagé pour commencer.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-4xl mx-auto"
        >
            {/* Header avec statistiques */}
            <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <Car className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Taxi Partagé</h2>
                                <p className="text-purple-200 text-sm">
                                    Ramassage séquentiel • {groupeTaxiPartage?.capaciteMax || '?'} places max
                                </p>
                            </div>
                        </div>
                        <Badge variant={peutDemarrerTP ? "success" : "warning"} className="text-sm px-3 py-1">
                            {peutDemarrerTP ? "✅ Prêt à partir" : `⏳ ${passagersEnAttenteTP} en attente`}
                        </Badge>
                    </div>

                    {/* Barre de progression */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-purple-200">Progression du ramassage</span>
                            <span className="font-bold">{ramasses}/{totalPassagers} passagers</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                            <motion.div
                                className="bg-emerald-400 h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: totalPassagers > 0 ? `${(ramasses / totalPassagers) * 100}%` : '0%' }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold">{enAttente}</p>
                            <p className="text-xs text-purple-200">En attente</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold">{enCours}</p>
                            <p className="text-xs text-purple-200">En route</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold">{ramasses}</p>
                            <p className="text-xs text-purple-200">À bord</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* File de ramassage */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle size="lg">📋 File de ramassage</CardTitle>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Ordre de récupération
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {fileRamassageTP.map((passager, index) => {
                            const config = getStatutConfig(passager.statut);
                            const StatusIcon = config.icon;
                            const isNext = prochainPassager?.reservationId === passager.reservationId;
                            const reservationId = passager.reservationId || passager.reservation?._id;

                            return (
                                <motion.div
                                    key={reservationId || index}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${isNext
                                        ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/10 shadow-lg shadow-violet-500/10'
                                        : passager.statut === 'RAMASSE'
                                            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/5'
                                            : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    {/* Badge "Prochain" */}
                                    {isNext && passager.statut !== 'RAMASSE' && (
                                        <div className="absolute -top-3 left-4">
                                            <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                                PROCHAIN
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4">
                                        {/* Numéro d'ordre + indicateur statut */}
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${passager.statut === 'RAMASSE'
                                                ? 'bg-emerald-500 text-white'
                                                : passager.statut === 'EN_COURS_DE_RAMASSAGE'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                }`}>
                                                {passager.statut === 'RAMASSE' ? <CheckCircle className="w-5 h-5" /> : passager.ordre || index + 1}
                                            </div>
                                            <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                                        </div>

                                        {/* Info passager */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                    {passager.passagerNom || 'Passager'}
                                                </h3>
                                                <Badge variant={config.badgeVariant} className="text-xs">
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {config.label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate">{passager.adresseDepart || 'Adresse non disponible'}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                            {passager.statut === 'EN_ATTENTE' && (
                                                <Bttn
                                                    variant="primary"
                                                    size="small"
                                                    icon={Navigation}
                                                    onClick={() => handleEnRoute(reservationId)}
                                                    className="w-full"
                                                >
                                                    Rejoindre
                                                </Bttn>
                                            )}
                                            {passager.statut === 'EN_COURS_DE_RAMASSAGE' && (
                                                <Bttn
                                                    variant="success"
                                                    size="small"
                                                    icon={UserCheck}
                                                    onClick={() => handleRamassage(reservationId)}
                                                    className="w-full"
                                                >
                                                    Ramassé ✓
                                                </Bttn>
                                            )}
                                            {passager.statut === 'RAMASSE' && (
                                                <div className="flex items-center justify-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                                    <CheckCircle className="w-4 h-4" />
                                                    À bord
                                                </div>
                                            )}
                                            {passager.passagerTelephone && (
                                                <Bttn
                                                    variant="outline"
                                                    size="small"
                                                    icon={Phone}
                                                    onClick={() => window.open(`tel:${passager.passagerTelephone}`)}
                                                    className="w-full"
                                                >
                                                    Appeler
                                                </Bttn>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* Bouton Démarrer le trajet */}
            <Card className={`overflow-hidden transition-all duration-500 ${peutDemarrerTP
                ? 'ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/20'
                : 'opacity-80'
                }`}>
                <CardContent className="p-6">
                    {peutDemarrerTP ? (
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 10 }}
                        >
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
                                    <Flag className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                    ✅ Tous les passagers sont à bord !
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    {ramasses} passager{ramasses > 1 ? 's' : ''} récupéré{ramasses > 1 ? 's' : ''}. Prêt à démarrer.
                                </p>
                            </div>
                            <Bttn
                                variant="success"
                                size="large"
                                icon={Flag}
                                onClick={handleDemarrer}
                                fullWidth
                                className="h-16 text-lg font-bold shadow-lg shadow-emerald-500/30"
                            >
                                🚀 Démarrer le trajet
                            </Bttn>
                        </motion.div>
                    ) : (
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                    Ramassage en cours...
                                </span>
                            </div>
                            <Bttn
                                variant="success"
                                size="large"
                                icon={Flag}
                                disabled
                                fullWidth
                                className="h-14 opacity-50 cursor-not-allowed"
                            >
                                Démarrer le trajet ({passagersEnAttenteTP} restant{passagersEnAttenteTP > 1 ? 's' : ''})
                            </Bttn>
                            <p className="text-xs text-gray-400 mt-2">
                                Le bouton s'activera automatiquement quand tous les passagers seront à bord
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de confirmation */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: '', action: null, title: '', message: '' })}
                onConfirm={handleConfirmAction}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Confirmer"
                cancelText="Annuler"
                type={confirmModal.type}
            />
        </motion.div>
    );
};

export default TaxiPartagePickupQueue;

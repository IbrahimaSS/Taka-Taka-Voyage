// src/components/chauffeur/ChauffeurTracking.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Car, User, Phone, ArrowLeft, Clock, Navigation, MapPin,
    Shield, HelpCircle, AlertTriangle, Gauge, CheckCircle,
    Flag, RefreshCw, MessageCircle, Star, ShieldCheck, ChevronLeft,
    XCircle, DollarSign, Activity, Flag as FlagIcon, Map, Users,
    Target, Clock as ClockIcon, TrendingUp
} from 'lucide-react';
import Badge from '../admin/ui/Badge';
import Button from '../admin/ui/Bttn';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import ConfirmModal from '../admin/ui/ConfirmModal';
import { useDriverContext } from '../../context/DriverContext';
import { useNavigate } from 'react-router-dom';
import { leafletIcons, ensureLeafletIcons } from '../maps/leafletIcons';
import MapController from '../maps/MapController';
import { socketService } from '../../services/socketService';

const TrackingMap = ({
    driverLocation,
    acceptedTrips,
    activePickupCoords,
    activeTrip
}) => {
    const [mapReady, setMapReady] = useState(false);
    const isValidLocation = driverLocation && !isNaN(driverLocation.lat) && !isNaN(driverLocation.lng);

    if (!isValidLocation) {
        return (
            <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center p-6">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Position GPS non disponible ou invalide</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10">
            <MapContainer
                center={[driverLocation.lat, driverLocation.lng]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
                whenReady={() => setMapReady(true)}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapController center={[driverLocation.lat, driverLocation.lng]} zoom={15} />

                {/* Marqueur du conducteur */}
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={leafletIcons.driver}>
                    <Popup>
                        <div className="p-2">
                            <p className="font-bold text-emerald-600">Votre Position</p>
                            <p className="text-sm">En ligne et prêt</p>
                        </div>
                    </Popup>
                </Marker>

                {/* Marqueurs des passagers */}
                {acceptedTrips.map(trip => {
                    const isValidPickup = trip.pickupCoords && !isNaN(trip.pickupCoords[0]) && !isNaN(trip.pickupCoords[1]);
                    const isValidDest = trip.destinationCoords && !isNaN(trip.destinationCoords[0]) && !isNaN(trip.destinationCoords[1]);

                    return (
                        <React.Fragment key={trip.id}>
                            {trip.pickupStatus !== 'picked_up' && isValidPickup && (
                                <Marker position={trip.pickupCoords} icon={leafletIcons.user}>
                                    <Popup>
                                        <div className="p-2">
                                            <p className="font-bold text-blue-600">Passager: {trip.passengerName}</p>
                                            <p className="text-sm">{trip.pickupAddress}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                            {isValidDest && (
                                <Marker position={trip.destinationCoords} icon={leafletIcons.end}>
                                    <Popup>
                                        <div className="p-2">
                                            <p className="font-bold text-rose-600">Destination</p>
                                            <p className="text-sm">{trip.destinationAddress}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                        </React.Fragment>
                    );
                })}

                {/* Ligne de trajectoire */}
                {activePickupCoords && !isNaN(activePickupCoords[0]) && !isNaN(activePickupCoords[1]) && (
                    <Polyline
                        positions={[[driverLocation.lat, driverLocation.lng], activePickupCoords]}
                        pathOptions={{
                            color: '#10b981',
                            weight: 4,
                            opacity: 0.8,
                            dashArray: '8, 12',
                            lineCap: 'round'
                        }}
                    />
                )}
            </MapContainer>

            {!mapReady && (
                <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-white text-center">
                        <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg font-semibold">Chargement de la carte...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const PassengerList = ({
    acceptedTrips,
    currentPickupTripId,
    selectPickupTrip,
    tripStep
}) => {
    const pendingTrips = acceptedTrips.filter(t => t.pickupStatus !== 'picked_up');
    const pickedUpTrips = acceptedTrips.filter(t => t.pickupStatus === 'picked_up');

    return (
        <Card className="" hoverable animate>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle size="lg">Liste de ramassage</CardTitle>
                    <Badge variant={pendingTrips.length > 0 ? "warning" : "success"} className='text-xs'>
                        {pendingTrips.length} EN ATTENTE
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {pendingTrips.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            À récupérer
                        </p>
                        <AnimatePresence mode="popLayout">
                            {pendingTrips.map((trip) => (
                                <motion.div
                                    key={trip.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    whileHover={{ scale: 1.01 }}
                                    className={`p-4 rounded-xl border transition-all duration-300 ${currentPickupTripId === trip.id
                                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500/50'
                                        }`}
                                >
                                    <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentPickupTripId === trip.id
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                }`}>
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                                    {trip.passengerName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                                                    {trip.pickupAddress}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <Button
                                                size="small"
                                                variant={currentPickupTripId === trip.id ? "primary" : (trip.pickupStatus === 'picked_up' ? "success" : "success")}
                                                onClick={() => {
                                                    if (trip.pickupStatus !== 'picked_up') {
                                                        selectPickupTrip(trip.id);
                                                    }
                                                }}
                                                className='w-full h-11'
                                                disabled={trip.pickupStatus === 'picked_up'}
                                            >
                                                {trip.pickupStatus === 'approaching' && 'EN COURS'}
                                                {trip.pickupStatus === 'arrived' && 'SUR PLACE'}
                                                {trip.pickupStatus === 'picked_up' && 'À BORD'}
                                                {trip.pickupStatus === 'pending' && 'REJOINDRE'}
                                                {!['approaching', 'arrived', 'picked_up', 'pending'].includes(trip.pickupStatus) && 'REJOINDRE'}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const StatsPanel = ({
    acceptedTrips,
    currentTime,
    speed,
    tripStep,
    activeTrip,
    onCallPassenger,
    signalArrival,
    confirmPassengerPickup,
    startGlobalTrip
}) => {
    const totalRevenue = acceptedTrips.reduce((acc, t) => acc + (t.estimatedFare || 0), 0);
    const pickedUpCount = acceptedTrips.filter(t => t.pickupStatus === 'picked_up').length;
    const pendingCount = acceptedTrips.length - pickedUpCount;

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: '',
        action: null
    });

    const handleConfirm = (action) => {
        setConfirmModal({ isOpen: true, type: 'info', action });
    };

    const handleConfirmAction = () => {
        if (confirmModal.action) confirmModal.action();
        setConfirmModal({ isOpen: false, type: '', action: null });
    };

    return (
        <>
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Activity className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {tripStep === 'idle' && "Prêt pour le prochain trajet"}
                                    {tripStep === 'to_pickup' && "En approche du point de RDV"}
                                    {tripStep === 'at_pickup' && "Arrivé au point de RDV"}
                                    {tripStep === 'ready_to_start' && "Prêt à démarrer"}
                                    {tripStep === 'in_progress' && "Trajet en cours"}
                                </h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge variant={pendingCount > 0 ? "warning" : "success"}>
                                        {pickedUpCount}/{acceptedTrips.length} à bord
                                    </Badge>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <ClockIcon className="w-4 h-4" />
                                        {currentTime}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 min-w-[120px]">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
                                    Revenu
                                </p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {totalRevenue.toLocaleString()} <span className="text-sm">FG</span>
                                </p>
                            </div>
                            <div className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 min-w-[120px]">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
                                    Vitesse
                                </p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {speed} <span className="text-sm">km/h</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {tripStep === 'to_pickup' && activeTrip && (
                    <Button
                        variant="primary"
                        size="large"
                        icon={CheckCircle}
                        onClick={() => handleConfirm(signalArrival)}
                        fullWidth
                        className="h-12"
                    >
                        Signaler l'arrivée
                    </Button>
                )}

                {tripStep === 'at_pickup' && activeTrip && (
                    <Button
                        variant="secondary"
                        size="large"
                        icon={User}
                        onClick={() => handleConfirm(() => confirmPassengerPickup(activeTrip.id))}
                        fullWidth
                        className="h-12"
                    >
                        Passager à bord
                    </Button>
                )}

                {pickedUpCount > 0 && tripStep !== 'in_progress' && (
                    <Button
                        variant="success"
                        size="large"
                        icon={FlagIcon}
                        onClick={() => handleConfirm(startGlobalTrip)}
                        fullWidth
                        className="h-12 shadow-lg shadow-emerald-500/30"
                    >
                        Démarrer le Trajet ({pickedUpCount})
                    </Button>
                )}

                {activeTrip && tripStep === 'to_pickup' && (
                    <Button
                        variant="outline"
                        size="large"
                        icon={Phone}
                        onClick={() => onCallPassenger(activeTrip.passengerPhone)}
                        fullWidth
                        className="h-12"
                    >
                        Appeler le passager
                    </Button>
                )}
            </div>

            {/* Modal de confirmation */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: '', action: null })}
                onConfirm={handleConfirmAction}
                title="Confirmer l'action"
                message={
                    tripStep === 'to_pickup' ? "Confirmez-vous votre arrivée au point de RDV ?" :
                        tripStep === 'at_pickup' ? "Confirmez-vous que le passager est à bord ?" :
                            "Confirmez-vous le démarrage de la course ?"
                }
                confirmText="Confirmer"
                cancelText="Annuler"
                type="info"
            />
        </>
    );
};

const ChauffeurTracking = () => {
    const {
        acceptedTrips,
        currentPickupTripId,
        tripStep,
        driverLocation,
        selectPickupTrip,
        signalArrival,
        confirmPassengerPickup,
        startGlobalTrip,
        reportDispute,
        calculateDistance
    } = useDriverContext();

    const navigate = useNavigate();
    const mapRef = useRef();
    const [currentTime, setCurrentTime] = useState('--:--');
    const [speed, setSpeed] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Initialiser les icônes Leaflet
    useEffect(() => {
        ensureLeafletIcons();
    }, []);

    // Mise à jour de l'heure
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Simulation de vitesse (à remplacer par vrai GPS plus tard)
    useEffect(() => {
        setIsLoading(false);
        if (tripStep === 'in_progress' || tripStep === 'to_pickup') {
            const interval = setInterval(() => {
                setSpeed(prev => {
                    const change = Math.random() * 10 - 5;
                    return Math.max(0, Math.min(120, prev + change));
                });
            }, 3000);
            return () => clearInterval(interval);
        } else {
            setSpeed(0);
        }
    }, [tripStep]);

    const activeTrip = acceptedTrips.find(t => t.id === currentPickupTripId);
    const activePickupCoords = activeTrip?.pickupCoords || null;

    const distanceToTarget = (activePickupCoords && driverLocation)
        ? calculateDistance(driverLocation.lat, driverLocation.lng, activePickupCoords[0], activePickupCoords[1])
        : 0;

    const distanceDisplay = distanceToTarget < 1
        ? `${Math.round(distanceToTarget * 1000)} m`
        : `${distanceToTarget.toFixed(1)} km`;

    const etaMinutes = Math.max(1, Math.ceil(distanceToTarget * 2.5));

    const handleCallPassenger = (phone) => {
        if (phone) window.open(`tel:${phone}`);
    };

    // État vide
    if (acceptedTrips.length === 0) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6">
                <Card className="max-w-4xl mx-auto" animate>
                    <CardContent className="text-center p-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12 }}
                            className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-6"
                        >
                            <Car className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                        </motion.div>
                        <CardTitle size="lg" className="mb-3">
                            Aucun trajet actif
                        </CardTitle>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Prêt pour une nouvelle course ? Consultez les demandes disponibles dans votre secteur.
                        </p>
                        <Button
                            variant="primary"
                            size="large"
                            icon={Map}
                            onClick={() => navigate('/chauffeur/trips')}
                            className="w-full"
                        >
                            Voir les demandes
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-7xl mx-auto pb-8"
        >
            {/* En-tête et statistiques */}
            <StatsPanel
                acceptedTrips={acceptedTrips}
                currentTime={currentTime}
                speed={speed}
                tripStep={tripStep}
                activeTrip={activeTrip}
                onCallPassenger={handleCallPassenger}
                signalArrival={signalArrival}
                confirmPassengerPickup={confirmPassengerPickup}
                startGlobalTrip={startGlobalTrip}
            />

            {/* Contenu principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Carte et contrôles */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="relative">
                        <TrackingMap
                            driverLocation={driverLocation}
                            acceptedTrips={acceptedTrips}
                            activePickupCoords={activePickupCoords}
                            activeTrip={activeTrip}
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <PassengerList
                        acceptedTrips={acceptedTrips}
                        currentPickupTripId={currentPickupTripId}
                        selectPickupTrip={selectPickupTrip}
                        tripStep={tripStep}
                    />

                    {/* Statistiques de revenus */}
                    <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm font-medium text-blue-100 opacity-90 uppercase tracking-wider">
                                        Revenu estimé
                                    </p>
                                    <p className="text-3xl font-bold mt-2">
                                        {acceptedTrips.reduce((acc, t) => acc + (t.estimatedFare || 0), 0).toLocaleString()} <span className="text-xl">FG</span>
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-100 opacity-90">Optimisation</span>
                                    <span className="font-semibold">Carpooling Actif</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2">
                                    <motion.div
                                        className="bg-emerald-400 h-2 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: '85%' }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-blue-100 opacity-90">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>Performance optimale</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bouton retour */}
            <div className="fixed bottom-6 left-6 z-50">
                <Button
                    variant="secondary"
                    size="medium"
                    icon={ArrowLeft}
                    onClick={() => navigate(-1)}
                    tooltip="Retour"
                >
                    Retour
                </Button>
            </div>
        </motion.div>
    );
};

export default ChauffeurTracking;
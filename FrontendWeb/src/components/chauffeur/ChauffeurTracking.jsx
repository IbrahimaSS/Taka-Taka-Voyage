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

    Target, Clock as ClockIcon, TrendingUp, QrCode

} from 'lucide-react';

import QRScannerWeb from '../common/QRScannerWeb';

import axios from 'axios';

import toast from 'react-hot-toast';

import Badge from '../admin/ui/Badge';

import Button from '../admin/ui/Bttn';

import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';

import ConfirmModal from '../admin/ui/ConfirmModal';

import { useDriverContext } from '../../context/DriverContext';

import { useNavigate } from 'react-router-dom';

import { leafletIcons, ensureLeafletIcons } from '../maps/leafletIcons';

import MapController from '../maps/MapController';

import { socketService } from '../../services/socketService';

import { useTranslation } from 'react-i18next';
import { getApiBaseURL } from '../../utils/urlHelper';



const TrackingMap = ({

    driverLocation,

    acceptedTrips,

    activeTrip,

    targetCoords

}) => {

    const { t } = useTranslation();

    const [mapReady, setMapReady] = useState(false);

    const isValidLocation = driverLocation && !isNaN(driverLocation.lat) && !isNaN(driverLocation.lng);



    if (!isValidLocation) {

        return (

            <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 flex items-center justify-center bg-gray-100 dark:bg-gray-800">

                <div className="text-center p-6">

                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />

                    <p className="text-gray-600 dark:text-gray-400">{t('tracking.gps_not_available')}</p>

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

                            <p className="font-bold text-emerald-600">{t('tracking.your_position')}</p>

                            <p className="text-sm">{t('tracking.online_ready')}</p>

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

                                            <p className="font-bold text-blue-600">{t('tracking.passenger_label')}: {trip.passengerName}</p>

                                            <p className="text-sm">{trip.pickupAddress}</p>

                                        </div>

                                    </Popup>

                                </Marker>

                            )}

                            {isValidDest && (

                                <Marker position={trip.destinationCoords} icon={leafletIcons.end}>

                                    <Popup>

                                        <div className="p-2">

                                            <p className="font-bold text-red-600">{t('tracking.destination_label')}</p>

                                            <p className="text-sm">{trip.destinationAddress}</p>

                                        </div>

                                    </Popup>

                                </Marker>

                            )}

                        </React.Fragment>

                    );

                })}



                {/* Ligne de trajectoire */}

                {targetCoords && !isNaN(targetCoords[0]) && !isNaN(targetCoords[1]) && (

                    <Polyline

                        positions={[[driverLocation.lat, driverLocation.lng], targetCoords]}

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

                        <p className="text-lg font-semibold">{t('tracking.loading_map')}</p>

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

    const { t } = useTranslation();

    const pendingTrips = acceptedTrips.filter(t => t.pickupStatus !== 'picked_up');

    const pickedUpTrips = acceptedTrips.filter(t => t.pickupStatus === 'picked_up');



    return (

        <Card className="" hoverable animate>

            <CardHeader>

                <div className="flex items-center justify-between">

                    <CardTitle size="lg">{t('tracking.pickup_list')}</CardTitle>

                    <Badge variant={pendingTrips.length > 0 ? "warning" : "success"} className='text-xs'>

                        {t('tracking.n_pending', { count: pendingTrips.length })}

                    </Badge>

                </div>

            </CardHeader>

            <CardContent className="space-y-4">

                {pendingTrips.length > 0 && (

                    <div className="space-y-3">

                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            {t('tracking.to_collect')}

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

                                                {trip.pickupStatus === 'approaching' && t('tracking.status_approaching')}

                                                {trip.pickupStatus === 'arrived' && t('tracking.status_arrived')}

                                                {trip.pickupStatus === 'picked_up' && t('tracking.status_picked_up')}

                                                {trip.pickupStatus === 'pending' && t('tracking.status_to_join')}

                                                {!['approaching', 'arrived', 'picked_up', 'pending'].includes(trip.pickupStatus) && t('tracking.status_to_join')}

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

    startGlobalTrip,

    startTripImmediately,

    navigate,

    progress,

    distanceDisplay,

    etaMinutes,

    peutDemarrerTP,
    onOpenScanner,
    hasScannedTicket,
}) => {

    const { t } = useTranslation();

    const totalRevenue = acceptedTrips.reduce((acc, t) => acc + (t.estimatedFare || 0), 0);

    const pickedUpCount = acceptedTrips.filter(t => t.pickupStatus === 'picked_up' || t.pickupStatus === 'arrived').length;

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

                                    {tripStep === 'idle' && t('tracking.step_idle')}

                                    {tripStep === 'to_pickup' && t('tracking.step_to_pickup')}

                                    {tripStep === 'at_pickup' && t('tracking.step_at_pickup')}

                                    {tripStep === 'ready_to_start' && t('tracking.step_ready_to_start')}

                                    {tripStep === 'in_progress' && t('tracking.step_in_progress')}

                                </h2>

                                <div className="flex items-center gap-3 mt-2">

                                    <Badge variant={pendingCount > 0 ? "warning" : "success"}>

                                        {t('tracking.on_board_count', { pickedUp: pickedUpCount, total: acceptedTrips.length })}

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

                                    {t('tracking.revenue_label')}

                                </p>

                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">

                                    {totalRevenue.toLocaleString()} <span className="text-sm">{t('common.currency_symbol_short')}</span>

                                </p>

                            </div>

                            <div className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 min-w-[120px]">

                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">

                                    {t('tracking.speed_label')}

                                </p>

                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">

                                    {speed} <span className="text-sm">{t('tracking.speed_unit')}</span>

                                </p>

                            </div>

                        </div>

                    </div>



                    {(tripStep === 'in_progress' || tripStep === 'to_pickup') && (

                        <div className="mt-6 border-t pt-4 border-gray-100 dark:border-gray-700">

                            <div className="flex justify-between items-end mb-2">

                                <div>

                                    <p className="text-sm font-medium text-gray-500">

                                        {tripStep === 'to_pickup' ? t('tracking.to_client') : t('tracking.to_destination')}

                                    </p>

                                    <p className="text-lg font-bold text-gray-800 dark:text-white">

                                        {distanceDisplay} • {etaMinutes} min

                                    </p>

                                </div>

                                <span className="text-2xl font-bold text-emerald-600">{progress}%</span>

                            </div>

                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">

                                <motion.div

                                    className="bg-emerald-500 h-full rounded-full"

                                    initial={{ width: 0 }}

                                    animate={{ width: `${progress}%` }}

                                    transition={{ duration: 0.5 }}

                                />

                            </div>

                        </div>

                    )}

                </CardContent>

            </Card>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* 1. SIGNALER L'ARRIVÉE */}
                {tripStep === 'to_pickup' && activeTrip && (
                    <Button
                        variant="primary"
                        size="large"
                        icon={CheckCircle}
                        onClick={() => handleConfirm(signalArrival)}
                        fullWidth
                        className="h-12"
                    >
                        {t('tracking.signal_arrival')}
                    </Button>
                )}

                {/* 2. SCANNER LE TICKET (Grisé si pas arrivé) */}
                {activeTrip && (tripStep === 'to_pickup' || tripStep === 'at_pickup') && !hasScannedTicket && (
                    <Button
                        variant="primary"
                        size="large"
                        icon={QrCode}
                        onClick={onOpenScanner}
                        fullWidth
                        disabled={tripStep !== 'at_pickup'}
                        className={`h-12 shadow-lg ${tripStep !== 'at_pickup' ? 'opacity-40 grayscale cursor-not-allowed bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}
                    >
                        {tripStep !== 'at_pickup' ? 'Attendre arrivée pour scanner' : 'Scanner le Ticket'}
                    </Button>
                )}

                {/* 3. DÉMARRER LA COURSE (Seulement après Scan) */}
                {activeTrip && hasScannedTicket && tripStep !== 'in_progress' && (
                    <Button
                        variant="success"
                        size="large"
                        icon={FlagIcon}
                        onClick={() => {
                            if (activeTrip?.id) {
                                startTripImmediately(activeTrip.id);
                                navigate('/chauffeur/live-tracking');
                            }
                        }}
                        fullWidth
                        className="h-12 shadow-lg shadow-emerald-500/30 font-bold"
                    >
                        {t('tracking.start_trip')}
                    </Button>
                )}

                {/* 4. APPELER LE PASSAGER */}
                {activeTrip && tripStep !== 'in_progress' && (
                    <Button
                        variant="outline"
                        size="large"
                        icon={Phone}
                        onClick={() => onCallPassenger(activeTrip.passengerPhone)}
                        fullWidth
                        className="h-12"
                    >
                        {t('tracking.call_passenger')}
                    </Button>
                )}
            </div>



            {/* Modal de confirmation */}

            <ConfirmModal

                isOpen={confirmModal.isOpen}

                onClose={() => setConfirmModal({ isOpen: false, type: '', action: null })}

                onConfirm={handleConfirmAction}

                title={t('tracking.confirm_action')}

                message={

                    tripStep === 'to_pickup' ? t('tracking.confirm_arrival_msg') :

                        tripStep === 'at_pickup' ? t('tracking.confirm_pickup_msg') :

                            t('tracking.confirm_start_msg')

                }

                confirmText={t('common.confirm')}

                cancelText={t('common.cancel')}

                type="info"

            />

        </>

    );

};



const ChauffeurTracking = () => {

    const { t } = useTranslation();

    const {

        acceptedTrips,

        currentPickupTripId,

        tripStep,

        driverLocation,

        selectPickupTrip,

        signalArrival,

        confirmPassengerPickup,

        startGlobalTrip,

        startTripImmediately,

        reportDispute,
        calculateDistance,
        peutDemarrerTP,
    } = useDriverContext();



    const navigate = useNavigate();
    const [showScanner, setShowScanner] = useState(false);
    const [hasScannedTicket, setHasScannedTicket] = useState(false);

    const handleQRScanSuccess = async (code) => {
        try {
            setShowScanner(false);
            toast.loading('Validation du ticket...', { id: 'scan-loading' });
            
            const baseURL = getApiBaseURL();
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            const response = await axios.post(`${baseURL}/tickets/scanner`, { 
                codeUnique: code 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.dismiss('scan-loading');

            if (response.data.succes) {
                toast.success('Ticket validé ! Vous pouvez démarrer la course.');
                setHasScannedTicket(true); // <--- DEVERROUILLE LE BOUTON DEMARRER
                // On signale la montée au serveur
                const activeTrip = acceptedTrips.find(t => t.id === currentPickupTripId) || acceptedTrips[0];
                if (activeTrip) {
                    socketService.emit('course:passager_ramasse', { 
                        reservationId: activeTrip.id || activeTrip._id 
                    });
                }
            } else {
                toast.error(response.data.message || 'Ticket invalide');
            }
        } catch (err) {
            toast.dismiss('scan-loading');
            console.error("Scan Error:", err);
            toast.error(err.response?.data?.message || 'Erreur lors de la validation');
        }
    };

    const mapRef = useRef();

    const driverStartPositionRef = useRef(null);

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







    const activeTrip = (currentPickupTripId

        ? acceptedTrips.find(t => t.id === currentPickupTripId)

        : null) || acceptedTrips.find(t => t.pickupStatus === 'picked_up') || acceptedTrips[0];



    // Mémoriser la position de départ réelle pour le calcul du pourcentage

    const startPosRef = useRef(null);

    useEffect(() => {

        if (activeTrip && !startPosRef.current && driverLocation) {

            startPosRef.current = { ...driverLocation };

        }

    }, [activeTrip]);



    // ✅ Logic de cible dynamique (Pickup ou Destination)

    const targetCoords = (tripStep === 'in_progress' && activeTrip?.destinationCoords)

        ? activeTrip.destinationCoords

        : (activeTrip?.pickupCoords || null);



    const distanceToTarget = (targetCoords && Array.isArray(targetCoords) && targetCoords.length >= 2 && driverLocation)

        ? calculateDistance(driverLocation.lat, driverLocation.lng, targetCoords[0], targetCoords[1])

        : 0;



    useEffect(() => {

        setIsLoading(false);

    }, []);



    const [progress, setProgress] = useState(0);

    useEffect(() => {

        if ((tripStep === 'in_progress' || tripStep === 'to_pickup') && activeTrip && targetCoords && driverLocation) {

            const driverLat = driverLocation.lat;

            const driverLng = driverLocation.lng;

            const targetLat = targetCoords[0];

            const targetLng = targetCoords[1];



            // Utiliser le point de départ capturé initialement

            const startLat = startPosRef.current?.lat || driverLat;

            const startLng = startPosRef.current?.lng || driverLng;



            // 1. Distance totale estimée (du départ à la cible)

            const total = calculateDistance(startLat, startLng, targetLat, targetLng) || 1;



            // 2. Distance restante

            const remaining = calculateDistance(driverLat, driverLng, targetLat, targetLng);



            // 3. Calcul du pourcentage

            const progressVal = Math.max(0, Math.min(99, ((total - remaining) / total) * 100));

            setProgress(Math.round(progressVal));

        } else {

            setProgress(0);

        }

    }, [tripStep, activeTrip, driverLocation, distanceToTarget]);



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

                            {t('tracking.no_active_trip')}

                        </CardTitle>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">

                            {t('tracking.no_active_trip_desc')}

                        </p>

                        <Button

                            variant="primary"

                            size="large"

                            icon={Map}

                            onClick={() => navigate('/chauffeur/trips')}

                            className="w-full"

                        >

                            {t('tracking.view_requests')}

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
                startTripImmediately={startTripImmediately}
                navigate={navigate}
                progress={progress}
                distanceDisplay={distanceDisplay}
                etaMinutes={etaMinutes}
                peutDemarrerTP={peutDemarrerTP}
                onOpenScanner={() => setShowScanner(true)}
                hasScannedTicket={hasScannedTicket}
            />



            {/* Contenu principal */}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Carte et contrôles */}

                <div className="lg:col-span-8 space-y-6">

                    <div className="relative">

                        <TrackingMap

                            driverLocation={driverLocation}

                            acceptedTrips={acceptedTrips}

                            targetCoords={targetCoords}

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

                                        {t('tracking.estimated_revenue')}

                                    </p>

                                    <p className="text-3xl font-bold mt-2">

                                        {acceptedTrips.reduce((acc, t) => acc + (t.estimatedFare || 0), 0).toLocaleString()} <span className="text-xl">{t('common.currency_symbol_short')}</span>

                                    </p>

                                </div>

                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">

                                    <DollarSign className="w-6 h-6" />

                                </div>

                            </div>

                            <div className="space-y-3">

                                <div className="flex justify-between text-sm">

                                    <span className="text-blue-100 opacity-90">{t('tracking.optimization')}</span>

                                    <span className="font-semibold">{t('tracking.carpooling_active')}</span>

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

                                    <span>{t('tracking.optimal_performance')}</span>

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

                    tooltip={t('tracking.back_btn')}

                >

                    {t('tracking.back_btn')}

                </Button>

            </div>

            {showScanner && (
                <QRScannerWeb 
                    onScanSuccess={handleQRScanSuccess} 
                    onClose={() => setShowScanner(false)} 
                />
            )}
        </motion.div>
    );
};

export default ChauffeurTracking;
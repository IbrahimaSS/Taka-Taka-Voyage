import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDriverContext } from '../../../context/DriverContext';
import { ensureLeafletIcons } from '../../maps/leafletIcons';
import { socketService } from '../../../services/socketService';
import { getApiBaseURL } from '../../../utils/urlHelper';

export const useChauffeurTracking = () => {
    const {
        acceptedTrips,
        currentPickupTripId,
        tripStep,
        driverLocation,
        selectPickupTrip,
        signalArrival,
        startTripImmediately,
        calculateDistance,
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

    const [currentTime, setCurrentTime] = useState('--:--');
    const [speed, setSpeed] = useState(0);

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

    return {
        acceptedTrips,
        currentPickupTripId,
        tripStep,
        driverLocation,
        selectPickupTrip,
        signalArrival,
        startTripImmediately,
        navigate,
        showScanner,
        setShowScanner,
        hasScannedTicket,
        handleQRScanSuccess,
        currentTime,
        speed,
        activeTrip,
        targetCoords,
        progress,
        distanceDisplay,
        etaMinutes,
        handleCallPassenger,
    };
};

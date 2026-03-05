// components/passager/RealTimeTracking.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { leafletIcons, ensureLeafletIcons } from '../maps/leafletIcons';
import MapController from '../maps/MapController';
import { GeolocationService } from '../../services/geolocation';
import { socketService } from '../../services/socketService';
import {
  Car, User, Phone, ArrowLeft, Clock, Navigation, MapPin, Shield,
  HelpCircle, FileText, Share2, AlertTriangle, Gauge, CheckCircle,
  Flag, RefreshCw, CreditCard, Smartphone, Battery, Target,
  ChevronRight, XCircle, Star, ShieldCheck, ChevronLeft, Bell,
  MessageCircle, BatteryCharging, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDriverContext } from '../../context/DriverContext';
import EmergencyButton from '../passager/EmergencyButton';
import FloatingDisputeButton from '../shared/FloatingDisputeButton';

// MapController is now imported from shared components

const RealTimeTracking = ({
  role = 'passenger',
  trip,
  driver,
  onBack,
  onEmergency,
  onContactDriver,
  onCancelTrip,
  onEndTrip,
  onShareTrip
}) => {
  // États
  const driverCtx = role === 'driver' ? useDriverContext() : null;
  const isValidCoords = (pos) => {
    if (!pos) return false;
    if (Array.isArray(pos)) {
      return pos.length === 2 && pos[0] !== null && pos[1] !== null && !isNaN(pos[0]) && !isNaN(pos[1]);
    }
    if (typeof pos === 'object') {
      return pos.lat !== null && pos.lng !== null && !isNaN(pos.lat) && !isNaN(pos.lng);
    }
    return false;
  };

  const [driverPosition, setDriverPosition] = useState(
    driver?.currentLocation || driver?.location || null
  );
  const [passengerPosition] = useState(
    trip?.pickupCoords || [9.6412, -13.5784]
  );
  const [progress, setProgress] = useState(0);
  const [isTripStarted, setIsTripStarted] = useState(true);
  const [isTripEnded, setIsTripEnded] = useState(false);
  const [speed, setSpeed] = useState(42);
  const [currentTime, setCurrentTime] = useState('--:--');
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [connectionStatus, setConnectionStatus] = useState('excellent');
  const [estimatedArrival, setEstimatedArrival] = useState('14:45');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  // Références
  const mapRef = useRef();
  const progressInterval = useRef();
  const timeInterval = useRef();
  const driverStartPositionRef = useRef(null); // Position du chauffeur au démarrage du suivi
  const lastStatusRef = useRef(trip?.status);
  const isSimulatingRef = useRef(isSimulating);
  const remoteIsSimulatingRef = useRef(false); // Verrou pour le passager (détecte la simulation du chauffeur)
  const remoteSimTimeoutRef = useRef(null);

  // Synchroniser la ref avec l'état
  useEffect(() => {
    isSimulatingRef.current = isSimulating;
  }, [isSimulating]);

  // ✅ Reset de la référence si le statut change (ex: de 'approaching' à 'in_progress')
  useEffect(() => {
    // Ne pas reset la référence si on est en train de simuler, pour éviter le saut à 0%
    if (trip?.status !== lastStatusRef.current && !isSimulating) {
      console.log("🔄 [Tracking] Changement de statut:", lastStatusRef.current, "->", trip?.status);
      driverStartPositionRef.current = null;
      lastStatusRef.current = trip?.status;
    }
  }, [trip?.status, isSimulating]);

  // Données calculées à partir des props (Mémoïsées pour une meilleure stabilité)
  const tripData = useMemo(() => {
    const d = driver || trip?.chauffeur || {};
    const vRaw = d.vehicle || d.vehicule || d.vehiculeDetail || {};
    const v = (vRaw && typeof vRaw === 'object') ? vRaw : {};

    const departure = {
      coords: trip?.pickupCoords || [9.6412, -13.5784],
      name: trip?.pickup || trip?.depart || trip?.pickupAddress || 'Point de départ',
      address: trip?.pickup || trip?.depart || trip?.pickupAddress || ''
    };

    const destination = {
      coords: trip?.destinationCoords || [9.6412, -13.5784],
      name: trip?.destination || trip?.destinationAddress || 'Destination',
      address: trip?.destination || trip?.destinationAddress || ''
    };

    const driverInfo = {
      ...d,
      name: d.name || d.nom || (d.prenom ? `${d.prenom} ${d.nom}` : "Ib Tara Barry"),
      phone: d.phone || d.telephone || d.phoneNumber || "+224 000 00 00 00",
      rating: d.rating || 5.0,
      totalTrips: d.totalTrips || d.nombreCourses || 0,
      experience: d.experience || '1 an',
      vehicle: {
        brand: v.brand || v.marque || d.vehicleBrand || d.marque || trip?.vehicleBrand || trip?.marque || (typeof vRaw === 'string' ? vRaw : "Véhicule"),
        model: v.model || v.modele || d.vehicleModel || d.modele || trip?.vehicleModel || trip?.modele || "Taka-Taka",
        plate: v.plate || v.immatriculation || d.vehiclePlate || d.immatriculation || trip?.vehiclePlate || trip?.immatriculation || "N/A",
        color: v.color || v.couleur || d.vehicleColor || d.couleur || trip?.vehicleColor || trip?.couleur || "Inconnue",
        type: v.type || trip?.vehicleType || 'taxi',
        year: v.year || 2023,
        capacity: v.capacity || 4
      }
    };

    const distTotalVal = (() => {
      const val = trip?.estimatedDistance || trip?.distanceKm || trip?.distance;
      if (typeof val === 'number') return val;
      const parsed = parseFloat(String(val || '').replace(' km', ''));
      if (!isNaN(parsed) && parsed > 0) return parsed;

      // Fallback: calculer la distance réelle entre départ et destination
      if (departure.coords && destination.coords) {
        return GeolocationService.calculateDistance(
          departure.coords[0], departure.coords[1],
          destination.coords[0], destination.coords[1]
        ) || 5.0;
      }
      return 8.0;
    })();

    const durationTotalVal = (() => {
      const val = trip?.estimatedDuration || trip?.dureeMin || trip?.estimatedTime;
      if (typeof val === 'number') return val;
      return parseInt(String(val || '').replace(' min', '')) || 25;
    })();

    const isSharedTaxi = trip?.typeCourse === 'TAXI_PARTAGE' || trip?.vehicleType === 'TAXI_PARTAGE' || !!trip?.groupeTaxiPartage || !!trip?.groupeId;
    const groupId = trip?.groupeTaxiPartage?._id || trip?.groupeTaxiPartage || trip?.groupeId || null;

    const priceRaw = trip?.estimatedPrice || trip?.estimatedFare || trip?.montant || trip?.prix || trip?.price || '0';
    let priceTotal = parseInt(String(priceRaw).replace(/[^0-9]/g, '')) || 0;
    const fee = trip?.fraisService || trip?.serviceFee || 0;
    let feeVal = parseInt(String(fee).replace(/[^0-9]/g, '')) || 0;

    // ✅ FIX : Si on est un chauffeur en taxi partagé (ou simplement avec plusieurs courses), 
    // on fait la somme de tous les paiements des passagers pour le total
    if (role === 'driver' && driverCtx?.acceptedTrips?.length > 0) {
      priceTotal = driverCtx.acceptedTrips.reduce((acc, t) => {
        const p = t.estimatedPrice || t.estimatedFare || t.montant || t.prix || t.price || '0';
        return acc + (parseInt(String(p).replace(/[^0-9]/g, '')) || 0);
      }, 0);

      feeVal = driverCtx.acceptedTrips.reduce((acc, t) => {
        const f = t.fraisService || t.serviceFee || 0;
        return acc + (parseInt(String(f).replace(/[^0-9]/g, '')) || 0);
      }, 0);
    }

    return {
      departure,
      destination,
      driver: driverInfo,
      trip: {
        totalDistance: distTotalVal,
        totalDuration: durationTotalVal,
        isSharedTaxi,
        groupId,
        price: {
          total: priceTotal > 0 ? priceTotal : (isSharedTaxi ? 0 : 15000),
          estimated: priceTotal > feeVal ? priceTotal - feeVal : priceTotal,
          serviceFee: feeVal,
        },
        paymentMethod: (trip?.paymentMethod && trip.paymentMethod !== 'Non spécifié') ? trip.paymentMethod : trip?.paiement?.methode || 'CASH'
      }
    };
  }, [trip, driver, role, driverCtx?.acceptedTrips]);

  // Mise à jour de l'heure
  const updateTime = useCallback(() => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setCurrentTime(timeString);
  }, []);


  // Fonction pour afficher des notifications harmonisée avec le reste de l'app
  const showToast = (message, type = 'info') => {
    const isEndTrip = message.toLowerCase().includes('terminé') || message.toLowerCase().includes('atteinte');
    const toastId = isEndTrip ? 'trip-completion' : undefined;

    if (type === 'success') toast.success(message, { id: toastId });
    else if (type === 'danger' || type === 'error') toast.error(message, { id: toastId });
    else if (type === 'warning') toast.error(message, { id: toastId });
    else toast(message, { id: toastId });

    // On garde l'état local au cas où certains composants map-overlay en dépendent encore pour l'instant
    setNotification({ message, type });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Gestionnaire d'urgence
  // const handleEmergency = () => {
  //   if (window.confirm('🚨 Envoyer un signal d\'urgence ?\nVotre position sera partagée avec les autorités et le support TakaTaka.')) {
  //     const emergencyData = {
  //       position: passengerPosition,
  //       driver: driverPosition,
  //       time: new Date().toISOString(),
  //       tripId: trip?.id || 'TRIP-' + Date.now(),
  //       passengerInfo: {
  //         name: trip?.passengerName || 'Passager',
  //         phone: trip?.passengerPhone || '+224 XXX XX XX XX'
  //       }
  //     };

  //     console.log('Emergency signal sent:', emergencyData);
  //     showToast('🚨 Signal d\'urgence envoyé ! Aide en route.', 'danger');
  //     if (onEmergency) onEmergency(emergencyData);
  //   }
  // };

  // Gestionnaire de contact
  const handleContactDriver = () => {
    if (tripData.driver?.phone) {
      window.open(`tel:${tripData.driver.phone}`);
      showToast(`📞 Appel du chauffeur ${tripData.driver.name}...`, 'info');
    }
    if (onContactDriver) onContactDriver(tripData.driver.phone);
  };

  // Gestionnaire d'annulation
  const handleCancelTrip = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce trajet ?\nDes frais d\'annulation peuvent s\'appliquer.')) {
      clearInterval(progressInterval.current);

      setIsTripEnded(true);
      showToast('Trajet annulé. Un remboursement sera traité.', 'warning');

      if (onCancelTrip) onCancelTrip();
    }
  };

  // Gestionnaire de fin de trajet
  const handleEndTrip = () => {
    if (progress >= 95 || isTripEnded) {
      clearInterval(progressInterval.current);
      setIsTripEnded(true);
      showToast('✅ Trajet terminé avec succès!', 'success');
      if (onEndTrip) onEndTrip();
    } else {
      showToast('Vous n\'êtes pas encore arrivé à destination.', 'warning');
    }
  };

  // Gestionnaire de partage
  const handleShareTrip = async () => {
    const shareData = {
      title: 'Mon trajet TakaTaka',
      text: `🚗 Je suis en trajet de ${tripData.departure.name} à ${tripData.destination.name}. Arrivée prévue à ${estimatedArrival}. Suivez mon trajet en direct !`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Trajet partagé avec succès!', 'success');
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      showToast('📋 Lien copié dans le presse-papier!', 'info');
    }

    if (onShareTrip) onShareTrip(shareData);
  };



  // --- LOGIQUE DE SIMULATION ---
  const simulationIntervalRef = useRef(null);

  const toggleSimulation = () => {
    if (isSimulating) {
      clearInterval(simulationIntervalRef.current);
      setIsSimulating(false);
      setSpeed(0);
      toast.success('⏹️ Simulation arrêtée');
    } else {
      setIsSimulating(true);
      setSimulatedProgress(progress);
      setSpeed(45); // Vitesse initiale pour la simulation
      toast.success('🚀 Simulation démarrée');
    }
  };

  useEffect(() => {
    if (isSimulating && role === 'driver') {
      simulationIntervalRef.current = setInterval(() => {
        setSimulatedProgress(prev => {
          // Vitesse de simulation plus réaliste (+0.5% par seconde -> 200s pour 100%)
          const step = 1.0;
          const next = Math.min(100, prev + step);

          // Simulation d'une vitesse vivante (entre 30 et 70 km/h)
          const liveSpeed = next >= 100 ? 0 : Math.round(35 + Math.random() * 25);
          setSpeed(liveSpeed);

          if (next >= 100) {
            clearInterval(simulationIntervalRef.current);
            setIsSimulating(false);
            if (onEndTrip) {
              onEndTrip();
              toast.success('🏁 Arrivée à destination !');
            }
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(simulationIntervalRef.current);
  }, [isSimulating, role, onEndTrip]);

  useEffect(() => {
    if (isSimulating) {
      const departure = tripData.departure.coords;
      const destination = tripData.destination.coords;
      const [simLat, simLng] = [
        departure[0] + (destination[0] - departure[0]) * (simulatedProgress / 100),
        departure[1] + (destination[1] - departure[1]) * (simulatedProgress / 100)
      ];
      const simulatedLoc = { lat: simLat, lng: simLng, speed: 12.5, isSimulation: true };
      setDriverPosition(simulatedLoc);

      // ✅ BROADCAST SYNCHRONISÉ (Chauffeur -> Tous les Passagers)
      if (role === 'driver') {
        // ✅ VERROU CRITIQUE : Dit au DriverContext de couper le GPS réel
        window.isTravelingSimulationActive = isSimulating;

        const isShared = tripData.trip.isSharedTaxi;
        const simulationPayload = {
          lat: simLat,
          lng: simLng,
          speed: 12.5,
          isSimulation: true,
          progress: simulatedProgress,
          isSimulationFinish: simulatedProgress >= 100
        };

        const allTargetRids = new Set();
        // Récupération de tous les IDs possibles du groupe
        if (driverCtx?.acceptedTrips) {
          driverCtx.acceptedTrips.forEach(t => {
            const id = t.id || t.reservationId || t._id;
            if (id) allTargetRids.add(String(id));
          });
        }

        const currentRid = trip?.reservationId || trip?.id;
        if (currentRid) allTargetRids.add(String(currentRid));

        const gid = tripData.trip.groupId || trip?.groupeTaxiPartage?._id || trip?.groupeTaxiPartage;

        if (gid) {
          socketService.emit('position:update', { ...simulationPayload, groupeId: String(gid) });
        }

        allTargetRids.forEach(rid => {
          socketService.emit('position:update', { ...simulationPayload, reservationId: rid });
        });

        // ✅ SÉCURITÉ FIN DE TRAJET : Si on arrive au bout, on envoie un signal de fin explicite
        if (simulatedProgress >= 100) {
          socketService.emit('course:terminer_auto', {
            reservationIds: Array.from(allTargetRids),
            groupeId: gid
          });
        }
      }
    } else {
      window.isTravelingSimulationActive = false;
    }
  }, [simulatedProgress, isSimulating, role, trip, tripData.departure.coords, tripData.destination.coords, tripData.trip.isSharedTaxi, driverCtx?.acceptedTrips]);
  useEffect(() => {
    ensureLeafletIcons();
    // Initialisation de l'heure
    updateTime();
    timeInterval.current = setInterval(updateTime, 60000);

    // Simulation de la batterie
    const batteryInterval = setInterval(() => {
      setBatteryLevel(prev => {
        const newLevel = prev - 0.5;
        if (newLevel <= 20) {
          showToast('🔋 Batterie faible !', 'warning');
        }
        return newLevel > 0 ? newLevel : 0;
      });
    }, 30000);

    // Initialisation des rooms socket (Individuelle + Groupe)
    const rid = trip?.reservationId || trip?.id;
    const gid = tripData.trip.groupId;

    if (rid) {
      console.log(`📡 [SOCKET] Room Individuelle: RESERVATION_${rid}`);
      socketService.emit('reservation:join', { reservationId: rid });
    }

    if (gid) {
      console.log(`📡 [SOCKET] Room Groupe: GROUPE_${gid}`);
      socketService.emit('taxipartage:rejoindre_groupe', { groupeId: gid });
    }

    return () => {
      clearInterval(timeInterval.current);
      clearInterval(batteryInterval);
    };
  }, [updateTime, trip?.reservationId, trip?.id, tripData.trip.groupId]);

  useEffect(() => {
    if (driver?.location || driver?.currentLocation) {
      // Priorité simulation locale (chauffeur) OU simulation distance (passager)
      if (isSimulatingRef.current || remoteIsSimulatingRef.current) return;

      const loc = driver.location || driver.currentLocation;
      setDriverPosition(loc);
      // Mise à jour de la vitesse...

      // Mise à jour de la vitesse si disponible (speed est en m/s par défaut via browser API)
      if (loc && typeof loc.speed === 'number') {
        const speedKmh = Math.round(loc.speed * 3.6);
        setSpeed(speedKmh > 0 ? speedKmh : 0);
      } else if (driver.speed) {
        setSpeed(Math.round(driver.speed));
      }
    }
  }, [driver]);

  // ✅ FIX: Écouter les mises à jour de position via Socket (pour le chauffeur en mode simulation/test)
  useEffect(() => {
    const onPositionUpdate = (data) => {
      if (!data) return;
      console.log(`📥 [SOCKET] Reçu position:`, data);

      // ✅ Utilisation de la ref pour éviter le stale closure sans recréer le listener
      if (isSimulatingRef.current && role === 'driver') return;

      // Verrou spécial passager : si on reçoit une simulation, on ignore les data réelles pendant 5s
      if (data.isSimulation) {
        remoteIsSimulatingRef.current = true;
        if (remoteSimTimeoutRef.current) clearTimeout(remoteSimTimeoutRef.current);
        remoteSimTimeoutRef.current = setTimeout(() => {
          remoteIsSimulatingRef.current = false;
        }, 5000); // 5 secondes de patience entre deux signaux de simulation
      } else if (remoteIsSimulatingRef.current) {
        // On ignore les données réelles (DB/GPS statique) si une simulation est en cours à distance
        return;
      }

      if ((data.isSimulationFinish || (data.progress && data.progress > 98)) && role === 'passenger') {
        // Force la fin pour le passager si le chauffeur dit que c'est fini ou si on approche de 100%
        setDriverPosition(prev => ({ ...prev, lat: data.lat, lng: data.lng, isSimulation: true, progress: 100 }));
        setProgress(100);
        if (onEndTrip) {
          console.log("🏁 Fin de trajet détectée (Signal 100%)");
          onEndTrip();
        }
        return;
      }

      // Mise à jour du progrès avec lissage pour éviter de rester bloqué à 98-99%
      if (data.progress !== undefined) {
        const effectiveProgress = (data.progress > 96 && data.progress < 100) ? 100 : data.progress;
        setProgress(effectiveProgress);
      }

      if (data.lat && data.lng) {
        setDriverPosition({
          lat: data.lat,
          lng: data.lng,
          isSimulation: !!data.isSimulation,
          progress: data.progress !== undefined ? data.progress : data.progression,
          speed: data.speed
        });

        // Mise à jour de la vitesse via le socket
        if (typeof data.speed === 'number') {
          const speedKmh = Math.round(data.speed * 3.6);
          setSpeed(speedKmh > 0 ? speedKmh : 0);
        }
      }
    };

    // Si on est le chauffeur, on veut aussi voir ce que le serveur diffuse (utile pour les simulations ou si le GPS local est bloqué)
    if (role === 'driver' || role === 'passenger') {
      socketService.on('position:chauffeur', onPositionUpdate);
    }

    return () => {
      socketService.off('position:chauffeur', onPositionUpdate);
    };
  }, [role, onEndTrip]);

  // ✅ FIX: Auto-zoom initial SEULEMENT
  useEffect(() => {
    if (mapRef.current && driverPosition && tripData.departure.coords && !window.hasInitiallyCentered) {
      const bounds = L.latLngBounds([
        driverPosition,
        tripData.departure.coords,
        tripData.destination.coords
      ]);

      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      window.hasInitiallyCentered = true;
    }
  }, [driverPosition, tripData.departure.coords, tripData.destination.coords]);

  // ✅ CALCUL DYNAMIQUE DU PROGRÈS
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    distanceTraveled: 0,
    distanceRemaining: tripData.trip.totalDistance,
    progress: 0,
    durationRemaining: tripData.trip.totalDuration
  });

  useEffect(() => {
    if (tripData?.destination?.coords && tripData?.departure?.coords && driverPosition) {

      // Helpers pour sécuriser les coords
      const getLat = (pos) => parseFloat(pos?.lat || pos?.[0]);
      const getLng = (pos) => parseFloat(pos?.lng || pos?.[1]);

      // ✅ SI SIMULATION : On utilise directement le progrès simulé pour éviter les sauts
      // (Soit localement pour le chauffeur, soit via socket pour le passager)
      const isRemoteSim = driverPosition?.isSimulation && driverPosition?.progress !== undefined;

      if (isSimulating || isRemoteSim) {
        const pct = isSimulating ? simulatedProgress : driverPosition.progress;
        const distTotal = tripData.trip.totalDistance || 5;
        const distTraveled = (pct / 100) * distTotal;
        const distRemaining = distTotal - distTraveled;
        const timeRemaining = Math.max(0, Math.round(((100 - pct) / 100) * tripData.trip.totalDuration));

        const formattedDuration = pct >= 100 ? "0 min" : (timeRemaining >= 60
          ? `${Math.floor(timeRemaining / 60)}h ${timeRemaining % 60} min`
          : `${timeRemaining} min`);

        const now = new Date();
        now.setMinutes(now.getMinutes() + timeRemaining);
        const newEta = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        setRealTimeMetrics({
          distanceTraveled: parseFloat(distTraveled.toFixed(2)),
          distanceRemaining: parseFloat(distRemaining.toFixed(2)),
          progress: pct,
          durationRemaining: timeRemaining,
          formattedDuration
        });
        setProgress(pct);
        setEstimatedArrival(newEta);
        return;
      }

      const driverLat = getLat(driverPosition);
      const driverLng = getLng(driverPosition);
      const destLat = getLat(tripData.destination.coords);
      const destLng = getLng(tripData.destination.coords);

      // ✅ FIX: Calcul stable basé sur la distance totale du trajet
      // On évite d'utiliser driverStartPositionRef pour le calcul continu,
      // ce qui stoppe les flickers et les désynchronisations.
      const distTotal = tripData.trip.totalDistance || 5;
      const distRemaining = GeolocationService.calculateDistance(driverLat, driverLng, destLat, destLng) || 0;

      // Distance parcourue = Total estimé - Reste à parcourir
      let distTraveled = Math.max(0, distTotal - distRemaining);

      // Si on est à moins de 20m, on considère qu'on est arrivé (100%)
      let pct = distRemaining < 0.02 ? 100 : (distTraveled / distTotal) * 100;
      pct = Math.min(100, Math.max(0, pct));

      // Temps restant proportionnel
      const timeRemaining = pct >= 100 ? 0 : Math.max(1, Math.round((distRemaining / distTotal) * tripData.trip.totalDuration));

      const formattedDuration = pct >= 100 ? "0 min" : (timeRemaining >= 60
        ? `${Math.floor(timeRemaining / 60)}h ${timeRemaining % 60} min`
        : `${timeRemaining} min`);

      const now = new Date();
      now.setMinutes(now.getMinutes() + timeRemaining);
      const newEta = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      setRealTimeMetrics({
        distanceTraveled: parseFloat(distTraveled.toFixed(2)),
        distanceRemaining: parseFloat(distRemaining.toFixed(2)),
        progress: parseFloat(pct.toFixed(1)),
        durationRemaining: timeRemaining,
        formattedDuration
      });
      setProgress(parseFloat(pct.toFixed(1)));
      setEstimatedArrival(newEta);
    }
  }, [driverPosition, tripData.destination.coords, tripData.departure.coords, tripData.trip.totalDistance, tripData.trip.totalDuration, trip?.status, isSimulating, simulatedProgress]);

  // ✅ AUTO-TERMINER : Si progress === 100%, on finit automatiquement
  useEffect(() => {
    if (progress >= 100 && !isTripEnded) {
      console.log("🏁 Destination atteinte à 100%. Fin de trajet automatique...");

      // On émet l'événement socket pour le backend
      socketService.emit('course:terminer_auto', { reservationId: trip?.id });

      setIsTripEnded(true);
      showToast('🏁 Destination atteinte ! Trajet terminé.', 'success');

      // Appel du callback si présent
      if (onEndTrip) onEndTrip();
    }
  }, [progress, isTripEnded, role, trip?.id, onEndTrip]);

  // ✅ ÉCOUTER LA FIN DE TRAJET (Pour le passager ou side-effect)
  useEffect(() => {
    const handleTripFinished = (data) => {
      const rid = trip?.reservationId || trip?.id;
      if (String(data.reservationId) === String(rid)) {
        setIsTripEnded(true);
        showToast('🏁 Le trajet est terminé !', 'success');
        if (onEndTrip) onEndTrip();
      }
    };

    socketService.on('course:finit_avec_paiement', handleTripFinished);
    socketService.on('course:terminee', handleTripFinished);
    socketService.on('paiement:confirme', handleTripFinished);
    socketService.on('course:arrive_destination', handleTripFinished);

    return () => {
      socketService.off('course:finit_avec_paiement', handleTripFinished);
      socketService.off('course:terminee', handleTripFinished);
      socketService.off('paiement:confirme', handleTripFinished);
      socketService.off('course:arrive_destination', handleTripFinished);
    };
  }, [trip?.reservationId, trip?.id, onEndTrip]);

  // Styles de notification
  const notificationStyles = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  const notificationIcons = {
    info: <Bell className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    danger: <AlertTriangle className="w-5 h-5" />
  };

  // Si aucun trajet n'est fourni, afficher un message
  if (!trip) {
    return (
      <div className="min-h-screen mt-4  bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucun trajet en cours</h2>
          <p className="text-gray-600 mb-6">Commencez un nouveau trajet pour utiliser le suivi en temps réel</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-medium hover:opacity-90"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100  bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-800  dark:bg-slate-900  dark:text-slate-100 font-poppins transition-colors duration-300">
      {/* Header */}
      <nav className="glass-header container shadow-sm sticky w-[100%] mx-auto px-4 py-4 top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">

            <div>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Suivi en direct
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Trajet vers {tripData.destination.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium">{currentTime}</span>
            </div>
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* En-tête du trajet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-6 mb-6 border border-white/20 dark:border-white/5"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {isTripEnded ? 'Trajet terminé' : 'Trajet en cours'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                  <span className="text-sm">{tripData.departure.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                  <span className="text-sm">{tripData.destination.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-full flex items-center ${isTripEnded ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isTripEnded ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                <span className="font-medium">{isTripEnded ? 'Terminé' : 'En cours'}</span>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Arrivée estimée</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-500">{estimatedArrival}</p>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 dark:text-gray-300">Progression du trajet</span>
              <span className="font-bold text-green-700 dark:text-green-400">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span>{realTimeMetrics.distanceTraveled.toFixed(2)} km parcourus</span>
              <span>{realTimeMetrics.distanceRemaining.toFixed(2)} km restants</span>
            </div>
          </div>

          {/* Cartes d'information rapide */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ y: -4 }}
              className="passenger-card dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role === 'driver' ? (driverCtx?.acceptedTrips?.length > 1 ? 'Passagers à bord' : 'Passager') : 'Chauffeur'}
                  </p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">
                    {role === 'driver'
                      ? (driverCtx?.acceptedTrips?.length > 1
                        ? driverCtx.acceptedTrips.map(t => t.passengerName || t.nom).filter(Boolean).join(', ')
                        : (trip?.passengerName || 'Passager'))
                      : tripData.driver.name}
                  </p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(tripData.driver.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                      />
                    ))}
                    <span className="text-xs text-gray-600 dark:text-gray-500 ml-1">{tripData.driver.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="passenger-card dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Véhicule</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">
                    {tripData.driver.vehicle.brand} {tripData.driver.vehicle.model}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-500">{tripData.driver.vehicle.plate}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="passenger-card dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vitesse</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">{speed} km/h</p>
                  <p className="text-xs text-gray-600 dark:text-gray-500">{speed > 50 ? 'Rapide' : 'Modérée'}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="passenger-card dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Temps restant</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">{realTimeMetrics.formattedDuration || '-- min'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-500">Arrivée: {estimatedArrival}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Carte et Informations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-6 border border-white/20 dark:border-white/5"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Position en temps réel</h3>
                <div className="flex items-center gap-3">
                  {role === 'driver' && !isTripEnded && (
                    <motion.button
                      whileHold={{ scale: 0.95 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleSimulation}
                      className={`flex items-center text-sm font-medium px-3 py-1 rounded-full border transition-all ${isSimulating
                        ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 border-transparent'
                        }`}
                    >
                      <Zap className={`w-4 h-4 mr-2 ${isSimulating ? 'animate-pulse fill-current' : ''}`} />
                      {isSimulating ? 'Simulation en cours...' : 'Simulation'}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => mapRef.current && mapRef.current.invalidateSize()}
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                  </motion.button>
                </div>
              </div>

              <div className="h-[400px] rounded-xl overflow-hidden shadow-lg border border-gray-100">
                <MapContainer
                  center={isValidCoords(tripData.departure.coords) ? tripData.departure.coords : [9.6412, -13.5784]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                  className="rounded-xl"
                  zoomControl={true}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Contrôleur de vue pour le suivi fluide du chauffeur */}
                  <MapController
                    center={isValidCoords(driverPosition) ? driverPosition : tripData.departure.coords}
                    zoom={15}
                    animate={!(isSimulating || isSimulatingRemote)} // Pas d'animation pendant simulation pour éviter lag
                    duration={isSimulating || isSimulatingRemote ? 0.3 : 0.8}
                  />

                  {/* Marqueurs avec Halo pour visibilité "GROS" */}
                  {isValidCoords(tripData.departure.coords) && (
                    <>
                      <Circle
                        center={tripData.departure.coords}
                        radius={30}
                        pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.4, weight: 2 }}
                      />
                      <Marker position={tripData.departure.coords} icon={leafletIcons.start}>
                        <Popup>
                          <div className="p-2">
                            <p className="font-bold text-green-600">📍 Départ</p>
                            <p className="text-sm">{tripData.departure.name}</p>
                          </div>
                        </Popup>
                      </Marker>
                    </>
                  )}

                  {isValidCoords(tripData.destination.coords) && (
                    <>
                      <Circle
                        center={tripData.destination.coords}
                        radius={30}
                        pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.4, weight: 2 }}
                      />
                      <Marker position={tripData.destination.coords} icon={leafletIcons.end}>
                        <Popup>
                          <div className="p-2">
                            <p className="font-bold text-red-600">🏁 Destination</p>
                            <p className="text-sm">{tripData.destination.name}</p>
                          </div>
                        </Popup>
                      </Marker>
                      <Circle
                        center={tripData.destination.coords}
                        radius={200}
                        pathOptions={{ color: '#dc2626', fillColor: '#fecaca', fillOpacity: 0.2 }}
                      />
                    </>
                  )}

                  {isValidCoords(driverPosition) && (
                    <Marker position={driverPosition} icon={leafletIcons.driver}>
                      <Popup>
                        <div className="p-2">
                          <p className="font-bold">{tripData.driver.name}</p>
                          <p className="text-sm">{tripData.driver.vehicle.brand} {tripData.driver.vehicle.model}</p>
                          <p className="text-sm">⭐ {tripData.driver.rating} ({tripData.driver.totalTrips} trajets)</p>
                          <p className="text-xs text-gray-500">{tripData.driver.vehicle.plate} • {tripData.driver.vehicle.color}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {isValidCoords(passengerPosition) && (
                    <Marker position={passengerPosition} icon={leafletIcons.user}>
                      <Popup>
                        <div className="p-2">
                          <p className="font-bold text-blue-600">👤 {role === 'driver' ? `Passager: ${trip?.passengerName}` : 'Votre position'}</p>
                          <p className="text-sm">En attente du chauffeur</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Trajet global (Pointillés discrets en fond) */}
                  {isValidCoords(tripData.departure.coords) && isValidCoords(tripData.destination.coords) && (
                    <Polyline
                      positions={[tripData.departure.coords, tripData.destination.coords]}
                      pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.2, dashArray: '5, 10' }}
                    />
                  )}

                  {/* Trajet Chauffeur -> Destination (Actuel) */}
                  {isValidCoords(driverPosition) && isValidCoords(tripData.destination.coords) && (
                    <Polyline
                      positions={[driverPosition, tripData.destination.coords]}
                      pathOptions={{ color: '#22c55e', weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
                    />
                  )}
                </MapContainer>
              </div>

              {/* Légende */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Position du chauffeur</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {role === 'driver' ? 'Position du passager' : 'Votre position'}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-600 dark:to-green-700 rounded-full mr-2 border border-green-200 dark:border-green-800"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Point de départ</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Destination</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-6">
            {/* Carte ETA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg"
            >
              <div className="text-sm opacity-90 mb-1">ARRIVÉE ESTIMÉE</div>
              <div className="text-3xl font-bold mb-2">{estimatedArrival}</div>
              <div className="text-sm opacity-90">
                Dans <span className="font-bold">{realTimeMetrics?.formattedDuration || '-- min'}</span>
              </div>
              <div className="flex items-center mt-4 text-xs opacity-80">
                <Navigation className="w-3 h-3 mr-1" />
                <span>{tripData.trip.totalDistance} km • {tripData.trip.totalDuration} min</span>
              </div>
            </motion.div>

            {/* Actions rapides */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-6 border border-white/20 dark:border-white/5"
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContactDriver}
                  className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-3"
                >
                  <Phone className="w-5 h-5" />
                  <span>{role === 'driver' ? 'Appeler le passager' : 'Appeler le chauffeur'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShareTrip}
                  className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-3"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Partager le trajet</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEndTrip}
                  disabled={isTripEnded}
                  className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-3 ${isTripEnded ? 'bg-green-600' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'} text-white disabled:opacity-50`}
                >
                  <Flag className="w-5 h-5" />
                  <span>{isTripEnded ? 'Trajet terminé' : "J'arrive à destination"}</span>
                </motion.button>


              </div>
            </motion.div>

            {/* Détails du paiement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-6 border border-white/20 dark:border-white/5"
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Détails du paiement</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Prix estimé</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{tripData.trip.price.estimated.toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Frais de service</span>
                  <span className="font-bold text-green-600 dark:text-green-400">+ {tripData.trip.price.serviceFee.toLocaleString()} GNF</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800 dark:text-gray-100">Total</span>
                    <span className="text-2xl font-bold text-green-700 dark:text-green-500">
                      {tripData.trip.price.total.toLocaleString()} GNF
                    </span>
                  </div>
                </div>
              </div>
              {tripData.trip.paymentMethod && (
                <div className="mt-4 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-orange-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{tripData.trip.paymentMethod}</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 ${notificationStyles[notification.type]} text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm`}
          >
            <div className="flex items-center space-x-3">
              {notificationIcons[notification.type]}
              <p className="font-medium">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingDisputeButton
        currentTrip={trip}
        role={role === 'driver' ? 'chauffeur' : 'passager'}
        offset={10}
      />
      <EmergencyButton />
    </div>
  );
};

// Valeurs par défaut pour les props
RealTimeTracking.defaultProps = {
  trip: null,
  driver: null,
  onBack: () => console.log('Retour'),
  onEmergency: (data) => console.log('Urgence:', data),
  onContactDriver: (phone) => console.log('Contacter:', phone),
  onCancelTrip: () => console.log('Annuler trajet'),
  onEndTrip: () => console.log('Terminer trajet'),
  onShareTrip: (data) => console.log('Partager:', data)
};

export default RealTimeTracking;
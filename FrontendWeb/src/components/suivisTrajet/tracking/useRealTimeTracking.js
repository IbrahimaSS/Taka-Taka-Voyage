import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import L from 'leaflet';
import toast from 'react-hot-toast';
import axios from 'axios';
import { ensureLeafletIcons } from '../../maps/leafletIcons';
import { GeolocationService } from '../../../services/geolocation';
import { socketService } from '../../../services/socketService';
import { useDriverContext } from '../../../context/DriverContext';
import { isValidCoords } from './trackingUtils';

export const useRealTimeTracking = ({
  role,
  trip,
  driver,
  onContactDriver,
  onCancelTrip,
  onEndTrip,
  onShareTrip,
}) => {
  const driverCtx = role === 'driver' ? useDriverContext() : null;

  const [driverPosition, setDriverPosition] = useState(
    driver?.currentLocation || driver?.location || null
  );
  const [passengerPosition] = useState(
    trip?.pickupCoords || [9.6412, -13.5784]
  );
  const [progress, setProgress] = useState(0);
  const [isTripEnded, setIsTripEnded] = useState(false);
  const [speed, setSpeed] = useState(42);
  const [currentTime, setCurrentTime] = useState('--:--');
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [estimatedArrival, setEstimatedArrival] = useState('14:45');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [showScanner, setShowScanner] = useState(false);

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
      coords: isValidCoords(trip?.pickupCoords) ? trip.pickupCoords : [9.6412, -13.5784],
      name: trip?.pickup || trip?.depart || trip?.pickupAddress || 'Point de départ',
      address: trip?.pickup || trip?.depart || trip?.pickupAddress || ''
    };

    const destination = {
      coords: isValidCoords(trip?.destinationCoords) ? trip.destinationCoords : [9.6412, -13.5784],
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

  // Gestionnaire de contact
  const handleContactDriver = () => {
    if (tripData.driver?.phone) {
      window.open(`tel:${tripData.driver.phone}`);
      showToast(`📞 Appel du chauffeur ${tripData.driver.name}...`, 'info');
    }
    if (onContactDriver) onContactDriver(tripData.driver.phone);
  };

  // Gestionnaire d'annulation (Option 2 - Frais d'annulation fixes 5 000 GNF)
  const handleCancelTrip = async () => {
    const hasDriver = !!driver || !!trip?.chauffeur;
    const confirmMessage = hasDriver
      ? 'Êtes-vous sûr de vouloir annuler ce trajet ?\n\n⚠️ Le chauffeur est déjà en route. Des frais d\'annulation de 5 000 GNF seront appliqués pour compenser son déplacement.\n\nLe reste sera remboursé sur votre portefeuille.'
      : 'Êtes-vous sûr de vouloir annuler ce trajet ?\n\nVotre paiement sera remboursé intégralement.';

    if (window.confirm(confirmMessage)) {
      clearInterval(progressInterval.current);
      setIsTripEnded(true);

      // Appel API pour l'annulation et le remboursement
      const rid = trip?.reservationId || trip?.id;
      if (rid) {
        try {
          const { tripService } = await import('../../../services/tripService');
          const response = await tripService.cancelAndRefund(rid);
          const data = response?.data;

          if (data?.fraisAnnulation?.avecFrais) {
            showToast(
              `Trajet annulé. Frais : ${data.fraisAnnulation.montantFrais?.toLocaleString()} GNF. Remboursement : ${data.fraisAnnulation.montantRembourse?.toLocaleString()} GNF.`,
              'warning'
            );
          } else {
            showToast('Trajet annulé. Remboursement intégral effectué.', 'warning');
          }
        } catch (err) {
          console.error("❌ Erreur annulation API:", err);
          // Fallback: annuler via socket si l'API échoue
          socketService.emit('course:annuler', { reservationId: rid, source: 'PASSAGER' });
          showToast('Trajet annulé. Un remboursement sera traité.', 'warning');
        }
      }

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

  const handleQRScanSuccess = async (code) => {
    try {
      setShowScanner(false);
      toast.loading('Validation du ticket...', { id: 'scan-loading' });

      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/tickets/scanner`, {
        codeUnique: code
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.dismiss('scan-loading');

      if (response.data.succes) {
        toast.success('Ticket validé ! Passager autorisé à bord.');
        // Si le scan doit changer le statut de la course localement
        if (role === 'driver') {
          // On peut émettre un signal de montée réussie
          socketService.emit('course:passager_ramasse', {
            reservationId: trip?.reservationId || trip?.id
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
          // Vitesse de simulation rapide (3.33% par seconde -> 30s pour 100%)
          const step = 3.33;
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
    if (mapRef.current && !window.hasInitiallyCentered) {
      const p1 = driverPosition;
      const p2 = tripData.departure.coords;
      const p3 = tripData.destination.coords;

      if (isValidCoords(p1) && isValidCoords(p2) && isValidCoords(p3)) {
        const bounds = L.latLngBounds([p1, p2, p3]);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        window.hasInitiallyCentered = true;
      }
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

  return {
    driverCtx,
    driverPosition,
    passengerPosition,
    progress,
    isTripEnded,
    speed,
    currentTime,
    showNotification,
    notification,
    estimatedArrival,
    isSimulating,
    showScanner,
    setShowScanner,
    mapRef,
    remoteIsSimulatingRef,
    tripData,
    realTimeMetrics,
    handleContactDriver,
    handleCancelTrip,
    handleEndTrip,
    handleShareTrip,
    handleQRScanSuccess,
    toggleSimulation,
  };
};

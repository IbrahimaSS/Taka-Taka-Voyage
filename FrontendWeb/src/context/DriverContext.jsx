// src/context/DriverContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { socketService } from "../services/socketService";
import { useGeolocation } from "../hooks/useGeolocation";
import { GeolocationService } from "../services/geolocation";
import { useAuth } from "./AuthContext";
import { toast } from "react-hot-toast";
import { useNotificationCenter, NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from "./NotificationContext";
import { offlineTripService } from "../services/offlineTripService";
import { tripService } from "../services/tripService";
import { taxiPartageApiService } from "../services/taxiPartageService";


const DriverContext = createContext(null);
export const useDriverContext = () => {
  const context = useContext(DriverContext);
  // Retourner null au lieu de planter si on est hors du provider (ex: AssistantIA global)
  return context || null;
};

// Util: détecter si un nombre ressemble à une latitude/longitude
const isLat = (v) => typeof v === "number" && v >= -90 && v <= 90;
const isLng = (v) => typeof v === "number" && v >= -180 && v <= 180;

/**
 * Normalise coords reçues backend:
 * - accepte [lat,lng] (Leaflet)
 * - accepte [lng,lat] (GeoJSON)
 * Retourne { lat, lng } ou null
 */
const normalizeCoords = (coords) => {
  if (!Array.isArray(coords) || coords.length < 2) return null;

  const a = Number(coords[0]);
  const b = Number(coords[1]);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;

  // Cas 1: [lat,lng]
  if (isLat(a) && isLng(b)) return { lat: a, lng: b };

  // Cas 2: [lng,lat]
  if (isLng(a) && isLat(b)) return { lat: b, lng: a };

  // Heuristique (si l’ordre est ambigu)
  if (Math.abs(a) <= 90 && Math.abs(b) > 90) return { lat: a, lng: b };
  if (Math.abs(b) <= 90 && Math.abs(a) > 90) return { lat: b, lng: a };

  return null;
};

export const DriverProvider = ({ children }) => {
  // ────────────────────────────────────────────────
  // États principaux
  // ────────────────────────────────────────────────
  const { user } = useAuth();

  // ✅ Suggestion 2: Initialiser directement depuis le stockage (taka_active_trip_driver)
  const [isOnline, setIsOnline] = useState(() => {
    const saved = localStorage.getItem('taka_active_trip_driver');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.state?.isOnline || false;
      } catch (e) { return false; }
    }
    return false;
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState(() => {
    const saved = localStorage.getItem('taka_active_trip_driver');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.state?.status || "offline";
      } catch (e) { return "offline"; }
    }
    return "offline";
  }); // offline | available | busy
  const { addNotification } = useNotificationCenter();

  const geolocationOptions = useMemo(() => ({
    enableHighAccuracy: true,
    maximumAge: 2000,
  }), []);

  const { location: realLocation } = useGeolocation(geolocationOptions);

  const [driverLocation, setDriverLocation] = useState({
    lat: 9.6412,
    lng: -13.5784,
  });

  useEffect(() => {
    if (realLocation?.lat != null && realLocation?.lng != null) {
      setDriverLocation(realLocation);
    }
  }, [realLocation]);

  // Demandes reçues (affichées par TripNotificationToast)
  const [tripRequests, setTripRequests] = useState([]);

  // Courses acceptées
  const [acceptedTrips, setAcceptedTrips] = useState([]);

  // ==================== TAXI PARTAGÉ ====================
  const [groupeTaxiPartage, setGroupeTaxiPartage] = useState(null);
  const [fileRamassageTP, setFileRamassageTP] = useState([]);
  const [peutDemarrerTP, setPeutDemarrerTP] = useState(false);
  const [passagersEnAttenteTP, setPassagersEnAttenteTP] = useState(0);
  const [passagersRamassesTP, setPassagersRamassesTP] = useState(0);
  const groupeTaxiPartageRef = useRef(null);
  useEffect(() => { groupeTaxiPartageRef.current = groupeTaxiPartage; }, [groupeTaxiPartage]);

  // Trip actif
  const [currentPickupTripId, setCurrentPickupTripId] = useState(null);

  // idle | to_pickup | at_pickup | ready_to_start | in_progress
  const [tripStep, setTripStep] = useState("idle");

  const [stats, setStats] = useState({
    requestsToday: 0,
    acceptedToday: 0,
    rejectedToday: 0,
  });

  // 🔄 [OFFLINE] Restauration initiale (Déplacé après les déclarations d'état)
  useEffect(() => {
    if (user) {
      const localState = offlineTripService.loadState('CHAUFFEUR');
      if (localState) {
        console.log("💾 [DRIVER] Restauration stockage local");
        setIsOnline(localState.isOnline);
        setStatus(localState.status);
        if (localState.acceptedTrips) setAcceptedTrips(localState.acceptedTrips);
        setCurrentPickupTripId(localState.currentPickupTripId);
        setTripStep(localState.tripStep || "idle");

        if (localState.currentPickupTripId) {
          socketService.emit("course:rejoindre", { reservationId: localState.currentPickupTripId });
        }
      }
    }
  }, [user]);

  // 💾 [OFFLINE] Sauvegarde automatique
  useEffect(() => {
    if (user) {
      offlineTripService.saveState('CHAUFFEUR', {
        isOnline,
        status,
        acceptedTrips,
        currentPickupTripId,
        tripStep
      });
    }
  }, [isOnline, status, acceptedTrips, currentPickupTripId, tripStep, user]);

  // 🔄 Synchronisation avec le serveur (Ramassage / En cours)
  const refreshActiveTrips = useCallback(async () => {
    if (!user || !isOnline) return;
    try {
      const { data } = await tripService.getPickupTrips();
      if (data?.succes && data?.courses) {
        // Transformer les données backend au format local context
        const formatted = data.courses.map(c => ({
          ...c,
          id: c._id || c.id,
          reservationId: c.reservationId || c._id || c.id,
          passengerName: c.passager ? `${c.passager.prenom} ${c.passager.nom}` : "Passager",
          passengerPhone: c.passager?.telephone,
          pickupAddress: c.depart,
          destinationAddress: c.destination,
          pickupCoords: c.departLat ? [c.departLat, c.departLng] : null,
          destinationCoords: c.destinationLat ? [c.destinationLat, c.destinationLng] : null,
          pickupStatus: ['EN_ROUTE', 'EN_COURS', 'RAMASSE', 'ABORD'].includes(c.statut) ? 'picked_up' :
            (c.statut === 'ARRIVE' || c.statut === 'ARRIVEE' ? 'arrived' :
              (c.statut === 'ASSIGNEE' ? 'approaching' : 'pending')),
          estimatedFare: c.prix,
          momentPaiement: c.momentPaiement || c.paymentMoment,
          paymentMethod: c.paymentMethod || c.methodePaiement || c.modePaiement,
          statutPaiement: c.statutPaiement || c.paymentStatus,
          typeCourse: c.typeCourse
        }));

        setAcceptedTrips(formatted);

        // Si un trajet est EN_ROUTE, on s'assure que le step est correct
        const activeOne = formatted.find(f => f.pickupStatus === 'picked_up');
        if (activeOne) {
          setTripStep("in_progress");
          setCurrentPickupTripId(activeOne.id);
          setStatus("busy");
        } else {
          // ✅ Suggestion 2: Si plus de trajet, le chauffeur redeviens "En ligne" (available)
          setStatus("available");
          setTripStep("idle");
          setCurrentPickupTripId(null);
        }
      } else {
        // Pas de courses du tout
        setStatus("available");
        setTripStep("idle");
        setCurrentPickupTripId(null);
      }
    } catch (error) {
      console.error("[DriverContext] Error refreshing trips:", error);
    }
  }, [user, isOnline]);

  // Sync au passage en ligne
  useEffect(() => {
    if (isOnline) {
      refreshActiveTrips();
    }
  }, [isOnline, refreshActiveTrips]);


  // Anti doublon
  const processedRequestIds = useRef(new Set());

  // Utils
  const calculateDistance = useCallback(GeolocationService.calculateDistance, []);

  // ==================== LOGIQUE TAXI PARTAGÉ (MÉTIER) ====================
  const fetchFileRamassage = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await taxiPartageApiService.getFileRamassage();
      if (res.data && res.data.succes) {
        setGroupeTaxiPartage(res.data.groupe);
        setFileRamassageTP(res.data.fileRamassage || []);
        setPeutDemarrerTP(res.data.peutDemarrer || false);
        setPassagersEnAttenteTP(res.data.passagersEnAttente || 0);
        setPassagersRamassesTP(res.data.passagersRamasses || 0);
      }
    } catch (err) {
      console.error("Erreur fetch file ramassage", err);
    }
  }, [user?._id]);

  useEffect(() => {
    if (fileRamassageTP && fileRamassageTP.length > 0) {
      const aEncoreDesAttentes = fileRamassageTP.some(p => p.statut !== 'RAMASSE' && p.statut !== 'ARRIVE' && p.statut !== 'ABORD');
      if (aEncoreDesAttentes && peutDemarrerTP) {
        setPeutDemarrerTP(false);
      }
    }
  }, [fileRamassageTP, peutDemarrerTP]);

  // ✅ Chauffeur authentifié (via AuthContext)
  const DRIVER = useMemo(
    () => ({
      id: user?._id || user?.id || null,
      nom: user?.nom || "",
      prenom: user?.prenom || "",
    }),
    [user?._id, user?.id, user?.nom, user?.prenom]
  );

  // ✅ refs anti-stale
  const tripRequestsRef = useRef([]);
  useEffect(() => {
    tripRequestsRef.current = tripRequests;
  }, [tripRequests]);

  const acceptedTripsRef = useRef([]);
  useEffect(() => {
    acceptedTripsRef.current = acceptedTrips;
  }, [acceptedTrips]);

  const currentPickupTripIdRef = useRef(null);
  useEffect(() => {
    currentPickupTripIdRef.current = currentPickupTripId;
  }, [currentPickupTripId]);

  const tripStepRef = useRef("idle");
  useEffect(() => {
    tripStepRef.current = tripStep;
  }, [tripStep]);

  const driverLocationRef = useRef(driverLocation);
  useEffect(() => {
    driverLocationRef.current = driverLocation;
  }, [driverLocation]);

  // Refs pour la robustesse du broadcast (Production Ready)
  const lastBroadcastRef = useRef(null);
  const lastBroadcastTimeRef = useRef(0);

  // Paramètres zone
  const MAX_DISTANCE_KM = 5;
  const KEEP_FAR_REQUESTS = true;

  // ────────────────────────────────────────────────
  // 1) Réception d'une nouvelle demande
  // ────────────────────────────────────────────────
  const handleNewTripRequest = useCallback(
    (tripData) => {
      console.log("📩 [DRIVER_CONTEXT] *** course:demande REÇUE ***", tripData);

      const reservationId = tripData?.reservationId || tripData?.id;
      if (!reservationId) {
        console.warn("❌ [DRIVER_CONTEXT] Pas de reservationId dans tripData");
        return;
      }

      // si déjà en course, ignorer
      if (tripStepRef.current === "in_progress") {
        console.log(`❕ [DRIVER_CONTEXT] Chauffeur occupé (${tripStepRef.current}), on ignore.`);
        return;
      }

      // anti doublon (on laisse passer si c'est un rappel J-1)
      if (processedRequestIds.current.has(reservationId) && !tripData.isRappel) {
        console.log(`❕ [DRIVER_CONTEXT] Demande ${reservationId} déjà traitée.`);
        return;
      }

      const pickup = normalizeCoords(tripData.pickupCoords);
      const dest = normalizeCoords(tripData.destinationCoords);

      let distanceKm = null;
      if (pickup) {
        distanceKm = calculateDistance(
          driverLocationRef.current.lat,
          driverLocationRef.current.lng,
          pickup.lat,
          pickup.lng
        );
      }

      const tooFar = distanceKm != null && distanceKm > MAX_DISTANCE_KM;
      if (tooFar && !KEEP_FAR_REQUESTS) return;

      processedRequestIds.current.add(reservationId);

      const request = {
        ...tripData,
        id: reservationId,
        reservationId,

        pickupCoords: pickup ? [pickup.lat, pickup.lng] : null,
        destinationCoords: dest ? [dest.lat, dest.lng] : null,

        distanceToDriver: distanceKm == null ? null : Number(distanceKm.toFixed(1)),
        tooFar,
        maxDistanceKm: MAX_DISTANCE_KM,

        receivedAt: new Date().toISOString(),
        expiresIn: Number(tripData?.expiresIn ?? 60),
      };

      setTripRequests((prev) => [request, ...prev]);
      setStats((prev) => ({ ...prev, requestsToday: prev.requestsToday + 1 }));

      console.log("✅ [DRIVER] course:demande reçue", {
        reservationId,
        distanceKm: request.distanceToDriver,
        tooFar: request.tooFar,
      });
    },
    [calculateDistance]
  );

  // ────────────────────────────────────────────────
  // 1.5) Handlers Taxi Partagé
  // ────────────────────────────────────────────────
  const onGroupeRejoint = useCallback((data) => {
    console.log("🚕 [DRIVER] Groupe rejoint:", data);
    setGroupeTaxiPartage(data.groupe);
    setPeutDemarrerTP(data.peutDemarrer || false);
    setPassagersEnAttenteTP(data.passagersEnAttente || 0);
    setPassagersRamassesTP(data.passagersRamasses || 0);
    fetchFileRamassage();
  }, [fetchFileRamassage]);

  const onStatutMisAJour = useCallback((data) => {
    console.log("🚕 [DRIVER] Statut mis à jour:", data);
    fetchFileRamassage();
  }, [fetchFileRamassage]);

  const onPeutDemarrer = useCallback((data) => {
    console.log("✅ [DRIVER] Peut démarrer taxi partagé:", data);
    setPeutDemarrerTP(true);
    if (data.message) toast.success(data.message);
  }, []);

  const onDemarrageOk = useCallback((data) => {
    console.log("🚀 [DRIVER] Démarrage confirmé:", data);
    setAcceptedTrips(prev => prev.map(t => {
      // Pour les taxis partagés, on marque tout le monde comme ramassé au démarrage global
      if (t.typeCourse === 'TAXI_PARTAGE' || t.vehicleType === 'TAXI_PARTAGE') {
        return { ...t, pickupStatus: 'picked_up' };
      }
      return t;
    }));
    setTripStep("in_progress");
    setStatus("busy");
  }, []);

  // ────────────────────────────────────────────────
  // 2) Connexion socket + listeners
  // ────────────────────────────────────────────────
  const onTripFinished = useCallback(() => {
    setCurrentPickupTripId(null);
    setTripStep("idle");
    setStatus("available");
  }, []);

  useEffect(() => {
    if (!isOnline || !DRIVER.id) {
      socketService.disconnect();
      setIsConnecting(false);
      setStatus("offline");
      setTripRequests([]);
      setAcceptedTrips([]);
      processedRequestIds.current.clear();
      setCurrentPickupTripId(null);
      setTripStep("idle");
      return;
    }

    setIsConnecting(true);
    setStatus("available");

    console.log("🔌 [DRIVER_CONTEXT] Connexion socket CHAUFFEUR:", DRIVER.id);
    socketService.connect(DRIVER.id, "CHAUFFEUR", DRIVER.nom, DRIVER.prenom);

    console.log("👂 [DRIVER_CONTEXT] Enregistrement listener course:demande");
    const onAcceptedOk = (data) => {
      const reservationId = data?.reservationId;
      const typeCourse = data?.typeCourse; // ✅ Reçu du backend suite à ma modif socket.js

      if (!reservationId) return;
      setStats((prev) => ({ ...prev, acceptedToday: prev.acceptedToday + 1 }));

      const req = tripRequestsRef.current.find((r) => r.id === reservationId);

      // ✅ LOGIQUE CRITIQUE: Si c'est une course PLANIFIEE, on ne l'ajoute PAS à la file de ramassage (acceptedTrips)
      // Elle doit rester dans le Planning. Elle n'entrera dans acceptedTrips que via "Commencer"
      const isPlanned = typeCourse === "PLANIFIEE" || req?.typeCourse === "PLANIFIEE";

      if (req && !isPlanned) {
        setAcceptedTrips((prev) => {
          if (prev.some((t) => t.id === reservationId)) return prev;
          return [{ ...req, pickupStatus: "pending" }, ...prev];
        });
      }

      setTripRequests((prev) => prev.filter((r) => r.id !== reservationId));
    };

    const onAlreadyTaken = (data) => {
      if (data?.reservationId) {
        setTripRequests((prev) => prev.filter((r) => r.id !== data.reservationId));
        processedRequestIds.current.delete(data.reservationId);
      }
    };

    const onRefusedOk = (data) => {
      const reservationId = data?.reservationId;
      if (!reservationId) return;
      setStats((prev) => ({ ...prev, rejectedToday: prev.rejectedToday + 1 }));
      setTripRequests((prev) => prev.filter((r) => r.id !== reservationId));
      processedRequestIds.current.delete(reservationId);
    };

    const onTripCancelled = (data) => {
      const rid = data?.reservationId;
      if (!rid) return;
      setTripRequests((prev) => prev.filter((r) => r.id !== rid));
      setAcceptedTrips((prev) => prev.filter((t) => t.id !== rid));
      processedRequestIds.current.delete(rid);
      if (currentPickupTripIdRef.current === rid) {
        setCurrentPickupTripId(null);
        setTripStep("idle");
        setStatus("available");
      }
    };

    const onPaiementVerse = (data) => {
      const montant = (data.montant || 0).toLocaleString('fr-FR');
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        category: NOTIFICATION_CATEGORIES.FINANCIAL,
        title: 'Versement reçu 💰',
        message: `L'administration a versé ${montant} GNF sur votre compte.`,
        priority: 'high'
      });
      window.dispatchEvent(new CustomEvent('chauffeur:revenu_mis_a_jour'));
    };

    const onPaymentRequested = (data) => {
      console.log("💰 [DRIVER] Demande de confirmation de paiement reçue:", data);
      toast.success("💰 Le passager confirme avoir payé !\nVeuillez vérifier la réception et valider.", {
        id: 'payment-notif-cash',
        duration: 8000
      });
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        category: NOTIFICATION_CATEGORIES.FINANCIAL,
        title: 'Paiement à confirmer 💰',
        message: "Le passager a déclaré avoir payé en espèces. Veuillez confirmer sur votre interface.",
        priority: 'high'
      });
    };

    const onAutoPaymentConfirmed = (data) => {
      console.log("✅ [DRIVER] Paiement automatique confirmé:", data);
      toast.success("✅ Paiement reçu (Automatique) !\nLe trajet est maintenant réglé.", {
        id: 'payment-notif-auto',
        duration: 6000
      });
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        category: NOTIFICATION_CATEGORIES.FINANCIAL,
        title: 'Paiement reçu ✅',
        message: "Le paiement électronique a été validé avec succès.",
        priority: 'high'
      });

      const rid = data?.reservationId;
      if (rid && acceptedTripsRef.current.length > 1 && !data?.groupeId) {
        // Il reste d'autres réservations (Taxi Partagé)
        setAcceptedTrips((prev) => {
          const newTrips = prev.filter((t) => t.id !== rid && t.reservationId !== rid);
          if (newTrips.length === 0) {
            onTripFinished();
          } else if (currentPickupTripIdRef.current === rid) {
            setCurrentPickupTripId(newTrips[0].id);
          }
          return newTrips;
        });
      } else {
        // Dernier passager ou terminaison globale
        onTripFinished();
      }
    };

    // Inscription des listeners
    socketService.on("course:demande", handleNewTripRequest);
    socketService.on("course:acceptee_confirmation", onAcceptedOk);
    socketService.on("course:deja_prise", onAlreadyTaken);
    socketService.on("course:refusee_confirmation", onRefusedOk);
    socketService.on("trip_cancelled", onTripCancelled);
    socketService.on("course:annulee", onTripCancelled);
    socketService.on("paiement:verse", onPaiementVerse);
    socketService.on("paiement:reception_a_confirmer", onPaymentRequested);
    socketService.on("course:terminee", onTripFinished);
    socketService.on("course:finit_avec_paiement", onAutoPaymentConfirmed);
    socketService.on("paiement:confirme", onAutoPaymentConfirmed);
    socketService.on("taxipartage:groupe_rejoint", onGroupeRejoint);
    socketService.on("taxipartage:statut_mis_a_jour", onStatutMisAJour);
    socketService.on("taxipartage:peut_demarrer", onPeutDemarrer);
    socketService.on("course:demarrage_ok", onDemarrageOk);

    setIsConnecting(false);

    return () => {
      socketService.off("course:demande", handleNewTripRequest);
      socketService.off("course:acceptee_confirmation");
      socketService.off("course:deja_prise");
      socketService.off("course:refusee_confirmation");
      socketService.off("trip_cancelled");
      socketService.off("course:annulee");
      socketService.off("paiement:verse");
      socketService.off("course:terminee");
      socketService.off("course:finit_avec_paiement");
      socketService.off("paiement:confirme");
      socketService.off("taxipartage:groupe_rejoint");
      socketService.off("taxipartage:statut_mis_a_jour");
      socketService.off("taxipartage:peut_demarrer");
      socketService.off("course:demarrage_ok");
    };
  }, [isOnline, DRIVER?.id]); // On réduit les dépendances au strict minimum

  // ────────────────────────────────────────────────
  // 3) GPS en continu (uniquement si course active)
  //    - Phase to_pickup/at_pickup: broadcast vers currentPickupTripId
  //    - Phase in_progress: broadcast vers TOUTES les réservations acceptées
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOnline || !driverLocation) return;

    // Déterminer les reservationIds à broadcaster
    const getTargetIds = () => {
      // ✅ CORRECTIF CRITIQUE: En trajet, on diffuse à TOUS les passagers du groupe
      // même si leur statut individuel n'est pas encore 'picked_up' en DB.
      if (tripStepRef.current === "in_progress") {
        return acceptedTripsRef.current.map((t) => t.id || t.reservationId);
      }
      if (currentPickupTripIdRef.current) {
        return [currentPickupTripIdRef.current];
      }
      return [];
    };

    const ids = getTargetIds();
    if (ids.length === 0) return;

    // ✅ Broadcast position intelligent (Production Ready - High Reactivity)
    const interval = setInterval(() => {
      // 🛑 STOP GPS RÉEL SI SIMULATION ACTIVE : Évite "l'un bouge et l'autre non"
      if (window.isTravelingSimulationActive) {
        return;
      }

      const currentIds = getTargetIds();
      if (currentIds.length === 0) return;

      const lastLoc = lastBroadcastRef.current;
      const lastTime = lastBroadcastTimeRef.current;
      const currentLoc = driverLocationRef.current || driverLocation;
      const now = Date.now();

      let shouldBroadcast = false;

      if (!lastLoc) {
        shouldBroadcast = true;
      } else {
        const dist = calculateDistance(currentLoc.lat, currentLoc.lng, lastLoc.lat, lastLoc.lng);
        const timeSinceLast = now - lastTime;
        if (dist > 0.002 || timeSinceLast > 5000) {
          shouldBroadcast = true;
        }
      }

      if (shouldBroadcast) {
        for (const rid of currentIds) {
          const targetTrip = acceptedTripsRef.current.find(t => t.id === rid);
          socketService.emit("position:update", {
            reservationId: rid,
            lat: currentLoc.lat,
            lng: currentLoc.lng,
            isSimulation: false
          });
        }
        lastBroadcastRef.current = currentLoc;
        lastBroadcastTimeRef.current = now;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isOnline, currentPickupTripId, tripStep]);



  // ────────────────────────────────────────────────
  // 4) Expiration demandes
  // ────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTripRequests((prev) =>
        prev
          .map((req) => ({
            ...req,
            expiresIn: Math.max(0, Number(req.expiresIn ?? 0) - 1),
          }))
          .filter((req) => req.expiresIn > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ────────────────────────────────────────────────
  // Actions UI
  // ────────────────────────────────────────────────
  const setOnline = (value) => setIsOnline(!!value);
  const toggleOnline = () => setIsOnline((prev) => !prev);

  const acceptTripRequest = (reservationId) => {
    if (!reservationId) return;
    socketService.emit("course:accepter", { reservationId });
  };

  const rejectTripRequest = (reservationId) => {
    if (!reservationId) return;
    socketService.emit("course:refuser", { reservationId });
  };

  const dismissTripRequest = (reservationId) => {
    if (!reservationId) return;
    setTripRequests((prev) => prev.filter((r) => r.id !== reservationId));
  };

  const selectPickupTrip = (reservationId) => {
    setCurrentPickupTripId(reservationId);
    setAcceptedTrips((prev) =>
      prev.map((t) => (t.id === reservationId ? { ...t, pickupStatus: "approaching" } : t))
    );
    socketService.emit("course:rejoindre", { reservationId });
    setTripStep("to_pickup");
    setStatus("busy");
  };

  const startPlannedTrip = useCallback((reservationRaw) => {
    if (!reservationRaw?._id) return;
    const reservationId = reservationRaw._id;

    // 1. Informer le serveur via Socket qu'on rejoint ce passager
    socketService.emit("course:rejoindre", { reservationId });

    // 2. Préparer l'objet pour le tracking local
    // Support des formats GeoJSON (pickupCoords) et champs individuels (departLat)
    const pickup = reservationRaw.pickupCoords ? normalizeCoords(reservationRaw.pickupCoords) :
      (reservationRaw.departLat ? { lat: reservationRaw.departLat, lng: reservationRaw.departLng } : null);

    const dest = reservationRaw.destinationCoords ? normalizeCoords(reservationRaw.destinationCoords) :
      (reservationRaw.destinationLat ? { lat: reservationRaw.destinationLat, lng: reservationRaw.destinationLng } : null);

    const formattedTrip = {
      ...reservationRaw, // ✅ PRÉSERVER TOUS LES CHAMPS
      id: reservationId,
      reservationId,
      passengerName: reservationRaw.passager ? `${reservationRaw.passager.prenom} ${reservationRaw.passager.nom}` : "Passager",
      passengerPhone: reservationRaw.passager?.telephone,
      pickupAddress: reservationRaw.depart,
      destinationAddress: reservationRaw.destination,
      pickupCoords: pickup ? [pickup.lat, pickup.lng] : null,
      destinationCoords: dest ? [dest.lat, dest.lng] : null,
      pickupStatus: 'approaching',
      estimatedFare: reservationRaw.prix,
      typeCourse: reservationRaw.typeCourse,
      raw: reservationRaw
    };

    // 3. Mettre à jour les listes
    setAcceptedTrips(prev => {
      if (prev.some(t => t.id === reservationId)) return prev;
      return [formattedTrip, ...prev];
    });

    // 4. Activer le mode tracking
    setCurrentPickupTripId(reservationId);
    setTripStep("to_pickup");
    setStatus("busy");

    return { succes: true };
  }, []);

  const signalArrival = async () => {
    if (!currentPickupTripId) return;
    const trip = acceptedTripsRef.current.find(t => t.id === currentPickupTripId);
    const isTP = trip?.typeCourse === "TAXI_PARTAGE" || trip?.vehicleType === "TAXI_PARTAGE";

    socketService.emit("course:signaler_arrivee", { reservationId: currentPickupTripId });
    setAcceptedTrips((prev) =>
      prev.map((t) => (t.id === currentPickupTripId ? { ...t, pickupStatus: "arrived" } : t))
    );
    setTripStep("at_pickup");
    if (isTP) await fetchFileRamassage();
  };

  const confirmPassengerPickup = async (reservationId) => {
    const trip = acceptedTripsRef.current.find(t => t.id === reservationId);
    const isTP = trip?.typeCourse === "TAXI_PARTAGE" || trip?.vehicleType === "TAXI_PARTAGE";

    setAcceptedTrips((prev) =>
      prev.map((t) => (t.id === reservationId ? { ...t, pickupStatus: "picked_up" } : t))
    );
    setTripStep("ready_to_start");
    if (isTP) await fetchFileRamassage();
  };

  const startGlobalTrip = (specificTripIds = null) => {
    // Émet un signal global pour tous les passagers "picked_up" ou ceux spécifiés
    const pickedUpIds = specificTripIds || acceptedTrips
      .filter((t) => t.pickupStatus === "picked_up")
      .map((t) => t.id);

    if (pickedUpIds.length === 0) return;

    socketService.emit("course:demarrer_global", { reservationIds: pickedUpIds });
    setTripStep("in_progress");
    setStatus("busy");
  };

  const startTripImmediately = useCallback(async (reservationId) => {
    const trip = acceptedTripsRef.current.find(t => t.id === reservationId);
    if (!trip) return false;

    const isTP = trip.typeCourse === "TAXI_PARTAGE" || trip.vehicleType === "TAXI_PARTAGE";

    if (isTP) {
      if (!peutDemarrerTP) {
        toast.error("⏳ En attente des autres passagers...");
        return false;
      }
      try {
        console.log("🚀 [DRIVER] Démarrage trajet TP, groupe:", groupeTaxiPartage?._id);
        const res = await taxiPartageApiService.demarrerTrajet(groupeTaxiPartage?._id);
        console.log("📦 [DRIVER] Réponse API demarrerTrajet:", res.data);

        if (res.data?.succes) {
          const reservations = groupeTaxiPartage?.reservations || res.data.groupe?.reservations || [];
          // Extraction robuste des IDs de réservation (string)
          const reservationIds = reservations
            .map(r => (r.reservation?._id || r.reservation || "").toString())
            .filter(id => id !== "");

          console.log("📤 [DRIVER] Émission course:demarrer_global:", reservationIds);
          if (reservationIds.length > 0) {
            socketService.emit("course:demarrer_global", { reservationIds });
          }

          // ✅ FORCE: Activer la diffusion GPS vers tout le groupe
          setTripStep("in_progress");
          setStatus("busy");

          toast.success("🚀 Trajet démarré !");
          if (typeof fetchFileRamassage === 'function') await fetchFileRamassage();
        } else {
          return false;
        }
      } catch (err) {
        console.error("Erreur démarrage TP", err);
        toast.error("Erreur serveur lors du démarrage");
        return false;
      }
    } else {
      // Pour les courses immédiates (Carpooling), on démarre TOUS les passagers vers lesquels on est arrivé/qu'on a ramassé
      const allReadyIds = acceptedTripsRef.current
        .filter(t => t.pickupStatus === 'picked_up' || t.pickupStatus === 'arrived' || t.id === reservationId)
        .map(t => t.id);

      console.log("📤 [DRIVER] Démarrage global (Immediate):", allReadyIds);
      socketService.emit("course:demarrer_global", { reservationIds: allReadyIds });

      setTripStep("in_progress");
      setStatus("busy");
    }
  }, [peutDemarrerTP, groupeTaxiPartage?._id, fetchFileRamassage]);

  const startCourse = () => {
    if (!currentPickupTripId) return;
    socketService.emit("course:demarrer", { reservationId: currentPickupTripId });
    setTripStep("in_progress");
    setStatus("busy");
  };

  const reportDispute = (payload) => {
    console.log("DISPUTE:", payload);
  };

  const value = useMemo(
    () => ({
      isOnline,
      isConnecting,
      status,
      driverLocation,
      tripRequests,
      acceptedTrips,
      currentPickupTripId,
      tripStep,
      stats,
      peutDemarrerTP,
      groupeTaxiPartage,
      fileRamassageTP,
      passagersEnAttenteTP,
      passagersRamassesTP,

      setOnline,
      toggleOnline,
      acceptTripRequest,
      rejectTripRequest,
      dismissTripRequest,
      selectPickupTrip,
      signalArrival,
      confirmPassengerPickup,
      startCourse,
      startGlobalTrip,
      startTripImmediately,
      reportDispute,

      calculateDistance,
      maxDistanceKm: MAX_DISTANCE_KM,
      refreshActiveTrips,
      startPlannedTrip,
      fetchFileRamassage
    }),
    [
      isOnline, isConnecting, status, driverLocation, tripRequests, acceptedTrips,
      currentPickupTripId, tripStep, stats, peutDemarrerTP, groupeTaxiPartage,
      fileRamassageTP, passagersEnAttenteTP, passagersRamassesTP, calculateDistance,
      refreshActiveTrips, startPlannedTrip, fetchFileRamassage
    ]
  );

  return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>;
};

export default DriverProvider;

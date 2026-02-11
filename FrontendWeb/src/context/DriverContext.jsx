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

const DriverContext = createContext();
export const useDriverContext = () => useContext(DriverContext);

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
  const [isOnline, setIsOnline] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState("offline"); // offline | available | busy

  const { location: realLocation } = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 2000,
  });

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

  // Trip actif
  const [currentPickupTripId, setCurrentPickupTripId] = useState(null);

  // idle | to_pickup | at_pickup | ready_to_start | in_progress
  const [tripStep, setTripStep] = useState("idle");

  const [stats, setStats] = useState({
    requestsToday: 0,
    acceptedToday: 0,
    rejectedToday: 0,
  });

  // Anti doublon
  const processedRequestIds = useRef(new Set());

  // Utils
  const calculateDistance = useCallback(GeolocationService.calculateDistance, []);

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

  // Paramètres zone
  const MAX_DISTANCE_KM = 5;
  const KEEP_FAR_REQUESTS = true; // ✅ IMPORTANT: ne pas drop

  // ────────────────────────────────────────────────
  // 1) Réception d'une nouvelle demande
  // ────────────────────────────────────────────────
  const handleNewTripRequest = useCallback(
    (tripData) => {
      const reservationId = tripData?.reservationId || tripData?.id;
      if (!reservationId) return;

      // si déjà en course, ignorer
      if (tripStepRef.current === "in_progress") return;

      // anti doublon
      if (processedRequestIds.current.has(reservationId)) return;

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
  // 2) Connexion socket
  // ────────────────────────────────────────────────
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
    socketService.connect(DRIVER.id, "CHAUFFEUR", DRIVER.nom, DRIVER.prenom);

    return () => {
      // Cleanup for connection if isOnline becomes false or DRIVER.id changes
      socketService.disconnect();
    };
  }, [DRIVER.id, isOnline]);

  // ✅ 3) LISTENERS SOCKET (Stables)
  useEffect(() => {
    if (!isOnline) return;

    socketService.on("course:demande", handleNewTripRequest);

    const onAcceptedOk = ({ reservationId } = {}) => {
      if (!reservationId) return;
      setStats((prev) => ({ ...prev, acceptedToday: prev.acceptedToday + 1 }));
      const req = tripRequestsRef.current.find((r) => String(r.id) === String(reservationId));

      if (req) {
        setAcceptedTrips((prev) => {
          if (prev.some((t) => String(t.id) === String(reservationId))) return prev;
          return [{ ...req, pickupStatus: "pending" }, ...prev];
        });
      } else {
        console.warn("⚠️ [DRIVER] Accept OK mais requête introuvable:", reservationId);
      }
      setTripRequests((prev) => prev.filter((r) => String(r.id) !== String(reservationId)));
    };

    const onAlreadyTaken = ({ message, reservationId } = {}) => {
      console.warn("⚠️ [DRIVER] course déjà prise:", message);
      if (reservationId) {
        const rid = String(reservationId);
        setTripRequests((prev) => prev.filter((r) => String(r.id) !== rid));
        processedRequestIds.current.delete(rid);
        // On s'assure de fermer d'éventuels toasts liés à cette requête si on en avait ajouté
        toast.dismiss(`req-${rid}`);
      }
    };

    const onRefusedOk = ({ reservationId } = {}) => {
      if (!reservationId) return;
      setStats((prev) => ({ ...prev, rejectedToday: prev.rejectedToday + 1 }));
      setTripRequests((prev) => prev.filter((r) => String(r.id) !== String(reservationId)));
      processedRequestIds.current.delete(String(reservationId));
    };

    socketService.on("reservation:join:ok", ({ reservationId }) => {
      console.log(`✅ [DRIVER] Room join success for RID=${reservationId}`);
    });

    socketService.on("reservation:join:refused", ({ reservationId, message }) => {
      console.warn(`❌ [DRIVER] Room join refused for RID=${reservationId}: ${message}`);
    });

    const onTripCancelled = ({ reservationId, message } = {}) => {
      console.log("📩 [DRIVER] trip_cancelled/course:annulee reçu", { reservationId, message });
      if (!reservationId) return;
      const rid = String(reservationId);

      // Récupérer les infos du trajet AVANT de le supprimer des listes
      let cancelledTrip = null;

      setTripRequests((prev) => {
        const found = prev.find(r => String(r.id) === rid);
        if (found) cancelledTrip = found;
        return prev.filter((r) => String(r.id) !== rid);
      });

      setAcceptedTrips((prev) => {
        const found = prev.find(t => String(t.id) === rid);
        if (found) cancelledTrip = found;
        return prev.filter((t) => String(t.id) !== rid);
      });

      processedRequestIds.current.delete(rid);
      processedRequestIds.current.delete(Number(rid)); // Sécurité

      // Notification visuelle très explicite avec entête
      const passengerInfo = cancelledTrip?.passengerName ? `de ${cancelledTrip.passengerName}` : "";

      toast.error(
        <div className="flex flex-col gap-1">
          <span className="text-lg font-extrabold uppercase tracking-tight">🚫 Course Annulée</span>
          <span className="text-sm font-medium opacity-90">
            {message || `La course ${passengerInfo} a été annulée par le passager`}
          </span>
        </div>,
        {
          id: `cancel-${rid}`,
          duration: 10000,
          style: {
            backgroundColor: '#ef4444',
            padding: '16px',
            color: '#ffffff',
            borderRadius: '12px',
            minWidth: '300px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }
        }
      );

      if (String(currentPickupTripIdRef.current) === rid) {
        console.log("⚠️ [DRIVER] La course active actuelle a été annulée !");
        setCurrentPickupTripId(null);
        setTripStep("idle");
        setStatus("available");
      }
    };

    socketService.on("course:acceptee_confirmation", onAcceptedOk);
    socketService.on("course:deja_prise", onAlreadyTaken);
    socketService.on("course:refusee_confirmation", onRefusedOk);
    socketService.on("course:annulee", onTripCancelled);
    socketService.on("trip_cancelled", onTripCancelled);

    setIsConnecting(false);

    return () => {
      socketService.off("course:demande", handleNewTripRequest);
      socketService.off("course:acceptee_confirmation", onAcceptedOk);
      socketService.off("course:deja_prise", onAlreadyTaken);
      socketService.off("course:refusee_confirmation", onRefusedOk);
      socketService.off("course:annulee", onTripCancelled);
      socketService.off("trip_cancelled", onTripCancelled);
      socketService.off("reservation:join:ok");
      socketService.off("reservation:join:refused");
    };
  }, [isOnline, handleNewTripRequest]);

  // ✅ 4) ROOM RE-JOINING (Séparé)
  useEffect(() => {
    if (!isOnline || acceptedTrips.length === 0) return;

    console.log(`🔄 [DRIVER] Re-joining rooms for ${acceptedTrips.length} active trips...`);
    acceptedTrips.forEach(trip => {
      socketService.emit("reservation:join", { reservationId: trip.id || trip.reservationId });
    });
  }, [isOnline, acceptedTrips.length]);

  // ────────────────────────────────────────────────
  // 5) GPS en continu (uniquement si course active)
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOnline || !driverLocation || !currentPickupTripId) return;

    const interval = setInterval(() => {
      socketService.emit("position:update", {
        reservationId: currentPickupTripId,
        lat: driverLocation.lat,
        lng: driverLocation.lng,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isOnline, driverLocation, currentPickupTripId]);

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

  const selectPickupTrip = (reservationId) => {
    setCurrentPickupTripId(reservationId);
    setAcceptedTrips((prev) =>
      prev.map((t) => (t.id === reservationId ? { ...t, pickupStatus: "approaching" } : t))
    );
    socketService.emit("course:rejoindre", { reservationId });
    setTripStep("to_pickup");
    setStatus("busy");
  };

  const signalArrival = () => {
    if (!currentPickupTripId) return;
    socketService.emit("course:signaler_arrivee", { reservationId: currentPickupTripId });
    setAcceptedTrips((prev) =>
      prev.map((t) => (t.id === currentPickupTripId ? { ...t, pickupStatus: "arrived" } : t))
    );
    setTripStep("at_pickup");
  };

  const confirmPassengerPickup = (reservationId) => {
    setAcceptedTrips((prev) =>
      prev.map((t) => (t.id === reservationId ? { ...t, pickupStatus: "picked_up" } : t))
    );
    setTripStep("ready_to_start");
  };

  const pickupAndStart = (reservationId) => {
    // 1. Mettre à jour l'état local immédiatement
    setAcceptedTrips((prev) =>
      prev.map((t) => (t.id === reservationId ? { ...t, pickupStatus: "picked_up" } : t))
    );

    // 2. Calculer les IDs à envoyer (inclure celui qu'on vient de valider)
    const alreadyPickedUp = acceptedTripsRef.current
      .filter((t) => t.pickupStatus === "picked_up" && t.id !== reservationId)
      .map((t) => t.id);

    const pickedUpIds = [reservationId, ...alreadyPickedUp];

    // 3. Émettre l'événement
    socketService.emit("course:demarrer_global", { reservationIds: pickedUpIds });

    // 4. Mettre à jour le step
    setTripStep("in_progress");
    setStatus("busy");
  };

  const startGlobalTrip = () => {
    // Émet un signal global pour tous les passagers "picked_up"
    const pickedUpIds = acceptedTrips
      .filter((t) => t.pickupStatus === "picked_up")
      .map((t) => t.id);

    if (pickedUpIds.length === 0) return;

    socketService.emit("course:demarrer_global", { reservationIds: pickedUpIds });
    setTripStep("in_progress");
    setStatus("busy");
  };

  const finishTrip = (reservationId) => {
    if (!reservationId) return;
    socketService.emit("course:terminer", { reservationId });
    setAcceptedTrips((prev) => prev.filter((t) => t.id !== reservationId));

    // Si c'était la course active, on nettoie
    if (reservationId === currentPickupTripId) {
      setCurrentPickupTripId(null);
      setTripStep(null);
      setStatus("online");
    }
  };

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

      setOnline,
      toggleOnline,
      acceptTripRequest,
      rejectTripRequest,
      selectPickupTrip,
      signalArrival,
      confirmPassengerPickup,
      pickupAndStart,
      startCourse,
      startGlobalTrip,
      finishTrip,
      reportDispute,

      calculateDistance,
      maxDistanceKm: MAX_DISTANCE_KM,
    }),
    [
      isOnline,
      isConnecting,
      status,
      driverLocation,
      tripRequests,
      acceptedTrips,
      currentPickupTripId,
      tripStep,
      stats,
      calculateDistance,
    ]
  );

  return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>;
};

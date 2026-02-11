// src/context/PassengerContext.jsx
import React, { createContext, useState, useContext, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import socketService from "../services/socketService";
import { API_ROUTES } from "../services/apiRoutes";

const PassengerContext = createContext();
export const usePassenger = () => useContext(PassengerContext);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const PassengerProvider = ({ children }) => {
  const [passenger, setPassenger] = useState(() => {
    try {
      const raw = localStorage.getItem('user') || localStorage.getItem('authUser');
      const parsed = raw ? JSON.parse(raw) : null;
      // Normalisation: s'assurer que l'ID est présent
      if (parsed && !parsed._id && parsed.id) parsed._id = parsed.id;
      return parsed;
    } catch {
      return null;
    }
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(!passenger); // Ne pas bloquer si on a déjà un cache

  const [currentPage, setCurrentPage] = useState("home");

  // Course courante
  const [currentTrip, setCurrentTrip] = useState(null);
  const [tripStatus, setTripStatus] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Geo
  const [userLocation, setUserLocation] = useState({ lat: 10.3676, lng: -12.5883 });
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Historique
  const [trips, setTrips] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // éviter stale closure currentTrip dans listeners
  const currentTripRef = useRef(null);
  useEffect(() => {
    currentTripRef.current = currentTrip;
  }, [currentTrip]);

  // ===================== FETCH PROFILE REAL =====================
  const fetchProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const { data } = await axios.get(`${API_URL}/api${API_ROUTES.passager.profil.get}`, {
        withCredentials: true
      });
      if (data?.succes && data?.profil) {
        console.log("👤 [CONTEXT] Profil récupéré:", data.profil);
        setPassenger(data.profil);
      }
    } catch (err) {
      console.error("❌ [CONTEXT] Erreur fetch profile:", err.message);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ===================== GEOLOCATION =====================
  useEffect(() => {
    requestLocationPermission();
    // eslint-disable-next-line
  }, []);

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      setHasLocationPermission(false);
      setIsLoadingLocation(false);
      toast.error("Géolocalisation non supportée par votre navigateur");
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        setHasLocationPermission(true);
        setIsLoadingLocation(false);
        toast.success("Position détectée avec succès", { id: "location-success" });
      },
      (error) => {
        setHasLocationPermission(false);
        setIsLoadingLocation(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Activez la géolocalisation dans votre navigateur", { id: "location-error" });
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Position indisponible. Vérifiez votre GPS", { id: "location-error" });
            break;
          case error.TIMEOUT:
            toast.error("Délai dépassé pour obtenir la position", { id: "location-error" });
            break;
          default:
            toast.error("Impossible d'obtenir votre position", { id: "location-error" });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const retryLocation = () => requestLocationPermission();

  // ===================== SOCKET CONNECT PASSAGER (UNE SEULE FOIS) =====================
  useEffect(() => {
    const pid = passenger?._id || passenger?.id;
    if (!pid) return;

    console.log(`🔌 [CONTEXT] Connexion socket passager ID=${pid}`);
    socketService.connect(pid, "PASSAGER", passenger.nom, passenger.prenom);

    // ✅ helper compare ID robuste
    const sameRid = (a, b) => {
      if (!a || !b) return false;
      return String(a) === String(b);
    };

    const onAccepted = (payload) => {
      console.log("📩 [CONTEXT] course:acceptee reçu", payload);
      const reservationId = payload?.reservationId || payload?._id || payload?.reservation?._id;
      const chauffeur = payload?.chauffeur || payload?.driver;

      if (!reservationId) return;

      const trip = currentTripRef.current;

      // ✅ si on a déjà une course, on filtre proprement avec String()
      if (trip?.reservationId && !sameRid(trip.reservationId, reservationId)) {
        console.warn("📩 [CONTEXT] Ignoré (ID mismatch)", { reservationId, current: trip.reservationId });
        return;
      }

      // ✅ STOP UI SEARCHING (重要)
      toast.dismiss("searching");

      // ✅ Update driver
      setSelectedDriver({
        id: chauffeur?.id || chauffeur?._id,
        nom: chauffeur?.nom,
        prenom: chauffeur?.prenom,
        name: `${chauffeur?.prenom || ""} ${chauffeur?.nom || ""}`.trim(),
        vehicle: chauffeur?.vehicle || chauffeur?.vehicule || { plate: "N/A", model: "N/A" },
        phone: chauffeur?.telephone || chauffeur?.phone || chauffeur?.contact,
        eta: "Arrivée imminente",
        distance: "Proche"
      });

      // ✅ Update status (stop spinner)
      setTripStatus("driver_found");

      // ✅ Update currentTrip.status (cohérent)
      setCurrentTrip((prev) => {
        const base = prev || {};
        return {
          ...base,
          reservationId: base.reservationId || reservationId,
          status: "driver_found",
          driver: chauffeur || null,
        };
      });

      // ✅ Rejoindre la room RESERVATION pour position:chauffeur
      socketService.emit("reservation:join", { reservationId });

      toast.success("✅ Chauffeur trouvé !", { id: "driver-found" });
    };

    const onEnRoute = ({ reservationId } = {}) => {
      const trip = currentTripRef.current;
      if (trip?.reservationId && String(trip.reservationId) !== String(reservationId)) return;
      toast.success("🚗 Le chauffeur est en route", { id: "driver-en-route" });
    };

    const onArrived = ({ reservationId } = {}) => {
      const trip = currentTripRef.current;
      if (trip?.reservationId && String(trip.reservationId) !== String(reservationId)) return;
      setTripStatus("arrived");
      setCurrentTrip((prev) => (prev ? { ...prev, status: "arrived" } : prev));
      toast.success("📍 Votre chauffeur est arrivé", { id: "driver-arrived" });
    };

    const onStarted = ({ reservationId } = {}) => {
      const trip = currentTripRef.current;
      if (trip?.reservationId && String(trip.reservationId) !== String(reservationId)) return;
      setTripStatus("en_route");
      setCurrentTrip((prev) => (prev ? { ...prev, status: "en_route" } : prev));
      toast.success("🚀 Trajet démarré", { id: "trip-started" });
    };

    const onGlobalStarted = ({ reservationId, message } = {}) => {
      const trip = currentTripRef.current;
      if (trip?.reservationId && String(trip.reservationId) !== String(reservationId)) return;
      setTripStatus("en_route");
      setCurrentTrip((prev) => (prev ? { ...prev, status: "en_route" } : prev));
      toast.success(message || "🚀 Le trajet commence !", { id: "trip-started-global" });
    };

    const onPosition = (data) => {
      const { lat, lng } = data;
      if (lat != null && lng != null) {
        setSelectedDriver((prev) => (prev ? { ...prev, location: [lat, lng] } : prev));
      }
    };

    socketService.on("course:acceptee", onAccepted);
    socketService.on("course:chauffeur_en_route", onEnRoute);
    socketService.on("course:chauffeur_arrive", onArrived);
    socketService.on("course:demarre", onStarted);
    socketService.on("course:demarre_global", onGlobalStarted);
    socketService.on("position:chauffeur", onPosition);

    return () => {
      socketService.off("course:acceptee", onAccepted);
      socketService.off("course:chauffeur_en_route", onEnRoute);
      socketService.off("course:chauffeur_arrive", onArrived);
      socketService.off("course:demarre", onStarted);
      socketService.off("course:demarre_global", onGlobalStarted);
      socketService.off("position:chauffeur", onPosition);
    };
  }, [passenger?._id, passenger?.id]);

  // ===================== 1) DEFINE TRIP =====================
  const defineTrip = (tripData) => {
    setCurrentTrip({
      ...tripData,
      status: "confirming",
      createdAt: new Date().toISOString(),
    });
    setTripStatus("confirming");
  };

  // ===================== 2) CONFIRM TRIP (API) =====================
  const confirmTrip = async (confirmedData) => {
    if (!confirmedData?.immediate) {
      setTripStatus("scheduled");
      toast.success("✅ Trajet planifié (à brancher côté API)");
      return;
    }

    try {
      toast.loading("🔍 Recherche d'un chauffeur...", { id: "searching" });
      setTripStatus("searching");

      const payload = {
        depart: confirmedData.pickup,
        destination: confirmedData.destination,
        departLat: confirmedData.pickupLat ?? userLocation.lat,
        departLng: confirmedData.pickupLng ?? userLocation.lng,
        destinationLat: confirmedData.destinationLat,
        destinationLng: confirmedData.destinationLng,
        distanceKm: confirmedData.distanceKm,
        dureeMin: confirmedData.dureeMin,
        typeVehicule: confirmedData.vehicleType,
        prix: confirmedData.price,
        momentPaiement: confirmedData.paymentTime === "end" ? "FIN" : "MAINTENANT",
      };

      const { data } = await axios.post(
        `${API_URL}/api/reservations-immediate/confirmer-immediate`,
        payload,
        { withCredentials: true }
      );

      if (!data?.succes) {
        toast.dismiss("searching");
        setTripStatus(null);
        toast.error(data?.message || "Erreur lors de la réservation");
        return;
      }

      const reservation = data.reservation;
      const reservationId = reservation?._id;

      setCurrentTrip({
        reservationId,
        pickup: confirmedData.pickup,
        destination: confirmedData.destination,
        estimatedPrice: confirmedData.price,
        vehicleType: confirmedData.vehicleType,
        paymentTime: confirmedData.paymentTime,
        paymentMethod: confirmedData.paymentMethod,
        status: "searching",
        createdAt: new Date().toISOString(),
      });

      // ✅ join reservation room très tôt (prêt pour position / events)
      if (reservationId) socketService.emit("reservation:join", { reservationId });

      if ((data.chauffeursContactes || 0) === 0) {
        toast.dismiss("searching");
        toast.error("❌ Aucun chauffeur en ligne pour le moment");
        setTripStatus(null);
        setCurrentTrip(null);
        return;
      }

      toast.success(`📡 Demande envoyée à ${data.chauffeursContactes} chauffeurs`, { id: "request-sent" });
    } catch (err) {
      toast.dismiss("searching");
      setTripStatus(null);
      setCurrentTrip(null);
      toast.error(err?.response?.data?.message || err.message || "Erreur serveur");
    }
  };

  // ... rest of the original file logic if any
  const cancelTripByPassenger = async ({ reason } = {}) => {
    if (!currentTrip?.reservationId) return;

    try {
      setTripStatus("cancelled");
      toast.success("❌ Trajet annulé");
      toast.dismiss("searching");

      setCurrentTrip(null);
      setSelectedDriver(null);
      setTripStatus(null);
    } catch (e) {
      toast.error("Erreur annulation");
    }
  };

  const completeTrip = () => {
    setTripStatus("completed");
    toast.success("✅ Trajet terminé !");

    if (currentTrip) {
      setTrips((prev) => [
        {
          ...currentTrip,
          status: "completed",
          completedAt: new Date().toISOString(),
          driver: selectedDriver,
        },
        ...prev,
      ]);
    }

    setTimeout(() => {
      setCurrentTrip(null);
      setSelectedDriver(null);
      setTripStatus(null);
    }, 2500);
  };

  const updatePassenger = async (newData) => {
    try {
      const { data } = await axios.put(`${API_URL}/api${API_ROUTES.passager.profil.update}`, newData, {
        withCredentials: true
      });
      if (data?.succes) {
        setPassenger(data.profil || newData);
        toast.success("Profil mis à jour !");
        return true;
      }
    } catch (err) {
      console.error("❌ [CONTEXT] Erreur update profile:", err.message);
      toast.error("Échec de la mise à jour du profil");
    }
    return false;
  };

  const value = useMemo(
    () => ({
      passenger,
      setPassenger,
      updatePassenger,
      isLoadingProfile,
      currentPage,
      setCurrentPage,
      trips,
      transactions,
      currentTrip,
      setCurrentTrip,
      tripStatus,
      setTripStatus,
      selectedDriver,
      setSelectedDriver,
      userLocation,
      hasLocationPermission,
      isLoadingLocation,
      retryLocation,
      defineTrip,
      confirmTrip,
      cancelTripByPassenger,
      completeTrip,
    }),
    [
      passenger,
      isLoadingProfile,
      currentPage,
      trips,
      transactions,
      currentTrip,
      setCurrentTrip,
      tripStatus,
      setTripStatus,
      selectedDriver,
      setSelectedDriver,
      userLocation,
      hasLocationPermission,
      isLoadingLocation,
    ]
  );

  return <PassengerContext.Provider value={value}>{children}</PassengerContext.Provider>;
};

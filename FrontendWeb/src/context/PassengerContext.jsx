// src/context/PassengerContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import socketService from "../services/socketService";
import { API_ROUTES } from "../services/apiRoutes";
import { offlineTripService } from "../services/offlineTripService";
import { useAuth } from './AuthContext';
import { useNotificationCenter, NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from "./NotificationContext";
import { getApiBaseURL } from "../utils/urlHelper";

const PassengerContext = createContext();
export const usePassenger = () => useContext(PassengerContext);

export const PassengerProvider = ({ children }) => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const [passenger, setPassenger] = useState(user || null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const { addNotification } = useNotificationCenter();


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
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      const baseURL = getApiBaseURL();
      const { data } = await axios.get(`${baseURL}${API_ROUTES.passager.profil.get}`, {
        withCredentials: true
      });
      if (data?.succes && data?.profil) {
        console.log("👤 [CONTEXT] Profil récupéré:", data.profil);
        setPassenger(data.profil);
        if (updateAuthUser) {
          updateAuthUser(data.profil);
        }
      }
    } catch (err) {
      console.error("❌ [CONTEXT] Erreur fetch profile:", err.message);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [updateAuthUser]);

  useEffect(() => {
    // 🔄 [OFFLINE] Restauration locale immédiate (Même sans attendre l'Auth complet)
    const localState = offlineTripService.loadState('PASSAGER');
    if (localState && localState.currentTrip) {
      console.log("💾 [CONTEXT] Restauration depuis stockage local");
      setCurrentTrip(localState.currentTrip);
      setTripStatus(localState.tripStatus);
      setSelectedDriver(localState.selectedDriver);

      if (localState.currentTrip.reservationId) {
        socketService.emit("reservation:join", { reservationId: localState.currentTrip.reservationId });
      }
    }

    if (user) {
      setPassenger(user);
      if (!user._id && !user.id) {
        fetchProfile();
      }
      // 🌍 Synchronisation avec le serveur
      fetchActiveTrip();
    } else {
      setPassenger(null);
      offlineTripService.clearState('PASSAGER');
    }
  }, [user, fetchProfile]);

  // 💾 [OFFLINE] Sauvegarde automatique à chaque changement
  useEffect(() => {
    if (currentTrip) {
      offlineTripService.saveState('PASSAGER', {
        currentTrip,
        tripStatus,
        selectedDriver
      });
    } else if (tripStatus === 'idle' || !tripStatus) {
      offlineTripService.clearState('PASSAGER');
    }
  }, [currentTrip, tripStatus, selectedDriver]);

  // ✅ New function to restore state
  const fetchActiveTrip = async () => {
    try {
      // Endpoint hypothetique - à adapter selon API réelle.
      // Si n'existe pas, il faudra le créer ou utiliser une liste filtrée
      const { data } = await axios.get(`${API_URL}/api/reservations/active`, { withCredentials: true });

      if (data?.success && data?.reservation) {
        const r = data.reservation;
        console.log("🔄 [CONTEXT] Restoring active trip:", r._id);

        setCurrentTrip({
          reservationId: r._id,
          id: r._id, // ✅ FIX: Doublon pour compatibilité TrajetEnTempReel
          pickup: r.depart || r.pickupAddress,
          destination: r.destination || r.destinationAddress,
          pickupCoords: [r.departLat, r.departLng],
          destinationCoords: [r.destinationLat, r.destinationLng],
          status: r.statut?.toLowerCase(),
          driver: r.chauffeur,
          price: r.prix,
          vehicleType: r.typeVehicule,
          paymentMethod: r.paiement?.methode || "CASH",
          payment: r.paiement, // ✅ FIX: Ajouter l'objet complet pour le statut
          momentPaiement: r.momentPaiement, // ✅ FIX: Pour détecter le paiement à l'avance
          createdAt: r.createdAt
        });

        setTripStatus(r.statut?.toLowerCase());

        if (r.chauffeur) {
          setSelectedDriver({
            id: r.chauffeur._id || r.chauffeur.id,
            nom: r.chauffeur.nom,
            prenom: r.chauffeur.prenom,
            name: `${r.chauffeur.prenom} ${r.chauffeur.nom}`,
            phone: r.chauffeur.telephone,
            vehicle: r.chauffeur.vehicule || r.chauffeur.vehicle ? {
              brand: (r.chauffeur.vehicule || r.chauffeur.vehicle).marque || "N/A",
              model: (r.chauffeur.vehicule || r.chauffeur.vehicle).modele || "N/A",
              plate: (r.chauffeur.vehicule || r.chauffeur.vehicle).immatriculation || "N/A",
              color: (r.chauffeur.vehicule || r.chauffeur.vehicle).couleur || "N/A",
              type: (r.chauffeur.vehicule || r.chauffeur.vehicle).type || "taxi"
            } : { brand: "N/A", model: "N/A", plate: "N/A" },
            rating: r.chauffeur.noteMoyenne || 4.8,
            totalTrips: r.chauffeur.nombreTrajets || 0
          });
        }

        // ✅ IMPORTANT: Re-rejoindre la room socket pour recevoir les updates position
        console.log(`🔌 [CONTEXT] Re-joining room: RESERVATION_${r._id}`);
        socketService.emit("reservation:join", { reservationId: r._id });
      }
    } catch (err) {
      console.warn("⚠️ [CONTEXT] No active trip found or error:", err.message);
    }
  };

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

  const notifiedEvents = useRef(new Set());

  // ===================== SOCKET CONNECT PASSAGER (UNE SEULE FOIS) =====================
  useEffect(() => {
    const pid = passenger?._id || passenger?.id;
    if (!pid) return;

    console.log(`🔌 [CONTEXT] Connexion socket passager ID=${pid}`);
    socketService.connect(pid, "PASSAGER", passenger.nom, passenger.prenom);

    // Reset notifications set on new connection or trip change if needed
    // But better to just use it to track uniqueness of events per trip

    // ✅ helper compare ID robuste
    const sameRid = (a, b) => {
      if (!a || !b) return false;
      return String(a) === String(b);
    };

    const onAccepted = (payload) => {
      console.log("📩 [CONTEXT] course:acceptee reçu", payload);
      const reservationId = payload?.reservationId || payload?._id || payload?.reservation?._id;

      const eventKey = `accepted-${reservationId}`;
      if (notifiedEvents.current.has(eventKey)) return;

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
        vehicle: (chauffeur?.vehicule || chauffeur?.vehicle) ? {
          brand: (chauffeur.vehicule || chauffeur.vehicle).marque || (chauffeur.vehicule || chauffeur.vehicle).brand || "N/A",
          model: (chauffeur.vehicule || chauffeur.vehicle).modele || (chauffeur.vehicule || chauffeur.vehicle).model || "N/A",
          plate: (chauffeur.vehicule || chauffeur.vehicle).immatriculation || (chauffeur.vehicule || chauffeur.vehicle).plate || "N/A",
          color: (chauffeur.vehicule || chauffeur.vehicle).couleur || (chauffeur.vehicule || chauffeur.vehicle).color || "N/A",
          type: (chauffeur.vehicule || chauffeur.vehicle).type || "taxi"
        } : (chauffeur?.vehicle || chauffeur?.vehicule || { brand: "N/A", model: "N/A", plate: "N/A" }),
        phone: chauffeur?.telephone || chauffeur?.phone || chauffeur?.contact || "N/A",
        email: chauffeur?.email,
        photo: chauffeur?.photo || chauffeur?.photoUrl,
        rating: chauffeur?.rating || chauffeur?.noteMoyenne || "5.0",
        tripsCount: chauffeur?.tripsCount || chauffeur?.nombreTrajets || "0",
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
          id: base.id || reservationId, // ✅ FIX: Doublon
          status: "driver_found",
          driver: chauffeur || null,
        };
      });

      // ✅ Rejoindre la room RESERVATION pour position:chauffeur
      console.log(`🔌 [CONTEXT] Joining reservation room: RESERVATION_${reservationId}`);
      if (reservationId) {
        socketService.emit("reservation:join", { reservationId });
      }

      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        category: NOTIFICATION_CATEGORIES.TRIP,
        title: 'Chauffeur trouvé ! ✅',
        message: `${chauffeur?.prenom || ""} ${chauffeur?.nom || ""} a accepté votre course.`,
        id: `accepted-${reservationId}`
      });
      notifiedEvents.current.add(eventKey);

    };

    const onEnRoute = (payload = {}) => {
      const { reservationId, message } = payload;
      // ✅ Accepter si c'est la course courante OU si on n'a pas encore de course chargée (au cas où)
      const trip = currentTripRef.current;
      if (trip?.reservationId && !sameRid(trip.reservationId, reservationId)) return;

      console.log(`📩 [CONTEXT] course:chauffeur_en_route reçu for RID=${reservationId}`);

      const eventKey = `approaching-${reservationId}`;
      if (notifiedEvents.current.has(eventKey)) return;

      const chauffeur = payload?.chauffeur || payload?.driver;
      if (chauffeur) {
        setSelectedDriver({
          id: chauffeur?.id || chauffeur?._id,
          nom: chauffeur?.nom,
          prenom: chauffeur?.prenom,
          name: `${chauffeur?.prenom || ""} ${chauffeur?.nom || ""}`.trim(),
          vehicle: (chauffeur?.vehicule || chauffeur?.vehicle) ? {
            brand: (chauffeur.vehicule || chauffeur.vehicle).marque || (chauffeur.vehicule || chauffeur.vehicle).brand || "N/A",
            model: (chauffeur.vehicule || chauffeur.vehicle).modele || (chauffeur.vehicule || chauffeur.vehicle).model || "N/A",
            plate: (chauffeur.vehicule || chauffeur.vehicle).immatriculation || (chauffeur.vehicule || chauffeur.vehicle).plate || "N/A",
            color: (chauffeur.vehicule || chauffeur.vehicle).couleur || (chauffeur.vehicule || chauffeur.vehicle).color || "N/A",
            type: (chauffeur.vehicule || chauffeur.vehicle).type || "taxi"
          } : { brand: "N/A", model: "N/A", plate: "N/A" },
          phone: chauffeur?.telephone || chauffeur?.phone || "N/A",
          photo: chauffeur?.photo || chauffeur?.photoUrl,
          rating: chauffeur?.rating || chauffeur?.noteMoyenne || "5.0",
        });
      }

      setTripStatus("approaching");
      setCurrentTrip((prev) => (prev ? { ...prev, status: "approaching", driver: chauffeur || prev.driver } : prev));

      // ✅ Notification immédiate demandée par l'utilisateur
      toast.success(message || "🚗 Votre chauffeur est en route !", { id: "driver-en-route" });

      addNotification({
        type: NOTIFICATION_TYPES.INFO,
        category: NOTIFICATION_CATEGORIES.TRIP,
        title: 'Chauffeur en route 🚗',
        message: message || "Votre chauffeur est en route pour vous récupérer.",
        id: `approaching-${reservationId}`
      });
      notifiedEvents.current.add(eventKey);

    };

    const onArrived = (payload = {}) => {
      const { reservationId } = payload;
      console.log(`🔔 [SOCKET] course:chauffeur_arrive REÇU pour RID=${reservationId}`);
      const trip = currentTripRef.current;

      const eventKey = `arrived-${reservationId}`;
      if (notifiedEvents.current.has(eventKey)) return;

      // Sécurité : si on n'a aucune course, on ignore (ou on pourrait fetcher)
      if (!trip?.reservationId) {
        console.warn("⚠️ [SOCKET] Arrivée signalée mais pas de course active locale.");
        return;
      }

      // Check souple (String comparison)
      if (!sameRid(trip.reservationId, reservationId)) {
        console.warn(`⚠️ [SOCKET] ID Mismatch arrivée : Reçu ${reservationId} vs Actuel ${trip.reservationId}`);
        return;
      }

      const chauffeur = payload?.chauffeur || payload?.driver;
      if (chauffeur) {
        setSelectedDriver({
          id: chauffeur?.id || chauffeur?._id,
          nom: chauffeur?.nom,
          prenom: chauffeur?.prenom,
          name: `${chauffeur?.prenom || ""} ${chauffeur?.nom || ""}`.trim(),
          vehicle: (chauffeur?.vehicule || chauffeur?.vehicle) ? {
            brand: (chauffeur.vehicule || chauffeur.vehicle).marque || (chauffeur.vehicule || chauffeur.vehicle).brand || "N/A",
            model: (chauffeur.vehicule || chauffeur.vehicle).modele || (chauffeur.vehicule || chauffeur.vehicle).model || "N/A",
            plate: (chauffeur.vehicule || chauffeur.vehicle).immatriculation || (chauffeur.vehicule || chauffeur.vehicle).plate || "N/A",
            color: (chauffeur.vehicule || chauffeur.vehicle).couleur || (chauffeur.vehicule || chauffeur.vehicle).color || "N/A",
            type: (chauffeur.vehicule || chauffeur.vehicle).type || "taxi"
          } : { brand: "N/A", model: "N/A", plate: "N/A" },
          phone: chauffeur?.telephone || chauffeur?.phone || "N/A",
          photo: chauffeur?.photo || chauffeur?.photoUrl,
          rating: chauffeur?.rating || chauffeur?.noteMoyenne || "5.0",
        });
      }

      // ✅ Mise à jour critique
      setTripStatus("arrived");
      setCurrentTrip((prev) => {
        if (!prev) return null;
        return { ...prev, status: "arrived", driver: chauffeur || prev.driver };
      });

      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        category: NOTIFICATION_CATEGORIES.TRIP,
        title: 'Chauffeur arrivé ! ✅',
        message: 'Votre chauffeur est arrivé au point de ramassage.',
        id: `arrived-${reservationId}`
      });
      notifiedEvents.current.add(eventKey);


      // Petit hack : vibrer si sur mobile
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    };

    const onStarted = ({ reservationId } = {}) => {
      const trip = currentTripRef.current;
      if (trip?.reservationId && !sameRid(trip.reservationId, reservationId)) return;

      console.log(`📩 [CONTEXT] course:demarre reçu for RID=${reservationId}`);

      const eventKey = `started-${reservationId}`;
      if (notifiedEvents.current.has(eventKey)) return;

      setTripStatus("en_route");
      setCurrentTrip((prev) => (prev ? { ...prev, status: "en_route" } : prev));

      addNotification({
        type: NOTIFICATION_TYPES.INFO,
        category: NOTIFICATION_CATEGORIES.TRIP,
        title: 'Trajet démarré 🚀',
        message: 'Votre course a commencé. Bon voyage !',
        id: `started-${reservationId}`
      });
      notifiedEvents.current.add(eventKey);

    };

    const onGlobalStarted = ({ reservationId, message } = {}) => {
      const trip = currentTripRef.current;
      if (trip?.reservationId && !sameRid(trip.reservationId, reservationId)) return;

      console.log(`📩 [CONTEXT] course:demarre_global reçu for RID=${reservationId}`);
      setTripStatus("en_route");
      setCurrentTrip((prev) => (prev ? { ...prev, status: "en_route" } : prev));
      toast.success(message || "🚀 Le trajet commence !", { id: "trip-status" });
    };

    const onPosition = (data) => {
      // console.log("📍 Position reçue (RAW):", data); 
      const { lat, lng, reservationId } = data;

      // Optional: Check reservation ID if critical
      // const trip = currentTripRef.current;
      // if (trip?.reservationId && reservationId && !sameRid(trip.reservationId, reservationId)) return;

      if (lat != null && lng != null) {
        // console.log("📍 Position updated in context");
        setSelectedDriver((prev) => (prev ? { ...prev, location: [lat, lng] } : prev));
      }
    };

    // ✅ Fix 3 : écouter la fin de course côté backend
    const onCompleted = ({ reservationId } = {}) => {
      const trip = currentTripRef.current;
      if (trip?.reservationId && !sameRid(trip.reservationId, reservationId)) return;

      console.log(`📩 [CONTEXT] course:terminee reçu for RID=${reservationId}`);
      setTripStatus("completed");

      const eventKey = `completed-${reservationId}`;
      if (notifiedEvents.current.has(eventKey)) return;

      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        category: NOTIFICATION_CATEGORIES.TRIP,
        title: 'Trajet terminé 🏁',
        message: 'Vous êtes arrivé à destination. Merci d\'avoir choisi TakaTaka !',
        id: 'trip-completion'
      });

      // Note: On ne met PAS currentTrip à null ici, car l'écran de résumé/note en a besoin.
      // Le nettoyage se fera à la fin du processus d'évaluation.
      notifiedEvents.current.add(eventKey);
    };

    // ✅ Fix 4 : écouter l'annulation côté backend
    const onCancelled = ({ reservationId, message } = {}) => {
      const trip = currentTripRef.current;
      if (trip?.reservationId && !sameRid(trip.reservationId, reservationId)) return;

      console.log(`📩 [CONTEXT] course:annulee reçu for RID=${reservationId}`);
      toast.dismiss("searching");
      setTripStatus("cancelled");
      setCurrentTrip(null);
      setSelectedDriver(null);

      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        category: NOTIFICATION_CATEGORIES.TRIP,
        title: 'Course annulée ❌',
        message: message || "Votre course a été annulée.",
      });

      setTimeout(() => setTripStatus(null), 2500);
    };

    // ✅ Nouveauté : Mise à jour du statut d'un litige
    const onDisputeUpdate = (data) => {
      console.log(`📩 [CONTEXT] litige:status_update reçu for ID=${data.litigeId}`);
      addNotification({
        title: 'Litige mis à jour ⚖️',
        message: data.message || `Le statut de votre litige #${data.reference} a été mis à jour : ${data.statut}.`,
        type: data.statut === 'RESOLU' ? NOTIFICATION_TYPES.SUCCESS : (data.statut === 'REJETER' ? NOTIFICATION_TYPES.ERROR : NOTIFICATION_TYPES.WARNING),
        category: NOTIFICATION_CATEGORIES.MODERATION,
        priority: 'high'
      });
    };

    // ✅ Nouveauté : Réservation planifiée non acceptée après 15 min
    const onPlannedNotAccepted = ({ reservationId, message } = {}) => {
      console.log(`📩 [CONTEXT] reservation:planifiee_non_acceptee reçu for RID=${reservationId}`);
      toast.error(message || "⚠️ Aucun chauffeur n'a encore accepté votre réservation planifiée.", {
        id: `planned-not-accepted-${reservationId}`,
        duration: 10000,
        icon: '⏳'
      });
    };

    socketService.on("course:acceptee", onAccepted);
    socketService.on("course:chauffeur_en_route", onEnRoute);
    socketService.on("course:chauffeur_arrive", onArrived);
    socketService.on("course:demarre", onStarted);
    socketService.on("course:demarre_global", onGlobalStarted);
    socketService.on("position:chauffeur", onPosition);
    socketService.on("course:terminee", onCompleted);
    socketService.on("course:annulee", onCancelled);
    socketService.on("reservation:planifiee_non_acceptee", onPlannedNotAccepted);
    socketService.on("litige:status_update", onDisputeUpdate);

    return () => {
      socketService.off("course:acceptee", onAccepted);
      socketService.off("course:chauffeur_en_route", onEnRoute);
      socketService.off("course:chauffeur_arrive", onArrived);
      socketService.off("course:arrivee", onArrived);
      socketService.off("course:signaler_arrivee", onArrived);
      socketService.off("course:demarre", onStarted);
      socketService.off("course:demarre_global", onGlobalStarted);
      socketService.off("position:chauffeur", onPosition);
      socketService.off("course:terminee", onCompleted);
      socketService.off("course:annulee", onCancelled);
      socketService.off("reservation:planifiee_non_acceptee", onPlannedNotAccepted);
      socketService.off("litige:status_update", onDisputeUpdate);
    };
  }, [passenger?._id, passenger?.id]);

  // ✅ FIX CRITIQUE: Re-joindre la room si on a une course en cours (ex: F5)
  useEffect(() => {
    if (currentTrip?.reservationId &&
      ["driver_found", "approaching", "arrived", "en_route", "started"].includes(tripStatus || currentTrip.status)) {
      console.log(`🔄 [FIX] Re-Joining room for active trip: ${currentTrip.reservationId}`);
      socketService.emit("reservation:join", { reservationId: currentTrip.reservationId });

      // Si on est "en_route", on s'assure que le status local est bon
      if (currentTrip.status === 'en_route' && tripStatus !== 'en_route') {
        setTripStatus('en_route');
      }
    }
  }, [currentTrip?.reservationId, tripStatus]);

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
        id: reservationId, // ✅ FIX: Doublon
        pickup: confirmedData.pickup,
        destination: confirmedData.destination,
        estimatedPrice: confirmedData.price,
        vehicleType: confirmedData.vehicleType,
        paymentTime: confirmedData.paymentTime,
        paymentMethod: confirmedData.paymentMethod,
        momentPaiement: confirmedData.paymentTime === 'advance' ? 'MAINTENANT' : 'APRES', // ✅ FIX
        payment: reservation?.paiement, // ✅ FIX: Statut initial (ex: PAYE si avance)
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
      const isFormData = newData instanceof FormData;
      const config = {
        withCredentials: true,
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
      };

      const { data } = await axios.put(`${API_URL}/api${API_ROUTES.passager.profil.update}`, newData, config);
      if (data?.succes) {
        const updatedUser = data.profil || data.utilisateur || (isFormData ? null : newData);

        if (updatedUser) {
          setPassenger(updatedUser);
          if (updateAuthUser) {
            updateAuthUser(updatedUser);
          }
        }

        if (isFormData) {
          await fetchProfile();
        }
        toast.success("Profil mis à jour !");
        return true;
      }
    } catch (err) {
      console.error("❌ [CONTEXT] Erreur update profile:", err.message);
      toast.error(err.response?.data?.message || "Échec de la mise à jour du profil");
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

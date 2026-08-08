import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import socketService from '../../services/socketService';
import { offlineTripService } from '../../services/offlineTripService';
import { NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from '../NotificationContext';
import { getApiBaseURL } from '../../utils/urlHelper';

export const useTripLifecycle = ({ user, passenger, addNotification, userLocation, setCurrentPage }) => {
  // Course courante
  const [currentTrip, setCurrentTrip] = useState(null);
  const [tripStatus, setTripStatus] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const driverRef = useRef(null);
  useEffect(() => {
    driverRef.current = selectedDriver;
  }, [selectedDriver]);

  const [pendingTicket, setPendingTicket] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);

  // Historique
  const [trips, setTrips] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // éviter stale closure currentTrip dans listeners
  const currentTripRef = useRef(null);
  useEffect(() => {
    currentTripRef.current = currentTrip;
  }, [currentTrip]);

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
      // 🌍 Synchronisation avec le serveur
      fetchActiveTrip();
    } else {
      offlineTripService.clearState('PASSAGER');
    }
  }, [user]);

  // 🤖 [IA] Écouter les réservations créées par l'Assistant IA (global, hors Provider)
  useEffect(() => {
    const handleIAReservation = (event) => {
      const { action, reservationId, pickup, destination, vehicleType, isPlanifie } = event.detail;
      console.log(`🤖 [CONTEXT] Réservation IA reçue:`, event.detail);

      setCurrentTrip({
        reservationId,
        id: reservationId,
        pickup,
        destination,
        vehicleType,
        status: isPlanifie ? 'scheduled' : 'searching',
        typeCourse: isPlanifie ? 'PLANIFIEE' : 'IMMEDIATE',
        createdAt: new Date().toISOString()
      });

      if (isPlanifie) {
        setTripStatus('scheduled');
        setCurrentPage('planning');
        toast.success('📅 Réservation planifiée avec succès ! Consultez votre planning.', { id: 'ia-planned' });
      } else {
        setTripStatus('searching');
        setCurrentPage('home');
        toast.loading("🔍 Recherche d'un chauffeur...", { id: 'searching' });

        // Rejoindre la room socket pour recevoir les events
        if (reservationId) {
          socketService.onceConnected(() => {
            socketService.emit('reservation:join', { reservationId });
          });
        }
      }
    };

    window.addEventListener('taka-ia-reservation', handleIAReservation);
    return () => window.removeEventListener('taka-ia-reservation', handleIAReservation);
  }, []);

  // 💾 [OFFLINE] Sauvegarde automatique à chaque changement
  useEffect(() => {
    if (currentTrip) {
      offlineTripService.saveState('PASSAGER', {
        currentTrip,
        tripStatus,
        selectedDriver,
        pendingTicket
      });
    } else if (tripStatus === 'idle' || !tripStatus) {
      offlineTripService.clearState('PASSAGER');
    }
  }, [currentTrip, tripStatus, selectedDriver, pendingTicket]);

  // ✅ New function to restore state
  const fetchActiveTrip = async () => {
    try {
      // Endpoint hypothetique - à adapter selon API réelle.
      // Si n'existe pas, il faudra le créer ou utiliser une liste filtrée
      const baseURL = getApiBaseURL();
      const { data } = await axios.get(`${baseURL}/passager/reservations/active`, { withCredentials: true });

      if (data?.success && data?.reservation) {
        const r = data.reservation;
        console.log("🔄 [CONTEXT] Restoring active trip:", r._id);

        // Normalisation: EN_COURS (DB) -> en_route (Client), EN_ATTENTE -> searching
        let normalizedStatus = r.statut?.toLowerCase();
        if (r.statut === 'EN_COURS') normalizedStatus = 'en_route';
        if (r.statut === 'EN_ATTENTE') normalizedStatus = 'searching';

        setCurrentTrip({
          reservationId: r._id,
          id: r._id,
          pickup: r.depart?.libelle || r.depart || r.pickupAddress,
          destination: r.destination?.libelle || r.destination || r.destinationAddress,
          pickupCoords: r.depart?.coordonnees?.coordinates ? [r.depart.coordonnees.coordinates[1], r.depart.coordonnees.coordinates[0]] : [r.departLat, r.departLng],
          destinationCoords: r.destination?.coordonnees?.coordinates ? [r.destination.coordonnees.coordinates[1], r.destination.coordonnees.coordinates[0]] : [r.destinationLat, r.destinationLng],
          status: normalizedStatus,
          driver: r.chauffeur,
          price: r.prix,
          vehicleType: r.typeVehicule,
          paymentMethod: r.paiement?.methode || "CASH",
          payment: r.paiement,
          momentPaiement: r.momentPaiement,
          createdAt: r.createdAt,
          groupeTaxiPartage: r.groupeTaxiPartage?._id || r.groupeTaxiPartage
        });

        setTripStatus(normalizedStatus);

        const gId = r.groupeTaxiPartage?._id || r.groupeTaxiPartage;
        if (gId) {
          console.log(`🔌 [CONTEXT] Joining group room: GROUPE_${gId}`);
          socketService.emit("taxipartage:rejoindre_groupe", { groupeId: gId });
        }

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
      const groupeId = payload?.groupeTaxiPartage?._id || payload?.groupeTaxiPartage || payload?.groupeId;

      const eventKey = `accepted-${reservationId}`;
      if (notifiedEvents.current.has(eventKey)) return;

      const chauffeur = payload?.chauffeur || payload?.driver;

      if (!reservationId) return;

      // ✅ Joindre automatiquement la room de groupe si c'est un taxi partagé
      if (groupeId) {
        console.log(`🔌 [CONTEXT] Joining group room on accept: GROUPE_${groupeId}`);
        socketService.emit("taxipartage:rejoindre_groupe", { groupeId });
      }

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
          id: base.id || reservationId,
          status: "driver_found",
          driver: chauffeur || null,
          groupeTaxiPartage: groupeId || base.groupeTaxiPartage
        };
      });

      const gId = payload.groupeTaxiPartage?._id || payload.groupeTaxiPartage || payload.groupeId;
      if (gId) {
        console.log(`🔌 [CONTEXT] Joining group room: GROUPE_${gId}`);
        socketService.emit("taxipartage:rejoindre_groupe", { groupeId: gId });
      }

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
        id: `accepted-${reservationId}`,
        targetRole: 'PASSAGER'
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
        id: `approaching-${reservationId}`,
        targetRole: 'PASSAGER'
      });
      notifiedEvents.current.add(eventKey);

    };

    const onTPStatutMisAJour = (payload = {}) => {
      console.log("🚕 [PASSAGER] Statut TP mis à jour:", payload);
      const { reservationId, nouveauStatut, message, groupe } = payload;
      const trip = currentTripRef.current;

      // 1. Mise à jour de l'objet groupe si fourni
      if (groupe) {
        setCurrentTrip(prev => {
          if (!prev) return prev;
          // Si on n'avait pas de groupe, on l'ajoute et on rejoint la room
          const gId = groupe?._id || groupe?.id;
          if (gId && !prev.groupeTaxiPartage) {
            console.log(`🔌 [CONTEXT] Joining group room on update: GROUPE_${gId}`);
            socketService.emit("taxipartage:rejoindre_groupe", { groupeId: gId });
          }
          return { ...prev, groupeTaxiPartageObject: groupe, groupeTaxiPartage: gId || prev.groupeTaxiPartage };
        });
      }

      // 2. Si c'est ma réservation qui change de statut spécifique
      if (trip?.reservationId && sameRid(trip.reservationId, reservationId)) {
        if (nouveauStatut === "EN_COURS_DE_RAMASSAGE") {
          setTripStatus("chauffeur_en_route");
          setCurrentTrip(prev => prev ? { ...prev, status: "chauffeur_en_route" } : prev);
        } else if (nouveauStatut === "RAMASSE" || nouveauStatut === "ABORD") {
          setTripStatus("picked_up");
          setCurrentTrip(prev => prev ? { ...prev, status: "picked_up" } : prev);
        } else if (nouveauStatut === "EN_COURS") {
          console.log("🚀 [PASSAGER] Redirection via StatutMisAJour (EN_COURS)");
          onGlobalStarted({ ...payload, message: "Le trajet commence !" });
        }
        if (message) toast.success(message, { id: "tp-status" });
      } else {
        // Même si ce n'est pas moi, si je suis dans le même groupe, je veux voir l'évolution
        const gId = payload.groupeId || groupe?._id || groupe?.id;
        if (gId && sameRid(trip?.groupeTaxiPartage, gId)) {
          console.log("👥 [PASSAGER] Mise à jour groupe (autre passager):", reservationId, nouveauStatut);
          // On pourrait rafraîchir l'UI ici si on affichait la liste des passagers
        }
      }
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
        id: `arrived-${reservationId}`,
        targetRole: 'PASSAGER'
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
        id: `started-${reservationId}`,
        targetRole: 'PASSAGER'
      });
      notifiedEvents.current.add(eventKey);

    };

    const onGlobalStarted = (payload = {}) => {
      console.log("📨 [PASSAGER] Réception START global:", payload);
      const { reservationId, reservationIds, message, groupeId, groupe } = payload;
      const trip = currentTripRef.current;
      const tripRid = trip?.reservationId;
      const tripGid = trip?.groupeTaxiPartage;

      let matches = false;
      if (reservationId && sameRid(tripRid, reservationId)) matches = true;
      if (!matches && Array.isArray(reservationIds)) {
        matches = reservationIds.some(id => sameRid(tripRid, id));
      }
      if (!matches && (groupeId || groupe?._id) && tripGid) {
        matches = sameRid(tripGid, groupeId || groupe?._id);
      }
      if (!matches && trip?.driver?.id === payload?.chauffeurId) {
        matches = true;
      }

      if (!matches) {
        console.log("❌ Ce START ne me concerne pas.");
        return;
      }

      console.log(`🚀 [PASSAGER] Basculement en_route pour RID=${tripRid}`);
      setTripStatus("en_route");
      setCurrentTrip((prev) => (prev ? {
        ...prev,
        status: "en_route",
        groupeTaxiPartage: groupeId || groupe?._id || prev.groupeTaxiPartage
      } : prev));

      toast.success(message || "🚀 Le trajet commence !");
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

    const onTicketGenerated = (payload = {}) => {
      console.log("📩 [CONTEXT] ticket:genere reçu", payload);
      let { ticket } = payload;

      // ✅ Enrichir le ticket avec les infos du chauffeur si nécessaire
      // Si ticket.chauffeur est absent ou juste un ID (string), on utilise driverRef
      if (ticket && (!ticket.chauffeur || typeof ticket.chauffeur === 'string')) {
        const driver = driverRef.current || currentTripRef.current?.driver;
        if (driver) {
          console.log("🔧 [CONTEXT] Enrichissement du ticket avec les infos du chauffeur via REF");
          ticket.chauffeur = {
            _id: driver.id || driver._id,
            id: driver.id || driver._id,
            nom: driver.nom,
            prenom: driver.prenom,
            photoUrl: driver.photo || driver.photoUrl,
            telephone: driver.phone || driver.telephone
          };

          // ✅ Enrichir aussi le véhicule si absent
          if (!ticket.vehicule) {
            ticket.vehicule = driver.vehicle || driver.vehicule;
          }
        }
      }

      // Stocker le ticket pour ouverture automatique ultérieure
      setPendingTicket(ticket);
      setActiveTicket(ticket); // Garder une copie persistante pour le bouton "Voir mon ticket"

      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        category: NOTIFICATION_CATEGORIES.PAYMENT,
        title: 'Ticket généré ! 🎫',
        message: 'Votre ticket de course est prêt. Cliquez pour le voir.',
        id: `ticket-${ticket?._id || Date.now()}`,
        link: '/passager/tickets',
        targetRole: 'PASSAGER',
        onAction: () => {
          window.dispatchEvent(new CustomEvent('taka:open_ticket', { detail: ticket }));
        }
      });

      // Déclencher un événement global pour que les composants (ex: Profile) rafraîchissent leur liste
      window.dispatchEvent(new CustomEvent('taka:ticket_ready', { detail: ticket }));
    };

    // ✅ Fix 3 : écouter la fin de course côté backend
    const onCompleted = (payload = {}) => {
      const { reservationId, message, paymentStatus } = payload;
      const trip = currentTripRef.current;
      if (trip?.reservationId && !sameRid(trip.reservationId, reservationId)) return;

      console.log(`📩 [CONTEXT] course:terminee/finit reçu for RID=${reservationId}`);
      setTripStatus("completed");

      // Mettre à jour le statut paiement si fourni
      if (paymentStatus) {
        setCurrentTrip(prev => prev ? { ...prev, paymentStatus, payment: { ...prev.payment, statut: paymentStatus } } : prev);
      }

      const eventKey = `completed-${reservationId}`;
      if (notifiedEvents.current.has(eventKey)) return;

      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        category: NOTIFICATION_CATEGORIES.TRIP,
        title: 'Trajet terminé 🏁',
        message: message || 'Vous êtes arrivé à destination. Merci d\'avoir choisi TakaTaka !',
        id: 'trip-completion',
        targetRole: 'PASSAGER'
      });

      // Note: On ne met PAS currentTrip à null ici, car l'écran de résumé/note en a besoin.
      // Le nettoyage se fera à la fin du processus d'évaluation.
      notifiedEvents.current.add(eventKey);
    };

    const onArrivedDestination = ({ reservationId, message } = {}) => {
      const trip = currentTripRef.current;
      if (trip?.reservationId && !sameRid(trip.reservationId, reservationId)) return;

      console.log(`📩 [CONTEXT] course:arrive_destination reçu for RID=${reservationId}`);
      setTripStatus("completed"); // On bascule en completed pour montrer l'écran de fin
      if (message) toast.success(message);
    };

    // ✅ Fix 4 : écouter l'annulation côté backend (avec frais d'annulation Option 2)
    const onCancelled = ({ reservationId, message, fraisAnnulation, montantRembourse, avecFrais } = {}) => {
      const trip = currentTripRef.current;
      if (trip?.reservationId && !sameRid(trip.reservationId, reservationId)) return;

      console.log(`📩 [CONTEXT] course:annulee reçu for RID=${reservationId}`, { avecFrais, fraisAnnulation, montantRembourse });
      toast.dismiss("searching");
      setTripStatus("cancelled");
      setCurrentTrip(null);
      setSelectedDriver(null);

      // Message adapté selon la présence de frais d'annulation
      let notifMessage = message || "Votre course a été annulée.";
      let notifTitle = 'Course annulée ❌';
      if (avecFrais && fraisAnnulation > 0) {
        notifTitle = 'Course annulée (avec frais) ⚠️';
        notifMessage = `${fraisAnnulation?.toLocaleString()} GNF de frais d'annulation. ${montantRembourse > 0 ? `${montantRembourse?.toLocaleString()} GNF remboursés.` : ''}`;
      }

      addNotification({
        type: avecFrais ? NOTIFICATION_TYPES.WARNING : NOTIFICATION_TYPES.ERROR,
        category: NOTIFICATION_CATEGORIES.TRIP,
        title: notifTitle,
        message: notifMessage,
        targetRole: 'PASSAGER'
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
        priority: 'high',
        targetRole: 'PASSAGER'
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
    socketService.on("ticket:genere", onTicketGenerated);
    socketService.on("course:chauffeur_en_route", onEnRoute);
    socketService.on("course:chauffeur_arrive", onArrived);
    socketService.on("course:demarre", onStarted);
    socketService.on("course:demarre_global", onGlobalStarted);
    socketService.on("taxipartage:trajet_demarre", onGlobalStarted);
    socketService.on("taxipartage:statut_mis_a_jour", onTPStatutMisAJour);
    socketService.on("taxipartage:passager_ramasse", (data) => {
      console.log("🚕 [PASSAGER] Passager ramassé (TP):", data);
      if (sameRid(currentTripRef.current?.reservationId, data.reservationId)) {
        setTripStatus("picked_up");
        setCurrentTrip(prev => prev ? { ...prev, status: "picked_up" } : prev);
        toast.success(data.message || "Vous avez été ramassé !");
      }
    });

    socketService.on("position:chauffeur", onPosition);
    socketService.on("course:terminee", onCompleted);
    socketService.on("course:finit_avec_paiement", onCompleted);
    socketService.on("course:arrive_destination", onArrivedDestination);
    socketService.on("course:annulee", onCancelled);
    socketService.on("reservation:planifiee_non_acceptee", onPlannedNotAccepted);
    socketService.on("litige:status_update", onDisputeUpdate);

    return () => {
      socketService.off("course:acceptee", onAccepted);
      socketService.off("ticket:genere", onTicketGenerated);
      socketService.off("course:chauffeur_en_route", onEnRoute);
      socketService.off("course:chauffeur_arrive", onArrived);
      socketService.off("course:arrivee", onArrived);
      socketService.off("course:signaler_arrivee", onArrived);
      socketService.off("course:demarre", onStarted);
      socketService.off("course:demarre_global", onGlobalStarted);
      socketService.off("taxipartage:trajet_demarre");
      socketService.off("taxipartage:statut_mis_a_jour");
      socketService.off("taxipartage:passager_ramasse");
      socketService.off("position:chauffeur", onPosition);
      socketService.off("course:terminee", onCompleted);
      socketService.off("course:finit_avec_paiement", onCompleted);
      socketService.off("course:arrive_destination", onArrivedDestination);
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

      if (currentTrip.groupeTaxiPartage) {
        console.log(`🔄 [FIX] Re-Joining group room: ${currentTrip.groupeTaxiPartage}`);
        socketService.emit("taxipartage:rejoindre_groupe", { groupeId: currentTrip.groupeTaxiPartage });
      }

      // Si on est "en_route", on s'assure que le status local est bon
      if (currentTrip.status === 'en_route' && tripStatus !== 'en_route') {
        setTripStatus('en_route');
      }
    }
  }, [currentTrip?.reservationId, currentTrip?.groupeTaxiPartage, tripStatus]);

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

  const cancelTripByPassenger = async ({ reason } = {}) => {
    if (!currentTrip?.reservationId) return;
    const rid = currentTrip.reservationId;

    try {
      toast.dismiss("searching");

      // Appel API pour annulation + remboursement (avec frais si chauffeur assigné)
      try {
        const baseURL = getApiBaseURL();
        const { data } = await axios.post(
          `${baseURL}/reservations-immediate/${rid}/annuler-rembourser`,
          {},
          { withCredentials: true }
        );

        if (data?.succes) {
          if (data.fraisAnnulation?.avecFrais) {
            toast(`⚠️ Frais d'annulation : ${data.fraisAnnulation.montantFrais?.toLocaleString()} GNF\nRemboursé : ${data.fraisAnnulation.montantRembourse?.toLocaleString()} GNF`, { icon: '💸' });
          } else {
            toast.success("❌ Trajet annulé et remboursé");
          }
        }
      } catch (apiErr) {
        console.warn("⚠️ API cancel failed, fallback to socket:", apiErr.message);
        // Fallback: annuler via socket
        socketService.emit('course:annuler', { reservationId: rid, source: 'PASSAGER' });
        toast.success("❌ Trajet annulé");
      }

      setTripStatus("cancelled");
      setCurrentTrip(null);
      setSelectedDriver(null);
      setTimeout(() => setTripStatus(null), 1500);
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

  return {
    currentTrip,
    setCurrentTrip,
    tripStatus,
    setTripStatus,
    selectedDriver,
    setSelectedDriver,
    pendingTicket,
    setPendingTicket,
    activeTicket,
    setActiveTicket,
    trips,
    transactions,
    defineTrip,
    confirmTrip,
    cancelTripByPassenger,
    completeTrip,
  };
};

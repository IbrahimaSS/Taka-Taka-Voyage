import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverContext } from '../../../context/DriverContext';
import { useNotifications } from '../../../hooks/useNotificationsAudio';
import { formatMinutesToHuman } from './notificationHelpers';

export const useTripNotification = () => {
  const { tripRequests, acceptTripRequest, rejectTripRequest, dismissTripRequest } =
    useDriverContext();
  const { notifyNewTrip, stopNotificationSound } = useNotifications();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [vibration, setVibration] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isExpandedFull, setIsExpandedFull] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const contentRef = useRef(null);
  const previousRequestsCount = useRef(0);

  // total seconds fixé par id de demande
  const requestTotalSecondsRef = useRef(new Map());

  const rawRequest = tripRequests?.[0] || null;

  /**
   * Normalisation backend -> UI
   * backend envoie passenger:{nom,prenom,telephone,noteMoyenne} + distanceKm + dureeMin
   * l'UI attend passengerName/passengerPhone/passengerRating + distance/estimatedTime
   */
  const currentRequest = useMemo(() => {
    if (!rawRequest) return null;

    const passengerName =
      rawRequest.passengerName ||
      `${rawRequest?.passenger?.nom || ""} ${rawRequest?.passenger?.prenom || ""}`.trim() ||
      "Passager";

    const passengerPhone =
      rawRequest.passengerPhone || rawRequest?.passenger?.telephone || "";

    const passengerRating =
      rawRequest.passengerRating ??
      rawRequest?.passenger?.noteMoyenne ??
      5;

    const distanceKm =
      rawRequest.distance ??
      rawRequest.distanceKm ??
      rawRequest.distanceToDriver ??
      null;

    const estimatedTime =
      rawRequest.estimatedTime ??
      (rawRequest.dureeMin != null ? formatMinutesToHuman(rawRequest.dureeMin) : "—");

    return {
      ...rawRequest,
      passengerName,
      passengerPhone,
      passengerRating,
      distance: distanceKm != null ? Number(distanceKm) : null,
      estimatedTime,
      // compat
      pickupAddress: rawRequest.pickupAddress ?? rawRequest.depart ?? rawRequest.pickup ?? rawRequest.departAddress,
      destinationAddress:
        rawRequest.destinationAddress ??
        rawRequest.destination ??
        rawRequest.destinationName ??
        rawRequest.arrivee ??
        rawRequest.destinationLabel,
    };
  }, [rawRequest]);

  // init total seconds à l'arrivée d'une nouvelle demande
  useEffect(() => {
    if (!currentRequest?.id) return;
    if (!requestTotalSecondsRef.current.has(currentRequest.id)) {
      requestTotalSecondsRef.current.set(
        currentRequest.id,
        Number(currentRequest.expiresIn ?? 60)
      );
    }
  }, [currentRequest?.id]);

  const totalSeconds = useMemo(() => {
    if (!currentRequest?.id) return 60;
    return requestTotalSecondsRef.current.get(currentRequest.id) ?? 60;
  }, [currentRequest?.id]);

  // vérifier scroll
  const checkScrollable = useCallback(() => {
    if (!contentRef.current) return;

    const contentHeight = contentRef.current.scrollHeight;
    const containerHeight = contentRef.current.clientHeight;
    const scrollable = contentHeight > containerHeight;
    setIsScrollable(scrollable);

    const isAtBottom =
      Math.abs(
        contentRef.current.scrollHeight -
        contentRef.current.scrollTop -
        contentRef.current.clientHeight
      ) < 1;

    setShowScrollIndicator(scrollable && !isAtBottom);
  }, []);

  // vibration
  useEffect(() => {
    if (tripRequests?.length > 0) {
      setVibration(true);
      const t = setTimeout(() => setVibration(false), 500);
      return () => clearTimeout(t);
    }
  }, [tripRequests?.length]);

  // son nouvelles demandes
  useEffect(() => {
    if ((tripRequests?.length || 0) > previousRequestsCount.current) {
      const latest = tripRequests?.[0];
      if (latest) {
        console.log("🔔 [STABLE_TOAST] Nouvelle demande, bip + ouverture");
        notifyNewTrip(latest);
        setExpanded(true); // Ajout pour forcer l'affichage du modal
      }
    }
    previousRequestsCount.current = tripRequests?.length || 0;
  }, [tripRequests, notifyNewTrip]);

  // stop son si plus de demandes
  useEffect(() => {
    if ((tripRequests?.length || 0) === 0) stopNotificationSound();
  }, [tripRequests?.length, stopNotificationSound]);

  // observer scroll
  useEffect(() => {
    checkScrollable();
    const ro = new ResizeObserver(checkScrollable);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [expanded, isExpandedFull, checkScrollable]);

  const handleScroll = () => checkScrollable();

  const handleAccept = (reservationId) => {
    if (!reservationId) return;
    setIsAccepting(true);
    stopNotificationSound();
    acceptTripRequest(reservationId);
    navigate("/chauffeur/tracking");

    // Réactiver les boutons après 3 secondes pour permettre d'autres acceptations
    setTimeout(() => {
      setIsAccepting(false);
    }, 3000);
  };

  const handleReject = (reservationId) => {
    if (!reservationId) return;
    rejectTripRequest(reservationId);
  };

  const handleDismiss = (reservationId) => {
    if (!reservationId) return;
    dismissTripRequest(reservationId);
  };

  const handleTimeEnd = () => {
    const first = tripRequests?.[0];
    if (first?.id) handleReject(first.id);
  };

  const toggleExpandFull = () => setIsExpandedFull((p) => !p);

  return {
    tripRequests,
    currentRequest,
    expanded,
    setExpanded,
    vibration,
    isScrollable,
    showScrollIndicator,
    isExpandedFull,
    isAccepting,
    contentRef,
    totalSeconds,
    handleScroll,
    handleAccept,
    handleReject,
    handleDismiss,
    handleTimeEnd,
    toggleExpandFull,
  };
};

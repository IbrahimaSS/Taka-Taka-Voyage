/**
 * TripNotificationToast.jsx
 * Notification visuelle moderne pour nouvelles demandes de courses
 * ✅ FIX: inset-2
 * ✅ FIX: TimerCircle ne redémarre plus chaque seconde
 * ✅ FIX: mapping backend -> UI (passenger / distanceKm / dureeMin)
 * ✅ FIX: confirm modal utilise les champs normalisés
 * ✅ Robustesse: anti double timeEnd + safe reject
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  User,
  Clock,
  DollarSign,
  Star,
  Phone,
  X,
  Check,
  Target,
  Route,
  Sparkles,
  Bell,
  Zap,
  Award,
  Timer,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useDriverContext } from "../../context/DriverContext";
import { useNotifications } from "../../hooks/useNotificationsAudio";
import { useNavigate } from "react-router-dom";
import Button from "../admin/ui/Bttn";
import Badge from "../admin/ui/Badge";
import ConfirmModal from "../admin/ui/ConfirmModal";

/** Helpers */
const safeStr = (v, fallback = "—") =>
  typeof v === "string" && v.trim() ? v.trim() : fallback;

const safeNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const formatMinutesToHuman = (min) => {
  const m = safeNum(min, 0);
  if (!m) return "—";
  if (m < 60) return `${Math.round(m)} min`;
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  return r ? `${h}h ${r}m` : `${h}h`;
};

/**
 * TimerCircle stable: total fixé au début, remaining varie
 */
const TimerCircle = ({
  total = 60,
  remaining = 60,
  size = 40,
  strokeWidth = 4,
  onTimeEnd,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const safeTotal = Math.max(1, Number(total || 60));
  const safeRemaining = Math.max(0, Number(remaining ?? safeTotal));
  const progress = Math.min(1, Math.max(0, 1 - safeRemaining / safeTotal));
  const strokeDashoffset = circumference * (1 - progress);

  // ✅ évite d'appeler onTimeEnd plusieurs fois
  const endedRef = useRef(false);
  useEffect(() => {
    if (safeRemaining <= 0 && !endedRef.current) {
      endedRef.current = true;
      onTimeEnd?.();
    }
  }, [safeRemaining, onTimeEnd]);

  // reset si total change (nouvelle demande)
  useEffect(() => {
    endedRef.current = false;
  }, [safeTotal]);

  const getColor = () => {
    if (progress < 0.5) return "#10B981";
    if (progress < 0.75) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.2s linear, stroke 0.3s ease",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <Timer className="w-4 h-4 text-white" />
      </div>

      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-bold text-white/90">
        {safeRemaining}s
      </div>
    </div>
  );
};

const TripNotificationToast = () => {
  const { tripRequests, acceptTripRequest, rejectTripRequest } =
    useDriverContext();
  const { notifyNewTrip, stopNotificationSound } = useNotifications();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [vibration, setVibration] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isExpandedFull, setIsExpandedFull] = useState(false);

  const contentRef = useRef(null);
  const previousRequestsCount = useRef(0);

  // ✅ total seconds fixed per request id
  const requestTotalSecondsRef = useRef(new Map());

  const rawRequest = tripRequests?.[0] || null;

  /**
   * ✅ Normalisation backend -> UI
   * backend envoie passenger:{nom,prenom,telephone,noteMoyenne} + distanceKm + dureeMin
   * ton UI attend passengerName/passengerPhone/passengerRating + distance/estimatedTime
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

  // ✅ init total seconds when new request arrives
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

  // Vérifier scroll
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
      if (latest) notifyNewTrip(latest);
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
    stopNotificationSound();
    acceptTripRequest(reservationId);
    navigate("/chauffeur/tracking");
  };

  const handleReject = (reservationId) => {
    if (!reservationId) return;
    rejectTripRequest(reservationId);
  };

  const handleAcceptWithConfirm = (request) => {
    stopNotificationSound();
    setSelectedRequest(request);
    setShowConfirm(true);
  };

  const handleConfirmAccept = () => {
    if (selectedRequest?.id) handleAccept(selectedRequest.id);
    setShowConfirm(false);
    setSelectedRequest(null);
  };

  const handleConfirmReject = () => {
    if (selectedRequest?.id) handleReject(selectedRequest.id);
    setShowConfirm(false);
    setSelectedRequest(null);
  };

  const handleTimeEnd = () => {
    const first = tripRequests?.[0];
    if (first?.id) handleReject(first.id);
  };

  const toggleExpandFull = () => setIsExpandedFull((p) => !p);

  if (!currentRequest) return null;

  return (
    <>
      <AnimatePresence>
        {currentRequest && !showConfirm && (
          <motion.div
            key={currentRequest.id}
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x: vibration ? ["0%", "-1%", "1%", "-1%", "0%"] : "0%",
            }}
            exit={{ opacity: 0, y: -100, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              x: { duration: 0.3, times: [0, 0.2, 0.4, 0.6, 1] },
            }}
            className={`fixed ${
              isExpandedFull ? "inset-2" : "top-4 left-1/2"
            } z-[9999] w-[95%] max-w-xl ${
              isExpandedFull ? "h-[95vh]" : ""
            } transform ${isExpandedFull ? "" : "-translate-x-1/2"} bg-gray-50 dark:bg-gray-800`}
            style={{ perspective: 1000 }}
          >
            <motion.div
              whileHover={{ y: isExpandedFull ? 0 : -4 }}
              className={`relative group ${isExpandedFull ? "h-full" : ""}`}
            >
              {/* lueur */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 blur-3xl rounded-3xl -z-10 opacity-50" />

              <div
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm ${
                  isExpandedFull ? "h-full flex flex-col" : ""
                }`}
              >
                {/* header */}
                <div className="relative bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"
                      >
                        <Bell className="w-5 h-5 text-white" />
                      </motion.div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold text-lg">
                            Nouvelle Course Disponible !
                          </h3>
                          <Sparkles className="w-4 h-4 text-yellow-300" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Timer className="w-3 h-3 text-white/80" />
                          <p className="text-white/90 text-sm">
                            Expire dans{" "}
                            <span className="font-bold">
                              {Number(currentRequest.expiresIn ?? 60)}s
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <TimerCircle
                        total={totalSeconds}
                        remaining={currentRequest.expiresIn}
                        onTimeEnd={handleTimeEnd}
                      />

                      <Button
                        variant="ghost"
                        size="small"
                        icon={isExpandedFull ? Minimize2 : Maximize2}
                        onClick={toggleExpandFull}
                        className="text-white hover:bg-white/20"
                        tooltip={isExpandedFull ? "Réduire" : "Agrandir"}
                      />
                    </div>
                  </div>

                  {tripRequests?.length > 1 && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
                    >
                      <Badge
                        variant="warning"
                        size="sm"
                        className="shadow-lg cursor-pointer"
                        onClick={() => setExpanded(!expanded)}
                      >
                        +{tripRequests.length - 1} autres
                      </Badge>
                    </motion.div>
                  )}
                </div>

                {/* contenu */}
                <div
                  ref={contentRef}
                  onScroll={handleScroll}
                  className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent ${
                    isExpandedFull
                      ? "max-h-[calc(100vh-180px)]"
                      : "max-h-[60vh]"
                  }`}
                >
                  <div className="p-6 space-y-6">
                    {/* passager */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center"
                          >
                            <Award className="w-3 h-3 text-white" />
                          </motion.div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 dark:text-white text-lg truncate">
                              {safeStr(currentRequest.passengerName, "Passager")}
                            </p>
                            <Badge variant="primary" size="xs">
                              PREMIUM
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-bold">
                                {safeNum(currentRequest.passengerRating, 5).toFixed(1)}
                              </span>
                              <span className="text-gray-500 text-xs">
                                (500+ voyages)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {!!currentRequest.passengerPhone && (
                        <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Phone}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                `tel:${currentRequest.passengerPhone}`,
                                "_blank"
                              );
                            }}
                            className="text-blue-600 dark:text-blue-400"
                          >
                            Appeler
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* itinéraire */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          <Route className="w-5 h-5 text-blue-500" />
                          Itinéraire détaillé
                        </h4>
                        <Badge variant="outline" size="xs">
                          {currentRequest.distance != null
                            ? `${safeNum(currentRequest.distance, 0).toFixed(1)} km`
                            : "—"}
                        </Badge>
                      </div>

                      <div className="relative pl-10">
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-rose-500" />

                        {/* départ */}
                        <div className="flex items-start gap-4 mb-8">
                          <div className="absolute left-3.5 -translate-x-1/2">
                            <div className="w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-900/50 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          </div>

                          <div className="flex-1 pl-4">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4 text-emerald-500" />
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                                DÉPART
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {safeStr(currentRequest.pickupAddress)}
                            </p>
                          </div>
                        </div>

                        {/* destination */}
                        <div className="flex items-start gap-4">
                          <div className="absolute left-3.5 -translate-x-1/2">
                            <div className="w-5 h-5 rounded-full bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-900/50 flex items-center justify-center">
                              <Target className="w-2.5 h-2.5 text-white" />
                            </div>
                          </div>

                          <div className="flex-1 pl-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Target className="w-4 h-4 text-rose-500" />
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                                DESTINATION
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {safeStr(currentRequest.destinationAddress)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-2xl text-center"
                      >
                        <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <Route className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                          Distance
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-emerald-400 mt-1">
                          {currentRequest.distance != null
                            ? `${safeNum(currentRequest.distance, 0).toFixed(1)} km`
                            : "—"}
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-2xl text-center"
                      >
                        <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                          Durée
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-emerald-400 mt-1">
                          {safeStr(currentRequest.estimatedTime)}
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-2xl text-center"
                      >
                        <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                          Gains estimés
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-emerald-400 mt-1">
                          {safeNum(currentRequest.estimatedFare, 0).toLocaleString("fr-FR")}{" "}
                          FG
                        </p>
                      </motion.div>
                    </div>

                    {/* petit indicateur scroll (optionnel) */}
                    {showScrollIndicator && isScrollable && (
                      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                        Faites défiler pour voir plus ↓
                      </div>
                    )}
                  </div>
                </div>

                {/* footer actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <div className="flex gap-4">
                    <Button
                      variant="danger"
                      size="large"
                      icon={X}
                      onClick={() => {
                        setSelectedRequest(currentRequest);
                        setShowConfirm(true); // confirm avant refus aussi (cohérent)
                      }}
                      fullWidth
                      className="h-12"
                    >
                      Refuser
                    </Button>

                    <Button
                      variant="primary"
                      size="large"
                      icon={Check}
                      onClick={() => handleAcceptWithConfirm(currentRequest)}
                      fullWidth
                      className="h-12 shadow-lg shadow-emerald-500/30"
                    >
                      <span className="flex items-center gap-2">
                        Accepter
                        <Zap className="w-4 h-4 animate-pulse" />
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* confirm accept / reject */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedRequest(null);
        }}
        onConfirm={() => {
          // si tu veux 2 boutons distincts dans ConfirmModal, adapte son API.
          // Ici, on confirme l'action selon le dernier bouton cliqué :
          // - Si selectedRequest existe et on a choisi "Accepter" via handleAcceptWithConfirm -> on valide accept
          // - Si selectedRequest existe via bouton "Refuser" -> on refuse
          // ✅ Simple: si modal ouvert après "Accepter", selectedRequest vient de handleAcceptWithConfirm
          // ✅ Si modal ouvert après "Refuser", selectedRequest vient du bouton Refuser ci-dessus
          // -> on détecte via un flag
          // Pour rester 100% clair, on utilise actionRef:
        }}
        title="Confirmer l'action"
        message={
          <div className="space-y-3">
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              Confirmez votre décision pour cette course.
            </p>
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 p-4 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-bold">Passager:</span>{" "}
                {safeStr(selectedRequest?.passengerName, "Passager")}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <span className="font-bold">Distance:</span>{" "}
                {selectedRequest?.distance != null
                  ? `${safeNum(selectedRequest.distance, 0).toFixed(1)} km`
                  : "—"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <span className="font-bold">Gains:</span>{" "}
                {safeNum(selectedRequest?.estimatedFare, 0).toLocaleString("fr-FR")}{" "}
                FG
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="danger"
                size="small"
                icon={X}
                onClick={() => {
                  if (selectedRequest?.id) handleReject(selectedRequest.id);
                  setShowConfirm(false);
                  setSelectedRequest(null);
                }}
                fullWidth
              >
                Confirmer Refus
              </Button>

              <Button
                variant="primary"
                size="small"
                icon={Check}
                onClick={() => {
                  if (selectedRequest?.id) handleAccept(selectedRequest.id);
                  setShowConfirm(false);
                  setSelectedRequest(null);
                }}
                fullWidth
              >
                Confirmer Acceptation
              </Button>
            </div>
          </div>
        }
        // on ignore le bouton confirm du modal si ton ConfirmModal l'affiche automatiquement.
        // Si ton ConfirmModal force un seul bouton "Confirmer", mets-le en mode customContent uniquement.
        confirmText={null}
        cancelText={null}
        confirmVariant="success"
        type="success"
      />
    </>
  );
};

export default TripNotificationToast;

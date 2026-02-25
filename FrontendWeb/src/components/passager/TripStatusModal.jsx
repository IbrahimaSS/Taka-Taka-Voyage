import React, { useMemo, useState } from "react";
import {
  Car,
  Clock,
  Navigation,
  Phone,
  X,
  Check,
  Loader,
  Users,
  Map,
  Calendar,
  AlertCircle,
  ChevronRight,
  MapPin,
  Star,
  Shield,
  BadgePercent,
  Flag,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import Modal from "../admin/ui/Modal";
import Button from "../admin/ui/Bttn";
import Card, { CardHeader, CardTitle, CardContent } from "../admin/ui/Card";
import Badge from "../admin/ui/Badge";
import Progress from "../admin/ui/Progress";
import ConfirmModal from "../admin/ui/ConfirmModal";

const TripStatusModal = ({
  isOpen,
  onClose,
  status,
  driver,
  tripDetails,
  onCancel,
  onTripComplete,
  onStartTrip,
  onViewPlanning,
  onSearchAgain,
  onRateTrip,
  arrivalSecondsRemaining,
  onContact,
  onTrack,
}) => {
  const { t } = useTranslation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const cancelReasons = [
    t('status.cancel_confirm.reasons.too_long'),
    t('status.cancel_confirm.reasons.change_plans'),
    t('status.cancel_confirm.reasons.too_expensive'),
    t('status.cancel_confirm.reasons.driver_late'),
    t('status.cancel_confirm.reasons.vehicle_problem'),
    t('status.cancel_confirm.reasons.other'),
  ];

  const formatPrice = (price) => {
    if (!price) return "0 GNF";
    return typeof price === "number" ? `${price.toLocaleString()} GNF` : price;
  };

  const formatSeconds = (s) => {
    if (s == null) return null;
    const sec = Number(s);
    if (Number.isNaN(sec) || sec <= 0) return "00:00";
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const ss = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const statusConfig = useMemo(() => {
    const map = {
      searching: {
        title: t('status.searching.title'),
        description: t('status.searching.description'),
        icon: Loader,
        color: "green",
      },
      driver_found: {
        title: t('status.driver_found.title'),
        description: t('status.driver_found.description'),
        icon: Car,
        color: "green",
      },
      arrived: {
        title: t('status.arrived.title'),
        description: t('status.arrived.description'),
        icon: Check,
        color: "green",
      },
      en_route: {
        title: t('status.en_route.title'),
        description: t('status.en_route.description'),
        icon: Navigation,
        color: "green",
      },
      cancelled: {
        title: t('status.cancelled.title'),
        description: t('status.cancelled.description'),
        icon: X,
        color: "red",
      },
      scheduled: {
        title: t('status.scheduled.title'),
        description: t('status.scheduled.description'),
        icon: Calendar,
        color: "blue",
      },
      completed: {
        title: t('status.completed.title'),
        description: t('status.completed.description'),
        icon: Check,
        color: "green",
      },
    };
    return map[status] || map.searching;
  }, [status]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      // ✅ pas de fake wait: si tu veux, tu peux enlever ce délai
      await onCancel?.({ reason: cancelReason });
      setCancelReason("");
      setShowCancelConfirm(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleStartTrip = () => {
    onStartTrip?.(tripDetails, driver);
  };

  // ────────────────────────────────────────────────
  // UI blocs
  // ────────────────────────────────────────────────

  const renderSearching = () => (
    <Card className="mb-6">
      <CardContent>
        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center mx-auto mb-4">
            <Loader className="w-12 h-12 text-green-600 dark:text-green-400 animate-spin" />
          </div>

          {/* ✅ Ici tu peux afficher stats venant du parent si tu veux */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-400">—</p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">{t('status.searching.drivers_contacted')}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">—</p>
                  <p className="text-xs text-green-600 dark:text-green-300">{t('status.searching.estimated_time')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                {t('status.searching.cancel_info')}
              </p>
            </div>
          </div>
        </div>

        <Button variant="danger" fullWidth onClick={() => setShowCancelConfirm(true)}>
          {t('status.searching.cancel_btn')}
        </Button>
      </CardContent>
    </Card>
  );

  const renderDriverFound = () => {
    if (!driver) {
      return (
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-center justify-center py-8 text-gray-600 dark:text-gray-400">
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              {t('status.driver_found.waiting_driver')}
            </div>
          </CardContent>
        </Card>
      );
    }

    const name = driver.name || `${driver?.nom || ""} ${driver?.prenom || ""}`.trim() || "Chauffeur";
    const rating = driver.rating ?? driver.noteMoyenne ?? 4.5;

    return (
      <>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mr-4 relative shadow-lg overflow-hidden border-2 border-white dark:border-gray-800">
                  {driver.photo ? (
                    <img src={driver.photo} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  )}
                  {driver.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{name}</h3>
                    {driver.verified && (
                      <Badge variant="info" size="xs" className="ml-2">
                        {t('status.driver_found.verified')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(rating)
                          ? "text-amber-400 dark:text-amber-500 fill-amber-400 dark:fill-amber-500"
                          : "text-gray-300 dark:text-gray-600"
                          }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{rating}</span>
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="small" icon={Phone} onClick={onContact} className="!p-2" />
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Car className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  {driver.vehicle?.brand || driver.vehicleBrand || "—"} {driver.vehicle?.model || driver.vehicleModel || ""} •{" "}
                  {driver.vehicle?.plate || driver.plate || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                  <div className="text-gray-700 dark:text-gray-300">
                    <div>
                      {t('status.driver_found.arrival_scheduled')} • <span className="font-medium">{driver.eta || "—"}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{driver.distance || "—"}</div>
                  </div>
                </div>

                {arrivalSecondsRemaining != null && (
                  <div className="ml-4 flex items-center space-x-3">
                    <Badge variant="secondary" size="sm">
                      {formatSeconds(arrivalSecondsRemaining)}
                    </Badge>
                    <Progress value={100} color="green" size="sm" showLabel={false} className="w-20" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle size="sm">{t('status.trip_details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{t('status.pickup')}</span>
                </div>
                <span className="text-gray-900 dark:text-gray-100 font-medium text-right">{tripDetails?.pickup}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{t('status.destination')}</span>
                </div>
                <span className="text-gray-900 dark:text-gray-100 font-medium text-right">{tripDetails?.destination}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BadgePercent className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{t('status.price')}</span>
                </div>
                <span className="text-green-700 dark:text-green-400 font-bold">
                  {formatPrice(tripDetails?.estimatedPrice)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Button variant="primary" fullWidth icon={Map} onClick={onTrack}>
            {t('status.driver_found.track_on_map')}
          </Button>
          <Button variant="danger" onClick={() => setShowCancelConfirm(true)} className="sm:w-auto">
            {t('status.driver_found.cancel_btn')}
          </Button>
        </div>
      </>
    );
  };

  const renderOtherStatuses = () => {
    switch (status) {
      case "arrived":
        return (
          <Card>
            <CardContent>
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t('status.arrived.title_full')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{t('status.arrived.subtitle')}</p>
              </div>

              <Button variant="primary" fullWidth icon={Navigation} onClick={handleStartTrip}>
                {t('status.arrived.start_trip')}
              </Button>
            </CardContent>
          </Card>
        );

      case "en_route":
        return (
          <Card>
            <CardContent>
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Navigation className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('status.en_route.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('status.en_route.description')}</p>
              </div>

              <Button variant="primary" fullWidth icon={Flag} onClick={onTripComplete}>
                {t('status.en_route.finish_trip')}
              </Button>
            </CardContent>
          </Card>
        );

      case "scheduled":
        return (
          <Card>
            <CardContent>
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('status.scheduled.title_full')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('status.scheduled.subtitle')}</p>
              </div>

              <Button variant="primary" fullWidth icon={ChevronRight} onClick={onViewPlanning}>
                {t('status.scheduled.view_planning')}
              </Button>
            </CardContent>
          </Card>
        );

      case "cancelled":
        return (
          <Card>
            <CardContent>
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <X className="w-12 h-12 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('status.cancelled.title_full')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('status.cancelled.subtitle')}</p>
              </div>

              <div className="space-y-3">
                <Button variant="primary" fullWidth onClick={onSearchAgain}>
                  {t('status.cancelled.search_again')}
                </Button>
                <Button variant="secondary" fullWidth onClick={onClose}>
                  {t('status.cancelled.back_home')}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "completed":
        return (
          <Card>
            <CardContent>
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('status.completed.title_full')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('status.completed.subtitle')}</p>
              </div>

              <Button variant="primary" fullWidth icon={Star} onClick={onRateTrip}>
                {t('status.completed.rate_trip')}
              </Button>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button variant="info" fullWidth onClick={onSearchAgain}>
                  {t('status.completed.new_trip')}
                </Button>
                <Button variant="secondary" fullWidth onClick={onClose}>
                  {t('status.completed.back')}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={status !== "searching"}>
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{statusConfig.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{statusConfig.description}</p>
          </div>

          {status === "searching" && renderSearching()}
          {status === "driver_found" && renderDriverFound()}
          {status !== "searching" && status !== "driver_found" && renderOtherStatuses()}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => {
          setShowCancelConfirm(false);
          setCancelReason("");
        }}
        onConfirm={handleCancel}
        title={t('status.cancel_confirm.title')}
        message={t('status.cancel_confirm.message')}
        type="warning"
        confirmText={t('status.cancel_confirm.confirm_btn')}
        cancelText={t('status.cancel_confirm.cancel_btn')}
        confirmVariant="danger"
        loading={isCancelling}
        showComment={true}
        commentLabel={t('status.cancel_confirm.reason_label')}
        commentPlaceholder={t('status.cancel_confirm.reason_placeholder')}
        commentValue={cancelReason}
        onCommentChange={setCancelReason}
        destructive={true}
      >
        <div className="space-y-2 mb-4">
          {cancelReasons.map((reason, index) => (
            <button
              key={index}
              onClick={() => setCancelReason(reason)}
              className={`w-full text-left px-4 py-2 rounded-lg border text-sm ${cancelReason === reason
                ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              {reason}
            </button>
          ))}
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {t('status.cancel_confirm.late_cancel_warning')}
          </p>
        </div>
      </ConfirmModal>
    </>
  );
};

export default TripStatusModal;

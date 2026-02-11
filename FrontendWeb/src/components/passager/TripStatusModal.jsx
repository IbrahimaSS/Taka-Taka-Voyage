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
  Mail,
} from "lucide-react";
import clsx from "clsx";

import Modal from "../admin/ui/Modal";
import Button from "../admin/ui/Bttn";
import Card, { CardHeader, CardTitle, CardContent } from "../admin/ui/Card";
import Badge from "../admin/ui/Badge";
import Progress from "../admin/ui/Progress";
import ConfirmModal from "../admin/ui/ConfirmModal";

/**
 * TripStatusModal
 * - AUCUNE simulation ici.
 * - Le parent doit mettre à jour:
 *    status: 'searching' | 'driver_found' | 'approaching' | 'arrived' | 'en_route' | 'completed' | 'cancelled' | 'scheduled'
 *    driver: objet chauffeur reçu via socket "course:acceptee"
 *    tripDetails: détails réservation
 *    arrivalSecondsRemaining: optionnel (si tu le calcules ailleurs)
 */
const TripStatusModal = React.memo(({
  isOpen,
  onClose,
  status,
  driver,
  tripDetails,
  onCancel,
  onContact,
  onTrack,
  onStartTrip,
  onViewPlanning,
  onSearchAgain,
  onRateTrip,
  onTripComplete,
  arrivalSecondsRemaining,
}) => {
  const [isCancelling, setIsCancelling] = useState(false);



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
        title: "🔍 Recherche en cours",
        description: "Nous cherchons le meilleur chauffeur pour vous...",
        icon: Loader,
        color: "green",
      },
      driver_found: {
        title: "✅ Chauffeur trouvé",
        description: "Un chauffeur a accepté votre course.",
        icon: Car,
        color: "green",
      },
      approaching: {
        title: "🚗 Chauffeur en route",
        description: "Votre chauffeur arrive bientôt.",
        icon: Car,
        color: "green",
      },
      arrived: {
        title: "🚗 Arrivée confirmée",
        description: "Votre chauffeur vous attend au point de départ",
        icon: Check,
        color: "green",
      },
      en_route: {
        title: "🚗 Trajet en cours",
        description: "Vous êtes en route vers votre destination",
        icon: Navigation,
        color: "green",
      },
      cancelled: {
        title: "❌ Course annulée",
        description: "La course a été annulée",
        icon: X,
        color: "red",
      },
      scheduled: {
        title: "📅 Course planifiée",
        description: "Votre course est programmée pour plus tard",
        icon: Calendar,
        color: "blue",
      },
      completed: {
        title: "🏁 Trajet terminé",
        description: "Merci d'avoir voyagé avec TakaTaka",
        icon: Check,
        color: "green",
      },
    };
    return map[status] || map.searching;
  }, [status]);

  const handleCancelRequest = () => {
    onCancel?.();
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
                  <p className="text-xs text-blue-600 dark:text-blue-300">Chauffeurs contactés</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">—</p>
                  <p className="text-xs text-green-600 dark:text-green-300">Temps estimé</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Vous pouvez annuler gratuitement avant l'arrivée du chauffeur
              </p>
            </div>
          </div>
        </div>

        <Button variant="danger" fullWidth onClick={handleCancelRequest}>
          Annuler la recherche
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
              En attente des infos chauffeur...
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mr-4 relative shadow-lg">
                  <span className="text-2xl font-bold text-white">{name.charAt(0)}</span>
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
                        Vérifié
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

              <div className="space-y-1 pl-8">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Phone className="w-4 h-4 mr-2" /> {driver.phone || driver.telephone || "—"}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-2" /> {driver.email || "—"}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                  <div className="text-gray-700 dark:text-gray-300">
                    <div>
                      Arrivée prévue • <span className="font-medium">{driver.eta || "—"}</span>
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
            <CardTitle size="sm">Détails du trajet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">Départ</span>
                </div>
                <span className="text-gray-900 dark:text-gray-100 font-medium text-right">{tripDetails?.pickup}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">Destination</span>
                </div>
                <span className="text-gray-900 dark:text-gray-100 font-medium text-right">{tripDetails?.destination}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BadgePercent className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">Prix</span>
                </div>
                <span className="text-green-700 dark:text-green-400 font-bold">
                  {formatPrice(tripDetails?.estimatedPrice)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Button variant="danger" fullWidth onClick={handleCancelRequest}>
            Annuler
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
                  Votre chauffeur est arrivé !
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Montez à bord pour commencer votre trajet</p>
              </div>

              <Button variant="primary" fullWidth icon={Navigation} onClick={handleStartTrip}>
                Démarrer le trajet
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Trajet en cours</h3>
                <p className="text-gray-600 dark:text-gray-400">Vous êtes en route vers votre destination</p>
              </div>

              <Button variant="primary" fullWidth icon={Flag} onClick={onTripComplete}>
                Arriver à destination
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Course planifiée !</h3>
                <p className="text-gray-600 dark:text-gray-400">Votre course a été planifiée avec succès.</p>
              </div>

              <Button variant="primary" fullWidth icon={ChevronRight} onClick={onViewPlanning}>
                Voir votre planning
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Course annulée !</h3>
                <p className="text-gray-600 dark:text-gray-400">Votre course a été annulée avec succès.</p>
              </div>

              <div className="space-y-3">
                <Button variant="primary" fullWidth onClick={onSearchAgain}>
                  Rechercher un nouveau trajet
                </Button>
                <Button variant="secondary" fullWidth onClick={onClose}>
                  Retour à l'accueil
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Trajet terminé !</h3>
                <p className="text-gray-600 dark:text-gray-400">Merci d'avoir voyagé avec TakaTaka</p>
              </div>

              <Button variant="primary" fullWidth icon={Star} onClick={onRateTrip}>
                Évaluer le trajet
              </Button>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button variant="info" fullWidth onClick={onSearchAgain}>
                  Nouveau trajet
                </Button>
                <Button variant="secondary" fullWidth onClick={onClose}>
                  Retour
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
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={status !== "searching"}>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{statusConfig.title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{statusConfig.description}</p>
        </div>

        {status === "searching" && renderSearching()}
        {(status === "driver_found" || status === "approaching") && renderDriverFound()}
        {status !== "searching" && status !== "driver_found" && status !== "approaching" && renderOtherStatuses()}
      </div>
    </Modal>
  );
});

export default TripStatusModal;

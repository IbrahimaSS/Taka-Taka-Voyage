// TripConfirmationModal.jsx - Version finale corrigée
import React, { useMemo, useState, useEffect } from "react";
import { MapPin, Flag, Radar, Clock, Car, Check, CreditCard, Calendar } from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../admin/ui/Modal";
import Button from "../admin/ui/Bttn";
import Card, { CardHeader, CardTitle, CardContent } from "../admin/ui/Card";
import Badge from "../admin/ui/Badge";

import PaymentModal from "./PaymentModal";

const TripConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  tripDetails = {},
  user,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState("taxi");
  const [tripType, setTripType] = useState("now"); // now | schedule
  const [paymentTime, setPaymentTime] = useState("advance"); // advance | end
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const [showPayment, setShowPayment] = useState(false);
  const [pendingTripData, setPendingTripData] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setShowPayment(false);
      setPendingTripData(null);
      setIsConfirming(false);
      setScheduleDate("");
      setScheduleTime("");
      setTripType("now");
      setPaymentTime("advance");
      setSelectedVehicle("taxi");
    }
  }, [isOpen]);

  const vehicles = useMemo(
    () => [
      {
        id: "moto",
        name: "Moto-taxi",
        icon: Car,
        price: 5000,
        description: "Idéal pour les trajets courts",
        features: ["Arrivée rapide", "Économique"],
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
      },
      {
        id: "taxi",
        name: "Taxi partagé",
        icon: Car,
        price: tripDetails?.estimatedPrice || 15000,
        description: "Confort et sécurité",
        features: ["Bagages inclus", "Climatisation"],
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
      },
      {
        id: "voiture",
        name: "Voiture privée",
        icon: Car,
        price: 25000,
        description: "Luxe et confort",
        features: ["Wifi", "Eau offerte"],
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
      },
    ],
    [tripDetails?.estimatedPrice]
  );

  const selectedVehicleData = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicle),
    [vehicles, selectedVehicle]
  );

  const basePrice = Number(selectedVehicleData?.price) || 15000;
  const serviceFee = 500;
  const totalPrice = basePrice + serviceFee;

  const today = new Date().toISOString().split("T")[0];

  const buildTripData = () => ({
    ...tripDetails,
    vehicle: selectedVehicleData,
    vehicleType: selectedVehicle,
    tripType,
    paymentTime,
    scheduleDate: tripType === "schedule" ? scheduleDate : null,
    scheduleTime: tripType === "schedule" ? scheduleTime : null,
    price: totalPrice,
    confirmedAt: new Date().toISOString(),
  });

  const handleConfirm = async () => {
    if (tripType === "schedule" && (!scheduleDate || !scheduleTime)) {
      toast.error("Veuillez choisir une date et une heure");
      return;
    }

    const tripData = buildTripData();

    // ✅ Paiement anticipé : IMMEDIATE OU PLANIFIEE
    if (paymentTime === "advance") {
      setPendingTripData(tripData);
      setShowPayment(true);
      return;
    }

    // ✅ Paiement à la fin => on confirme directement
    setIsConfirming(true);
    try {
      await onConfirm?.(tripData, null);
      onClose?.();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de la confirmation du trajet";
      toast.error(message);
    } finally {
      setIsConfirming(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    if (!pendingTripData) return;

    setIsConfirming(true);
    try {
      await onConfirm?.(pendingTripData, paymentResult);

      if (pendingTripData.tripType === "now") {
        toast.success("Paiement validé, recherche de chauffeur...");
      } else {
        toast.success("Paiement validé, course planifiée !");
      }

      setShowPayment(false);
      setPendingTripData(null);
      onClose?.();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Paiement OK mais erreur lors de la création de la course";
      toast.error(message);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <>
      {/* ✅ On masque TripConfirmationModal quand PaymentModal est ouvert */}
      <Modal
        isOpen={isOpen && !showPayment}
        onClose={onClose}
        size="xl"
        closeOnOverlayClick={false}
      >
        <div className="space-y-8">
          {/* En-tête */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Confirmer votre trajet
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Vérifiez les détails avant de continuer
                </p>
              </div>
            </div>
          </div>

          {/* Itinéraire */}
          <Card hoverable={false} className="bg-transparent border-none shadow-none p-0">
            <CardHeader className="p-0">
              <CardTitle size="md">Itinéraire</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                      <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Départ</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {tripDetails?.pickup || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                      <Flag className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Destination</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {tripDetails?.destination || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                      <Radar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Distance</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {tripDetails?.estimatedDistance || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Durée estimée</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {tripDetails?.estimatedDuration || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Type de course */}
          <Card hoverable={false} className="bg-transparent border-none shadow-none p-0">
            <CardHeader className="p-0">
              <CardTitle size="md">Type de course</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTripType("now")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tripType === "now"
                      ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-400"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <Clock className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Maintenant
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTripType("schedule")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tripType === "schedule"
                      ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-400"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Planifier
                    </span>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Planification */}
          {tripType === "schedule" && (
            <Card hoverable={false} className="bg-transparent border-none shadow-none p-0">
              <CardContent className="p-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={today}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Heure
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Moment du paiement */}
          <Card hoverable={false} className="bg-transparent border-none shadow-none p-0">
            <CardHeader className="p-0">
              <CardTitle size="md">Moment du paiement</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentTime("advance")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentTime === "advance"
                      ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-400"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <CreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Paiement anticipé
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Payer maintenant
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTime("end")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentTime === "end"
                      ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-400"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Paiement à la fin
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Payer après le trajet
                    </span>
                  </div>
                </button>
              </div>

              {tripType === "schedule" && paymentTime === "advance" && (
                <div className="mt-3 text-sm text-amber-700 dark:text-amber-300">
                  ⚠️ Pour une course planifiée, tu peux soit débiter maintenant, soit réserver sans payer.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Véhicule */}
          <Card hoverable={false} className="bg-transparent border-none shadow-none p-0">
            <CardHeader className="p-0">
              <CardTitle size="md">Choisissez votre véhicule</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vehicles.map((vehicle) => {
                  const Icon = vehicle.icon;
                  const isSelected = selectedVehicle === vehicle.id;

                  return (
                    <button
                      type="button"
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle.id)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-green-500 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-900/10 dark:to-blue-900/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-400"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`w-20 h-20 rounded-full ${vehicle.bgColor} flex items-center justify-center mb-4 ${
                            isSelected
                              ? "ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900"
                              : ""
                          }`}
                        >
                          <Icon className={`w-10 h-10 ${vehicle.color}`} />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                          {vehicle.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {vehicle.description}
                        </p>
                        <div className="text-green-600 dark:text-green-400 font-bold text-xl mb-3">
                          {Number(vehicle.price).toLocaleString()} GNF
                        </div>
                        <div className="space-y-1 mb-3">
                          {vehicle.features.map((feature, idx) => (
                            <p key={idx} className="text-xs text-gray-500 dark:text-gray-400">
                              {feature}
                            </p>
                          ))}
                        </div>
                        {isSelected && (
                          <div className="mt-2">
                            <Badge variant="success" size="sm">
                              <Check className="w-3 h-3 mr-1" />
                              Sélectionné
                            </Badge>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Prix */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <CardHeader>
              <CardTitle size="md">Récapitulatif du prix</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">Prix estimé pour votre trajet</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Prix de base</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {basePrice.toLocaleString()} GNF
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Frais de service</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    + {serviceFee.toLocaleString()} GNF
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-lg">
                  <span className="text-gray-900 dark:text-gray-100">Total</span>
                  <span className="text-green-700 dark:text-green-500">
                    {totalPrice.toLocaleString()} GNF
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button variant="secondary" fullWidth onClick={onClose} className="sm:flex-1">
              Modifier le trajet
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleConfirm}
              loading={isConfirming}
              icon={Car}
              className="sm:flex-1"
            >
              {paymentTime === "advance" ? "Continuer vers paiement" : "Confirmer et chercher un chauffeur"}
            </Button>
          </div>
        </div>
      </Modal>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => {
          if (!isConfirming) setShowPayment(false);
        }}
        onSuccess={handlePaymentSuccess}
        amount={totalPrice}
        tripDetails={pendingTripData || tripDetails}
        user={user}
      />
    </>
  );
};

export default TripConfirmationModal;

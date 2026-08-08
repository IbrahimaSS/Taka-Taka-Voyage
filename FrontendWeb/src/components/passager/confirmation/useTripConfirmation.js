import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Car, Bike, Package } from 'lucide-react';
import { platformService } from '../../../services/platformService';

// Mapping icon string → composant Lucide
const ICON_MAP = {
  bike: Bike,
  car: Car,
  package: Package,
};

// Mapping couleur → classes Tailwind
const COLOR_MAP = {
  blue: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  green: {
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  purple: {
    text: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  orange: {
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  gray: {
    text: "text-gray-400 dark:text-gray-500",
    bg: "bg-gray-100 dark:bg-gray-800",
  },
};

export const useTripConfirmation = ({ isOpen, tripDetails, onConfirm, onClose }) => {
  const { t } = useTranslation();

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [tripType, setTripType] = useState("now"); // now | schedule
  const [paymentTime, setPaymentTime] = useState("advance"); // advance | end
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const [showPayment, setShowPayment] = useState(false);
  const [pendingTripData, setPendingTripData] = useState(null);

  // ── Services chargés depuis l'API admin ──
  const [platformServices, setPlatformServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Charger les services au montage du modal
  useEffect(() => {
    if (isOpen && platformServices.length === 0) {
      setLoadingServices(true);
      platformService
        .getServicesActifs()
        .then((res) => {
          if (res.data?.success && res.data.services) {
            setPlatformServices(res.data.services);
            // Sélectionner automatiquement le premier service actif
            const firstEnabled = res.data.services.find((s) => s.enabled);
            if (firstEnabled) {
              setSelectedVehicle(firstEnabled.frontendKey);
            }
          }
        })
        .catch((err) => {
          console.error("Erreur chargement services:", err);
          toast.error(t('confirmation.error_loading_services'));
        })
        .finally(() => setLoadingServices(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setShowPayment(false);
      setPendingTripData(null);
      setIsConfirming(false);
      setScheduleDate("");
      setScheduleTime("");
      setTripType("now");
      setPaymentTime("advance");
      // On ne reset pas selectedVehicle ni platformServices pour le cache
    }
  }, [isOpen]);

  // Transformer les services API en format véhicules pour l'affichage
  const vehicles = useMemo(() => {
    return platformServices.map((svc) => {
      const distanceKm = parseFloat(tripDetails?.estimatedDistance) || 5;
      const durationMin = parseInt(tripDetails?.estimatedDuration) || 15;

      // Calcul du prix dynamique basé sur les tarifs admin
      const calculatedPrice =
        svc.pricing.basePrice +
        distanceKm * svc.pricing.perKm +
        durationMin * svc.pricing.perMinute;

      const finalPrice = Math.max(
        Math.round(calculatedPrice),
        svc.pricing.minimumFare || 0
      );

      return {
        id: svc.frontendKey,
        serviceId: svc.id,
        name: svc.name,
        icon: ICON_MAP[svc.icon] || Car,
        price: finalPrice,
        description: svc.description,
        features: svc.features || [],
        color: COLOR_MAP[svc.color] || COLOR_MAP.gray,
        enabled: svc.enabled,
        pricing: svc.pricing,
      };
    });
  }, [platformServices, tripDetails?.estimatedDistance, tripDetails?.estimatedDuration]);

  const selectedVehicleData = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicle),
    [vehicles, selectedVehicle]
  );

  const basePrice = Number(selectedVehicleData?.price) || 0;
  const serviceFee = 500;
  const totalPrice = basePrice + serviceFee;

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
      toast.error(t('confirmation.error_schedule_fields'));
      return;
    }

    if (!selectedVehicleData?.enabled) {
      toast.error(t('confirmation.service_disabled'));
      return;
    }

    const tripData = buildTripData();

    // Paiement anticipé : IMMEDIATE OU PLANIFIEE
    if (paymentTime === "advance") {
      setPendingTripData(tripData);
      setShowPayment(true);
      return;
    }

    // Paiement à la fin => on confirme directement
    setIsConfirming(true);
    try {
      await onConfirm?.(tripData, null);
      onClose?.();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t('confirmation.error_confirming');
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
        toast.success(t('confirmation.pay_success_searching'));
      } else {
        toast.success(t('confirmation.pay_success_scheduled'));
      }

      setShowPayment(false);
      setPendingTripData(null);
      onClose?.();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t('confirmation.error_creating');
      toast.error(message);
    } finally {
      setIsConfirming(false);
    }
  };

  return {
    selectedVehicle, setSelectedVehicle,
    tripType, setTripType,
    paymentTime, setPaymentTime,
    scheduleDate, setScheduleDate,
    scheduleTime, setScheduleTime,
    isConfirming,
    showPayment, setShowPayment,
    pendingTripData,
    vehicles, loadingServices,
    selectedVehicleData,
    basePrice, serviceFee, totalPrice,
    handleConfirm,
    handlePaymentSuccess,
  };
};

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PaymentService } from '../../../services/paymentService';
import { useSettings } from '../../../context/SettingsContext';
import AppLogo from '../../../assets/logo.jpeg';
import MtnLogo from '../../../assets/mtn_logo.png';
import CardLogo from '../../../assets/card_logo.png';

export const usePaymentModal = ({ isOpen, amount, user, tripDetails, onSuccess }) => {
  const { settings } = useSettings();
  const [selectedMethod, setSelectedMethod] = useState("orange_money");
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.telephone || user?.phone || "");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [walletBalance, setWalletBalance] = useState(null);

  const userId = user?.id || user?._id;

  const paymentMethods = useMemo(() => {
    const methods = settings?.payments?.methods || {};

    return [
      {
        id: "orange_money",
        name: "Orange Money",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/120px-Orange_logo.svg.png",
        color: "text-orange-600",
        description: "Paiement instantané",
        enabled: methods.orangeMoney?.enabled ?? true
      },
      {
        id: "mtn_money",
        name: "MTN Mobile Money",
        image: MtnLogo,
        color: "text-yellow-600",
        description: "Paiement instantané",
        enabled: methods.mtnMoney?.enabled ?? true
      },
      {
        id: "wallet",
        name: "Portefeuille TakaTaka",
        image: AppLogo,
        color: "text-green-600",
        description: walletBalance !== null ? `${walletBalance.toLocaleString()} GNF disponibles` : "Chargement...",
        enabled: true
      },
      {
        id: "card",
        name: "Carte bancaire",
        image: CardLogo,
        color: "text-indigo-600",
        description: "Visa / Mastercard",
        enabled: methods.stripe?.enabled ?? true
      },
      {
        id: "cash",
        name: "Espèces",
        image: "https://cdn-icons-png.flaticon.com/512/261/261906.png",
        color: "text-emerald-600",
        description: "Payer au chauffeur",
        enabled: methods.cash?.enabled ?? true
      },
    ];
  }, [settings, walletBalance]);

  // Sélection automatique d'une méthode activée si celle par défaut est inactive
  useEffect(() => {
    if (isOpen && settings?.payments?.methods) {
      const currentMethodData = paymentMethods.find(m => m.id === selectedMethod);
      if (currentMethodData && !currentMethodData.enabled) {
        const firstEnabled = paymentMethods.find(m => m.enabled);
        if (firstEnabled) setSelectedMethod(firstEnabled.id);
      }
    }
  }, [isOpen, settings, paymentMethods, selectedMethod]);

  // Reset
  useEffect(() => {
    if (!isOpen) return;

    setIsProcessing(false);
    setWalletBalance(null);
    setPhoneNumber(user?.telephone || user?.phone || "");
    setCardDetails({ number: "", expiry: "", cvv: "", name: "" });
  }, [isOpen, user?.telephone, user?.phone]);

  // Charger le solde du wallet dès l'ouverture pour l'injecter dans la méthode de paiement
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        const balance = await PaymentService.checkWalletBalance();
        setWalletBalance(Number(balance?.balance ?? 0));
      } catch (e) {
        setWalletBalance(null);
        console.error("Erreur solde wallet:", e);
      }
    })();
  }, [isOpen]);

  const validatePhoneNumber = (number) => {
    const guineanRegex = /^(?:\+224|0)?[6-7]\d{8}$/;
    return guineanRegex.test(String(number || "").replace(/\s/g, ""));
  };

  const validateCard = () => {
    if (String(cardDetails.number || "").length !== 16) return false;
    if (!String(cardDetails.expiry || "").match(/^\d{2}\/\d{2}$/)) return false;
    if (String(cardDetails.cvv || "").length !== 3) return false;
    return true;
  };

  const canPay =
    !isProcessing &&
    amount > 0 &&
    (
      (selectedMethod === "wallet" && walletBalance != null && walletBalance >= amount) ||
      ((selectedMethod === "orange_money" || selectedMethod === "mtn_money") && validatePhoneNumber(phoneNumber)) ||
      (selectedMethod === "card" && validateCard())
    );

  const handlePayment = async () => {
    if (!canPay) return;
    setIsProcessing(true);

    try {
      let result;

      if (selectedMethod === "orange_money" || selectedMethod === "mtn_money") {
        result = await PaymentService.processMobileMoneyPayment(
          amount,
          phoneNumber,
          selectedMethod === "orange_money" ? "ORANGE" : "MTN"
        );
      }

      if (selectedMethod === "wallet") {
        if (!userId) throw new Error("Utilisateur non identifié");
        const balance = await PaymentService.checkWalletBalance(userId);
        const current = Number(balance?.balance ?? 0);
        setWalletBalance(current);

        if (current < amount) throw new Error("Solde insuffisant");
        result = await PaymentService.debitWallet(userId, amount);
      }

      if (selectedMethod === "card") {
        if (!validateCard()) throw new Error("Informations carte incomplètes");
        result = await PaymentService.processCardPayment(amount, cardDetails);
      }

      if (result?.success) {
        toast.success("Paiement effectué avec succès !");
        onSuccess?.({
          ...result,
          paymentMethod: selectedMethod,
          tripId: tripDetails?.id,
        });
        return;
      }

      throw new Error(result?.message || "Paiement non confirmé");
    } catch (error) {
      toast.error(error?.message || "Erreur lors du paiement");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    selectedMethod, setSelectedMethod,
    isProcessing,
    phoneNumber, setPhoneNumber,
    cardDetails, setCardDetails,
    walletBalance,
    paymentMethods,
    validatePhoneNumber,
    canPay,
    handlePayment,
  };
};

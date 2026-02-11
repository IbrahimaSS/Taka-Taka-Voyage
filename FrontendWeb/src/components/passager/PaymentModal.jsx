// PaymentModal.jsx - Version finale corrigée (_id + telephone/phone)
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, Smartphone, CreditCard, Wallet, Loader, Shield, Lock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { PaymentService } from "../../services/paymentService";

const PaymentModal = ({ isOpen, onClose, onSuccess, amount = 0, tripDetails, user }) => {
  const [selectedMethod, setSelectedMethod] = useState("orange_money");
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.telephone || user?.phone || "");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [walletBalance, setWalletBalance] = useState(null);

  const userId = user?._id; // ✅ Mongo

  const paymentMethods = useMemo(
    () => [
      { id: "orange_money", name: "Orange Money", icon: Smartphone, color: "text-orange-600", description: "Paiement instantané" },
      { id: "mtn_money", name: "MTN Mobile Money", icon: Smartphone, color: "text-yellow-600", description: "Paiement instantané" },
      { id: "wallet", name: "Portefeuille TakaTaka", icon: Wallet, color: "text-green-600", description: "Solde disponible" },
      { id: "card", name: "Carte bancaire", icon: CreditCard, color: "text-indigo-600", description: "Visa / Mastercard" },
    ],
    []
  );

  // Reset
  useEffect(() => {
    if (!isOpen) return;

    setIsProcessing(false);
    setWalletBalance(null);
    setPhoneNumber(user?.telephone || user?.phone || "");
    setCardDetails({ number: "", expiry: "", cvv: "", name: "" });
  }, [isOpen, user?.telephone, user?.phone]);

  // Charger wallet quand on choisit wallet
  useEffect(() => {
    if (!isOpen) return;
    if (selectedMethod !== "wallet") return;
    if (!userId) return;

    (async () => {
      try {
        const balance = await PaymentService.checkWalletBalance(userId);
        setWalletBalance(Number(balance?.balance ?? 0));
      } catch (e) {
        setWalletBalance(null);
        toast.error("Impossible de charger le solde portefeuille");
      }
    })();
  }, [selectedMethod, userId, isOpen]);

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

  const renderPaymentForm = () => {
    if (selectedMethod === "orange_money" || selectedMethod === "mtn_money") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Ex: +224 623 09 07 41"
              className="passenger-input w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              disabled={isProcessing}
            />
            {phoneNumber && !validatePhoneNumber(phoneNumber) && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Format de numéro invalide
              </p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 Vous recevrez une demande de confirmation sur votre téléphone. Entrez votre code PIN pour confirmer.
            </p>
          </div>
        </div>
      );
    }

    if (selectedMethod === "card") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Numéro de carte
            </label>
            <input
              type="text"
              value={cardDetails.number}
              onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, "").slice(0, 16) })}
              placeholder="1234 5678 9012 3456"
              maxLength={16}
              className="passenger-input w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date d'expiration
              </label>
              <input
                type="text"
                value={cardDetails.expiry}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "").slice(0, 4);
                  if (value.length >= 2) value = value.slice(0, 2) + "/" + value.slice(2, 4);
                  setCardDetails({ ...cardDetails, expiry: value });
                }}
                placeholder="MM/AA"
                maxLength={5}
                className="passenger-input w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CVV
              </label>
              <input
                type="text"
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                placeholder="123"
                maxLength={3}
                className="passenger-input w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom sur la carte
            </label>
            <input
              type="text"
              value={cardDetails.name}
              onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
              placeholder="John Doe"
              className="passenger-input w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              disabled={isProcessing}
            />
          </div>
        </div>
      );
    }

    if (selectedMethod === "wallet") {
      return (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl text-center border border-green-100 dark:border-green-800/30">
            <Wallet className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {(walletBalance ?? 0).toLocaleString()} GNF
            </p>
            <p className="text-gray-600 dark:text-gray-400">Solde disponible</p>
          </div>

          {walletBalance != null && walletBalance < amount && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800/30">
              <p className="text-red-700 dark:text-red-400 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Solde insuffisant. Rechargez ou choisissez un autre moyen.
              </p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="passenger-glass dark:bg-gray-900/95 max-w-md w-full max-h-[90vh] rounded-2xl overflow-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Paiement sécurisé</h2>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center disabled:opacity-50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 mb-6 border border-green-100 dark:border-green-800/30">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Montant à payer</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-500 my-2">
                {Number(amount).toLocaleString()} GNF
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pour votre trajet vers {tripDetails?.destination || "—"}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Choisissez votre moyen de paiement
            </label>

            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const active = selectedMethod === method.id;

                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    disabled={isProcessing}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      active
                        ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30"
                        : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-400"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex flex-col items-center">
                      <Icon className={`w-6 h-6 ${method.color} mb-2`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{method.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{method.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {renderPaymentForm()}

          <button
            onClick={handlePayment}
            disabled={!canPay}
            className="w-full passenger-btn-primary py-3 mt-6 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Payer {Number(amount).toLocaleString()} GNF
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center">
              <Shield className="w-4 h-4 mr-1" />
              Paiement 100% sécurisé • Données cryptées
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;

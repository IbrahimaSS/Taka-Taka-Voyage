// PaymentModal.jsx - Version finale corrigée (_id + telephone/phone)
import { motion } from "framer-motion";
import { X, Shield } from "lucide-react";

import { usePaymentModal } from "./paymentModal/usePaymentModal";
import PaymentMethodGrid from "./paymentModal/PaymentMethodGrid";
import PaymentMethodForm from "./paymentModal/PaymentMethodForm";
import PaymentActionButton from "./paymentModal/PaymentActionButton";

const PaymentModal = ({ isOpen, onClose, onSuccess, amount = 0, tripDetails, user }) => {
  const {
    selectedMethod, setSelectedMethod,
    isProcessing,
    phoneNumber, setPhoneNumber,
    cardDetails, setCardDetails,
    walletBalance,
    paymentMethods,
    validatePhoneNumber,
    canPay,
    handlePayment,
  } = usePaymentModal({ isOpen, amount, user, tripDetails, onSuccess });

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
              className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center disabled:opacity-50 transition-colors"
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

          <PaymentMethodGrid
            paymentMethods={paymentMethods}
            selectedMethod={selectedMethod}
            onSelect={setSelectedMethod}
            isProcessing={isProcessing}
          />

          <PaymentMethodForm
            selectedMethod={selectedMethod}
            isProcessing={isProcessing}
            phoneNumber={phoneNumber}
            onPhoneNumberChange={setPhoneNumber}
            validatePhoneNumber={validatePhoneNumber}
            cardDetails={cardDetails}
            onCardDetailsChange={setCardDetails}
            walletBalance={walletBalance}
            amount={amount}
          />

          <PaymentActionButton
            selectedMethod={selectedMethod}
            walletBalance={walletBalance}
            amount={amount}
            canPay={canPay}
            isProcessing={isProcessing}
            onClose={onClose}
            onPay={handlePayment}
          />

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

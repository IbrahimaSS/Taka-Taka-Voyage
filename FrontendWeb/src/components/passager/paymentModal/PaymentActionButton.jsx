import { Wallet, Loader, Lock } from 'lucide-react';

const PaymentActionButton = ({ selectedMethod, walletBalance, amount, canPay, isProcessing, onClose, onPay }) => {
  const needsRecharge = selectedMethod === "wallet" && walletBalance != null && walletBalance < amount;

  if (needsRecharge) {
    return (
      <button
        onClick={() => {
          onClose();
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('navigate-to-wallet'));
          }
        }}
        className="w-full passenger-btn-primary py-3 mt-6 flex items-center justify-center shadow-lg"
      >
        <Wallet className="w-5 h-5 mr-2" />
        Recharger mon compte
      </button>
    );
  }

  return (
    <button
      onClick={onPay}
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
  );
};

export default PaymentActionButton;

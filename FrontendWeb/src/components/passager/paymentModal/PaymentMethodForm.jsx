import { AlertCircle, Wallet } from 'lucide-react';

const PaymentMethodForm = ({
  selectedMethod, isProcessing,
  phoneNumber, onPhoneNumberChange, validatePhoneNumber,
  cardDetails, onCardDetailsChange,
  walletBalance, amount,
}) => {
  if (selectedMethod === "orange_money" || selectedMethod === "mtn_money") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Numéro de téléphone
          </label>
          <input
            type="tel"
            inputMode="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
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
            inputMode="numeric"
            value={cardDetails.number}
            onChange={(e) => onCardDetailsChange({ ...cardDetails, number: e.target.value.replace(/\D/g, "").slice(0, 16) })}
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
              inputMode="numeric"
              value={cardDetails.expiry}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "").slice(0, 4);
                if (value.length >= 2) value = value.slice(0, 2) + "/" + value.slice(2, 4);
                onCardDetailsChange({ ...cardDetails, expiry: value });
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
              inputMode="numeric"
              value={cardDetails.cvv}
              onChange={(e) => onCardDetailsChange({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
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
            onChange={(e) => onCardDetailsChange({ ...cardDetails, name: e.target.value })}
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
          <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg border border-rose-100 dark:border-rose-800/30 text-center mt-4">
            <p className="text-rose-700 dark:text-rose-400 text-sm flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4 mr-2" />
              Vous avez besoin de {(amount - walletBalance).toLocaleString()} GNF supplémentaires.
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default PaymentMethodForm;

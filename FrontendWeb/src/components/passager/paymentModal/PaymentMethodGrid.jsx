import { Smartphone } from 'lucide-react';

const PaymentMethodGrid = ({ paymentMethods, selectedMethod, onSelect, isProcessing }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Choisissez votre moyen de paiement
      </label>

      <div className="grid grid-cols-2 gap-3">
        {paymentMethods.map((method) => {
          const active = selectedMethod === method.id;
          const isDisabled = !method.enabled;
          const Icon = method.icon;

          return (
            <button
              key={method.id}
              onClick={() => !isDisabled && onSelect(method.id)}
              disabled={isProcessing || (isDisabled && !active)}
              className={`relative p-3 rounded-xl border-2 transition-all ${isDisabled
                ? "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-700/30 opacity-60 grayscale cursor-not-allowed"
                : active
                  ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 shadow-md ring-2 ring-green-500/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-400"
                } disabled:opacity-50 transition-all duration-300`}
            >
              {isDisabled && (
                <div className="absolute -top-1 -right-1 z-10">
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 uppercase">
                    Indisponible
                  </span>
                </div>
              )}
              <div className="flex flex-col items-center">
                {method.image ? (
                  <div className={`w-10 h-10 mb-2 flex items-center justify-center rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 ${isDisabled ? 'grayscale opacity-50' : ''}`}>
                    <img
                      src={method.image}
                      alt={method.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div style={{ display: 'none' }}>
                      <Smartphone className={`w-10 h-10 ${isDisabled ? 'text-gray-400' : method.color}`} />
                    </div>
                  </div>
                ) : (
                  <Icon className={`w-10 h-10 ${isDisabled ? 'text-gray-400 shadow-none' : method.color} mb-2 transition-colors`} />
                )}
                <span className={`text-sm font-bold text-center leading-tight ${isDisabled ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {method.name}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                  {method.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodGrid;

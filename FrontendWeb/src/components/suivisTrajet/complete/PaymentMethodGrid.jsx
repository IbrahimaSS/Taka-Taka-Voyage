import MtnLogo from '../../../assets/mtn_logo.png';

const PaymentMethodGrid = ({ selectedPayment, onSelect }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    {/* Espèces */}
    <button
      onClick={() => onSelect('cash')}
      className={`payment-option p-4 rounded-xl border-2 transition-all ${selectedPayment === 'cash' ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md ring-2 ring-green-500/20' : 'border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700'}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
          <img
            src="https://cdn-icons-png.flaticon.com/512/261/261906.png"
            alt="Espèces"
            className="w-full h-full object-cover"
          />
        </div>
        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1">Espèces</h4>
        <p className="text-[10px] text-gray-500 dark:text-gray-400">Paiement direct</p>
      </div>
    </button>

    {/* Orange Money */}
    <button
      onClick={() => onSelect('orange')}
      className={`payment-option p-4 rounded-xl border-2 transition-all ${selectedPayment === 'orange' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 shadow-md ring-2 ring-orange-500/20' : 'border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700'}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/120px-Orange_logo.svg.png"
            alt="Orange Money"
            className="w-full h-full object-cover"
          />
        </div>
        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1">Orange Money</h4>
        <p className="text-[10px] text-gray-500 dark:text-gray-400">Mobile Money</p>
      </div>
    </button>

    {/* MTN Money */}
    <button
      onClick={() => onSelect('mtn')}
      className={`payment-option p-4 rounded-xl border-2 transition-all ${selectedPayment === 'mtn' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 shadow-md ring-2 ring-yellow-500/20' : 'border-gray-200 dark:border-gray-800 hover:border-yellow-300 dark:hover:border-yellow-700'}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
          <img
            src={MtnLogo}
            alt="MTN Money"
            className="w-full h-full object-cover"
          />
        </div>
        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1">MTN Money</h4>
        <p className="text-[10px] text-gray-500 dark:text-gray-400">Mobile Money</p>
      </div>
    </button>
  </div>
);

export default PaymentMethodGrid;

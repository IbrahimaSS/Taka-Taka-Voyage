import { Banknote, CreditCard, Wallet } from 'lucide-react';

const MethodIcon = ({ method, className = "w-4 h-4" }) => {
  const iconClass = className.includes("w-") ? className : `w-6 h-6 ${className}`;
  const imgClass = `${className.includes("w-") ? className : "w-6 h-6"} object-contain rounded-md shadow-sm`;

  switch (method) {
    case 'orange':
      return (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Orange_Money_logo.svg/120px-Orange_Money_logo.svg.png"
          alt=""
          className={imgClass}
          onError={(e) => {
            e.target.src = "https://ui-avatars.com/api/?name=OM&background=FF7900&color=fff&font-size=0.5&bold=true";
            e.target.onerror = null;
          }}
        />
      );
    case 'mtn':
      return (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/MTN_Mobile_Money_Logo.svg/120px-MTN_Mobile_Money_Logo.svg.png"
          alt=""
          className={imgClass}
          onError={(e) => {
            e.target.src = "https://ui-avatars.com/api/?name=MTN&background=FFCC00&color=000&font-size=0.45&bold=true";
            e.target.onerror = null;
          }}
        />
      );
    case 'wave':
      return (
        <div className={`${imgClass} bg-[#1CB0F6] flex items-center justify-center`}>
          <span className="text-[10px] font-bold text-white">Wave</span>
        </div>
      );
    case 'cash':
      return (
        <div className={`${imgClass} bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800`}>
          <Banknote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        </div>
      );
    case 'card':
      return (
        <div className={`${imgClass} bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600`}>
          <CreditCard className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
        </div>
      );
    default:
      return <Wallet className={className} />;
  }
};

export default MethodIcon;

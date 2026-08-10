import { Wallet, CreditCard, Smartphone, Banknote } from 'lucide-react';

// Helper pour mapper les méthodes de paiement du backend
export const mapPaymentMethod = (backendMethod) => {
    if (!backendMethod) return "other";
    const method = backendMethod.toLowerCase();
    if (method.includes("espèce") || method.includes("cash")) return "cash";
    if (method.includes("orange")) return "orange";
    if (method.includes("mtn")) return "mtn";
    if (method.includes("mobile")) return "mobile";
    if (method.includes("carte")) return "card";
    return "other";
};

// Obtenir l'icône pour la méthode de paiement
export const getPaymentIcon = (method) => {
    const iconClass = "w-6 h-6 rounded-md object-contain shadow-sm flex-shrink-0";
    switch (method) {
        case 'orange':
            return (
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Orange_Money_logo.svg/120px-Orange_Money_logo.svg.png"
                    alt=""
                    className={iconClass}
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
                    className={iconClass}
                    onError={(e) => {
                        e.target.src = "https://ui-avatars.com/api/?name=MTN&background=FFCC00&color=000&font-size=0.45&bold=true";
                        e.target.onerror = null;
                    }}
                />
            );
        case 'cash':
            return (
                <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-sm border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
            );
        case 'mobile':
            return <Smartphone className="w-4 h-4" />;
        case 'card':
            return <CreditCard className="w-4 h-4" />;
        default:
            return <Wallet className="w-4 h-4" />;
    }
};

// Obtenir le libellé pour la méthode de paiement
export const getPaymentLabel = (method, t) => {
    switch (method) {
        case 'orange':
            return "Orange Money";
        case 'mtn':
            return "MTN Mobile Money";
        case 'cash':
            return t('revenues.cash');
        case 'mobile':
            return t('revenues.mobile');
        case 'card':
            return t('revenues.card');
        default:
            return t('revenues.other');
    }
};

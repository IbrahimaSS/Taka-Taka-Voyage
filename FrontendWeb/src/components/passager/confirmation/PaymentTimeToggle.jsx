import { useTranslation } from 'react-i18next';
import { CreditCard, Clock } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';

const PaymentTimeToggle = ({ paymentTime, onPaymentTimeChange, tripType }) => {
  const { t } = useTranslation();

  return (
    <Card hoverable={false} className="bg-transparent border-none shadow-none p-0">
      <CardHeader className="p-0">
        <CardTitle size="md">{t('confirmation.payment_time')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onPaymentTimeChange("advance")}
            className={`p-4 rounded-xl border-2 transition-all ${paymentTime === "advance"
              ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-400"
              }`}
          >
            <div className="flex flex-col items-center">
              <CreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Paiement Maintenant
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Payez d'avance pour un trajet sans stress
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onPaymentTimeChange("end")}
            className={`p-4 rounded-xl border-2 transition-all ${paymentTime === "end"
              ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-400"
              }`}
          >
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Paiement à la fin
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Payez en espèces ou mobile au chauffeur
              </span>
            </div>
          </button>
        </div>

        {tripType === "schedule" && paymentTime === "advance" && (
          <div className="mt-3 text-sm text-amber-700 dark:text-amber-300">
            {t('confirmation.schedule_warning')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentTimeToggle;

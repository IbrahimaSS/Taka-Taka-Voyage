import { motion } from 'framer-motion';
import { CreditCard, User } from 'lucide-react';

const CashPaymentInfo = ({ totalAmount, driverName }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-6 mb-6"
  >
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h4 className="font-bold text-gray-800 dark:text-gray-100">Paiement en espèces</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">Remettez le montant au chauffeur</p>
      </div>
    </div>

    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-900/30">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Montant à payer au chauffeur</p>
        <div className="text-4xl font-bold text-green-700 dark:text-green-500 mb-6">
          {totalAmount.toLocaleString()} GNF
        </div>
        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
          <User className="w-4 h-4" />
          <span>
            Chauffeur: <strong className="text-gray-900 dark:text-gray-100">{driverName}</strong>
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default CashPaymentInfo;

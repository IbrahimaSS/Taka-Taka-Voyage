import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';

const PaymentDetailsCard = ({ price, paymentMethod }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-6 border border-white/20 dark:border-white/5"
  >
    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Détails du paiement</h3>
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-gray-600 dark:text-gray-400">Prix estimé</span>
        <span className="font-bold text-gray-800 dark:text-gray-200">{price.estimated.toLocaleString()} GNF</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-600 dark:text-gray-400">Frais de service</span>
        <span className="font-bold text-green-600 dark:text-green-400">+ {price.serviceFee.toLocaleString()} GNF</span>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-800 dark:text-gray-100">Total</span>
          <span className="text-2xl font-bold text-green-700 dark:text-green-500">
            {price.total.toLocaleString()} GNF
          </span>
        </div>
      </div>
    </div>
    {paymentMethod && (
      <div className="mt-4 flex items-center justify-center">
        <Smartphone className="w-5 h-5 text-orange-500 mr-2" />
        <span className="text-sm text-gray-600 dark:text-gray-400">{paymentMethod}</span>
      </div>
    )}
  </motion.div>
);

export default PaymentDetailsCard;

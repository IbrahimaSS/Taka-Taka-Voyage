import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PaymentConfirmationBanner = ({ tripData }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 mb-8 shadow-lg shadow-green-100 dark:shadow-none"
    >
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Paiement confirmé !</h2>
        <p className="opacity-90 text-center">
          Votre paiement de <strong>{tripData?.amount || tripData?.prix || tripData?.price || '0'} GNF</strong> a été effectué avec succès
        </p>
      </div>
    </motion.div>
  );
};

export default PaymentConfirmationBanner;

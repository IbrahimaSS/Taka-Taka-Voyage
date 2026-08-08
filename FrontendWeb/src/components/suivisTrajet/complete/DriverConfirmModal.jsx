import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const DriverConfirmModal = ({ show, totalAmount, onConfirm, onCancel }) => (
  <AnimatePresence>
    {show && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800"
        >
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>

          <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Paiement non validé par le passager
          </h3>

          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Le passager n'a pas encore confirmé l'envoi du paiement sur son application.
            <br /><br />
            Confirmez-vous avoir reçu <strong>{totalAmount.toLocaleString()} GNF</strong> ?
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              Oui, j'ai reçu l'argent
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-4 rounded-2xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default DriverConfirmModal;

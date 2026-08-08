import { motion } from 'framer-motion';
import { Phone, Share2, QrCode, Flag } from 'lucide-react';

const QuickActionsCard = ({
  role,
  isTripEnded,
  onContactDriver,
  onShareTrip,
  onOpenScanner,
  onEndTrip,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-6 border border-white/20 dark:border-white/5"
  >
    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Actions rapides</h3>
    <div className="space-y-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContactDriver}
        className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-3"
      >
        <Phone className="w-5 h-5" />
        <span>{role === 'driver' ? 'Appeler le passager' : 'Appeler le chauffeur'}</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onShareTrip}
        className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-3"
      >
        <Share2 className="w-5 h-5" />
        <span>Partager le trajet</span>
      </motion.button>

      {role === 'driver' && !isTripEnded && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenScanner}
          className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
        >
          <QrCode className="w-5 h-5" />
          <span>Scanner le QR Code</span>
        </motion.button>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onEndTrip}
        disabled={isTripEnded}
        className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-3 ${isTripEnded ? 'bg-green-600' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'} text-white disabled:opacity-50`}
      >
        <Flag className="w-5 h-5" />
        <span>{isTripEnded ? 'Trajet terminé' : "J'arrive à destination"}</span>
      </motion.button>
    </div>
  </motion.div>
);

export default QuickActionsCard;

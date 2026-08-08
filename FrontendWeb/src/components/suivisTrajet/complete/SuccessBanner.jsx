import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const SuccessBanner = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center mb-10"
  >
    <div className="relative inline-block mb-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl shadow-green-500/20"
      >
        <Check className="w-12 h-12 text-white" />
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -inset-4 bg-green-500/10 rounded-[40px] -z-10"
      />
    </div>
    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Arrivé à destination !</h2>
    <p className="text-gray-600 dark:text-gray-400">Merci d'avoir choisi TakaTaka pour votre déplacement.</p>
  </motion.div>
);

export default SuccessBanner;

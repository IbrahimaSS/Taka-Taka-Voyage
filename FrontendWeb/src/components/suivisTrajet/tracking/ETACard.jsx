import { motion } from 'framer-motion';
import { Navigation } from 'lucide-react';

const ETACard = ({ estimatedArrival, formattedDuration, totalDistance, totalDuration }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg"
  >
    <div className="text-sm opacity-90 mb-1">ARRIVÉE ESTIMÉE</div>
    <div className="text-3xl font-bold mb-2">{estimatedArrival}</div>
    <div className="text-sm opacity-90">
      Dans <span className="font-bold">{formattedDuration || '-- min'}</span>
    </div>
    <div className="flex items-center mt-4 text-xs opacity-80">
      <Navigation className="w-3 h-3 mr-1" />
      <span>{totalDistance} km • {totalDuration} min</span>
    </div>
  </motion.div>
);

export default ETACard;

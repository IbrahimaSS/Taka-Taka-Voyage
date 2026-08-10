import { motion } from 'framer-motion';
import { Route, Clock, DollarSign } from 'lucide-react';
import { safeStr, safeNum } from './notificationHelpers';

const StatTile = ({ icon: Icon, label, value }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-2xl text-center"
  >
    <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">{label}</p>
    <p className="text-xl font-bold text-gray-900 dark:text-emerald-400 mt-1">{value}</p>
  </motion.div>
);

const TripStatsGrid = ({ currentRequest }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <StatTile
      icon={Route}
      label="Distance"
      value={currentRequest.distance != null ? `${safeNum(currentRequest.distance, 0).toFixed(1)} km` : "—"}
    />
    <StatTile
      icon={Clock}
      label="Durée"
      value={safeStr(currentRequest.estimatedTime)}
    />
    <StatTile
      icon={DollarSign}
      label="Gains estimés"
      value={`${safeNum(currentRequest.estimatedFare, 0).toLocaleString("fr-FR")} FG`}
    />
  </div>
);

export default TripStatsGrid;

import { motion } from 'framer-motion';
import { Star, History, ChevronRight, Car } from 'lucide-react';

const NextStepsCards = ({ onViewHistory, onNewBooking }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-8 border border-white/20 dark:border-white/5"
  >
    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">À faire ensuite</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Évaluation */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="font-bold text-gray-800 dark:text-gray-100">Évaluez le trajet</h4>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Partagez votre expérience pour aider à améliorer notre service
        </p>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
            />
          ))}
        </div>
      </div>

      {/* Historique */}
      <div
        onClick={onViewHistory}
        className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
            <History className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h4 className="font-bold text-gray-800 dark:text-gray-100">Consultez l'historique</h4>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Retrouvez tous vos trajets et reçus dans votre espace personnel
        </p>
        <div className="text-green-700 dark:text-green-400 font-medium hover:underline flex items-center">
          Voir mes trajets
          <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>

      {/* Nouvelle réservation */}
      <div
        onClick={onNewBooking}
        className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
            <Car className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h4 className="font-bold text-gray-800 dark:text-gray-100">Réservez à nouveau</h4>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Planifiez votre prochain déplacement en quelques secondes
        </p>
        <div className="text-purple-700 dark:text-purple-400 font-medium hover:underline flex items-center">
          Nouvelle réservation
          <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </div>
  </motion.div>
);

export default NextStepsCards;

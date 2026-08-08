import { motion } from 'framer-motion';
import { Gift, Award as Trophy, ChevronRight } from 'lucide-react';

const LoyaltyRewardCard = ({ tripData }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <div className="w-16 h-16 shrink-0 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
          <Gift className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Merci pour votre retour !
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Vous avez gagné{' '}
            <strong className="text-amber-600 dark:text-amber-400">{tripData.earnedPoints} points de fidélité</strong>{' '}
            pour cette évaluation.
          </p>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-800 shadow-sm">
              <span className="text-sm text-gray-500 dark:text-gray-400">Points cumulés</span>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <span className="font-bold text-gray-800 dark:text-gray-100">{tripData.loyaltyPoints} points</span>
              </div>
            </div>
            <button className="text-green-700 dark:text-green-400 font-medium hover:underline flex items-center justify-center sm:justify-start transition-colors">
              Voir les avantages
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoyaltyRewardCard;

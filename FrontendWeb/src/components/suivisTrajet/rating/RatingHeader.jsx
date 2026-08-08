import { motion } from 'framer-motion';
import { Car, ArrowLeft } from 'lucide-react';

const RatingHeader = ({ platform, onGoBack }) => {
  return (
    <nav className="glass-header shadow-sm sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="flex flex-wrap gap-4 justify-between items-center w-full mx-auto px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-12 h-12 shrink-0 bg-gradient-to-r from-green-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300">
            {platform.logo ? (
              <img src={platform.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Car className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-lg sm:text-2xl font-bold uppercase bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
              {platform.name || 'TakaTaka'}
            </span>
            <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">{platform.tagline || 'Évaluation du trajet'}</p>
          </div>
        </div>

        <motion.button
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGoBack}
          className="flex items-center space-x-2 sm:space-x-3 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour</span>
        </motion.button>
      </div>
    </nav>
  );
};

export default RatingHeader;

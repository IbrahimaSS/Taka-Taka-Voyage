import { motion } from 'framer-motion';
import { History, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NextStepsCard = () => {
  const navigate = useNavigate();

  const handleGoToHistory = () => navigate('/passenger/history');
  const handleNewTrip = () => navigate('/passenger/book');
  const handleGoToProfile = () => navigate('/passenger/profile');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-8 border border-white/20 dark:border-white/5 shadow-xl"
    >
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Que souhaitez-vous faire maintenant ?
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Historique */}
        <div
          onClick={handleGoToHistory}
          className="group cursor-pointer"
        >
          <div className="bg-gray-50 dark:bg-gray-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 rounded-xl p-6 transition-all duration-300 group-hover:-translate-y-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <History className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Historique</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Consultez tous vos trajets</p>
            </div>
          </div>
        </div>

        {/* Nouveau trajet */}
        <div
          onClick={handleNewTrip}
          className="group cursor-pointer"
        >
          <div className="bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 rounded-xl p-6 transition-all duration-300 group-hover:-translate-y-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Nouveau trajet</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Réservez un autre trajet</p>
            </div>
          </div>
        </div>

        {/* Mon profil */}
        <div
          onClick={handleGoToProfile}
          className="group cursor-pointer"
        >
          <div className="bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 rounded-xl p-6 transition-all duration-300 group-hover:-translate-y-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Mon profil</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gérez votre compte</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NextStepsCard;

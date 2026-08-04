import { User, Car, CheckCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../admin/ui/Bttn';

const StepUserType = ({ userType, onSelect, error, onNext, showToast }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choisissez votre profil</h2>
          <p className="text-gray-600 dark:text-gray-300">Sélectionnez le type de compte qui correspond à vos besoins</p>
        </div>
        <button
          type="button"
          onClick={() => showToast('Information', 'Choisissez entre passager (réserver des trajets) ou chauffeur (proposer des trajets)', 'info')}
          className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
        >
          <Info size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ">
        {/* Option Passager */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`option-card rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 border-2 ${userType === 'passenger'
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10'
            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
          onClick={() => onSelect('passenger')}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 flex items-center justify-center mb-4 mx-auto">
            <User className="text-blue-600 dark:text-blue-400 text-2xl" />
          </div>
          <h3 className={`text-lg font-bold text-center mb-3 ${userType === 'passenger' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>Passager</h3>
          <p className={`text-center text-sm mb-4 ${userType === 'passenger' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
            Voyagez facilement, rapidement et en toute sécurité
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <CheckCircle className="text-green-500 mr-2" size={14} />
              <span className={userType === 'passenger' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}>Réservation en 30 secondes</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="text-green-500 mr-2" size={14} />
              <span className={userType === 'passenger' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}>Support 24h/24</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="text-green-500 mr-2" size={14} />
              <span className={userType === 'passenger' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}>Paiement sécurisé</span>
            </div>
          </div>
        </motion.div>

        {/* Option Chauffeur */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`option-card rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 border-2 ${userType === 'driver'
            ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10'
            : 'border-gray-200 dark:border-gray-700 hover:border-green-300'}`}
          onClick={() => onSelect('driver')}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 flex items-center justify-center mb-4 mx-auto">
            <Car className="text-green-600 dark:text-green-400 text-2xl" />
          </div>
          <h3 className={`text-lg font-bold text-center mb-3 ${userType === 'driver' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>Chauffeur</h3>
          <p className={`text-center text-sm mb-4 ${userType === 'driver' ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
            Gagnez de l'argent en conduisant, gérez vos horaires librement
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <CheckCircle className="text-green-500 mr-2" size={14} />
              <span className={userType === 'driver' ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}>Revenus garantis</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="text-green-500 mr-2" size={14} />
              <span className={userType === 'driver' ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}>Horaires flexibles</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="text-green-500 mr-2" size={14} />
              <span className={userType === 'driver' ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}>Assistance technique</span>
            </div>
          </div>
        </motion.div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={16} />
            <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onNext}
          disabled={!userType}
          icon={ArrowRight}
          iconSize="medium"
        >
          Continuer
        </Button>
      </div>
    </>
  );
};

export default StepUserType;

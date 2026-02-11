import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, PartyPopper, Car, Star, Gift, Shield,
  ChevronRight, Download, Share2, Sparkles, Users,
  CreditCard, MapPin, Bell, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Bttn from '../admin/ui/Bttn';
import Modal from '../admin/ui/Modal';
import ConfirmModal from '../admin/ui/ConfirmModal';
import Toast from '../admin/ui/Toast';

const ValidationReussie = () => {
  const navigate = useNavigate();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleStart = () => {
    navigate('/chauffeur/dashboard');
  };

  const handleDownloadApp = () => {
    setShowDownloadModal(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'TakaTaka Driver',
        text: 'Je viens de rejoindre TakaTaka Driver ! Une plateforme géniale pour les chauffeurs.',
        url: window.location.href,
      });
    } else {
      showToast('Lien copié dans le presse-papier', 'success');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const steps = [
    { icon: Car, title: 'Configurez votre profil', description: 'Ajoutez votre photo et complétez vos préférences' },
    { icon: Star, title: 'Faites vos premiers trajets', description: 'Commencez à recevoir des demandes de course' },
    { icon: Gift, title: 'Gagnez des bonus', description: 'Profitez de nos programmes de fidélité' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl w-full"
      >
        {/* Carte principale */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50">
          {/* En-tête */}
          <div className="relative bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 p-8 text-white text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <PartyPopper className="w-full h-full" />
            </div>
            
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative z-10"
            >
              <div className="w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                <CheckCircle className="w-16 h-16" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Félicitations !</h1>
              <p className="text-xl opacity-90">Votre compte chauffeur est maintenant validé</p>
            </motion.div>
          </div>

          {/* Contenu */}
          <div className="p-8">
            {/* Message de bienvenue */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-700 dark:text-green-300">
                  Compte vérifié et sécurisé
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Bienvenue dans la communauté TakaTaka ! Vous êtes maintenant prêt à commencer à conduire.
              </p>
            </div>

            {/* Prochaines étapes */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Vos prochaines étapes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600"
                  >
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded-xl flex items-center justify-center">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-center mb-2">
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Avantages */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-6 mb-8">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-blue-500" />
                Vos avantages exclusifs
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 font-bold">0%</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Commission</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Les 7 premiers jours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">24/7</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Support</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Assistance prioritaire</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">★</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Bonus</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Premiers trajets</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">🚀</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Croissance</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Programme fidélité</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions principales */}
            <div className="space-y-4">
              <Bttn
                variant="perso"
                size="lg"
                onClick={handleStart}
                className="w-full"
              >
                <div className="flex items-center justify-center gap-3">
                  <span>Commencer à conduire</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Bttn>

              <div className="grid grid-cols-2 gap-4">
                <Bttn
                  variant="outline"
                  onClick={handleDownloadApp}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    <span>Télécharger l'app</span>
                  </div>
                </Bttn>

                <Bttn
                  variant="outline"
                  onClick={handleShare}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" />
                    <span>Partager</span>
                  </div>
                </Bttn>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                💡 <span className="font-medium">Conseil du jour :</span> Activez les notifications pour ne manquer aucune course
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Vous recevrez bientôt un email avec toutes les informations pour commencer
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400">
            🎉 Prêt à faire partie de la révolution de la mobilité en Afrique !
          </p>
        </motion.div>
      </motion.div>

      {/* Modal téléchargement app */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title="Télécharger l'application"
        size="md"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
              <Download className="text-white" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Application mobile TakaTaka
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Pour une expérience optimale, téléchargez notre application mobile
            </p>
          </div>

          <div className="space-y-4">
            <Bttn
              variant="perso"
              onClick={() => {
                showToast('Téléchargement Android démarré', 'success');
                setShowDownloadModal(false);
              }}
              className="w-full"
            >
              <div className="flex items-center justify-center gap-3">
                <span>Télécharger pour Android</span>
              </div>
            </Bttn>

            <Bttn
              variant="perso"
              onClick={() => {
                showToast('Téléchargement iOS démarré', 'success');
                setShowDownloadModal(false);
              }}
              className="w-full"
            >
              <div className="flex items-center justify-center gap-3">
                <span>Télécharger pour iOS</span>
              </div>
            </Bttn>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          title={toast.type === 'success' ? 'Succès' : 'Information'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ValidationReussie;
import React, { useState, useEffect } from 'react';
import { 
  Clock, Shield, Mail, Bell, CheckCircle, RefreshCw,
  MessageSquare, HelpCircle, Home, LogOut, AlertCircle,
  FileText, Car, User, Sparkles, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Bttn from '../admin/ui/Bttn';
import Modal from '../admin/ui/Modal';
import ConfirmModal from '../admin/ui/ConfirmModal';
import Toast from '../admin/ui/Toast';

const ValidationEnAttente = () => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Votre dossier est en cours d\'examen', time: 'Il y a 5 min', read: false },
    { id: 2, message: 'Documents reçus avec succès', time: 'Il y a 10 min', read: true },
  ]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return `${hours}h${remaining > 0 ? ` ${remaining}min` : ''}`;
  };

  const handleContactSupport = () => {
    setShowContactModal(true);
  };

  const handleCheckStatus = () => {
    setShowStatusModal(true);
  };

  const showToast = (title, message, type = 'success') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast({ show: false }), 4000);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    showToast('Notifications', 'Toutes les notifications marquées comme lues', 'success');
  };

  const steps = [
    { 
      step: 1, 
      title: 'Inscription complétée', 
      icon: CheckCircle,
      completed: true,
      description: 'Votre compte a été créé avec succès'
    },
    { 
      step: 2, 
      title: 'Vérification documents', 
      icon: Shield,
      completed: false,
      active: true,
      description: 'En cours de traitement par notre équipe'
    },
    { 
      step: 3, 
      title: 'Validation finale', 
      icon: Mail,
      completed: false,
      description: 'Notification par email et SMS'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 bg-gradient-to-br from-primary-50 to-secondary-100  dark:from-gray-800  dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        {/* Carte principale */}
        <div className="">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-8 text-white text-center w-full">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-full h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm"
            >
              <Shield size={48} />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Validation en cours</h1>
            <p className="opacity-90">Votre dossier est en cours d'examen par notre équipe</p>
          </div>

          {/* Contenu */}
          <div className="p-8">
            {/* Statut */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                  En attente depuis {formatTime(timeElapsed)}
                </span>
              </div>
            </div>

            {/* Étapes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {steps.map((step) => (
                <motion.div
                  key={step.step}
                  whileHover={{ y: -5 }}
                  className={`relative p-6 rounded-2xl border-2 ${step.active 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20' 
                    : step.completed 
                      ? 'border-green-200 bg-green-50 dark:bg-green-900/10' 
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : step.active 
                          ? 'bg-blue-100 dark:bg-blue-900/30 animate-pulse' 
                          : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {React.createElement(step.icon, {
                        className: `w-6 h-6 ${
                          step.completed ? 'text-green-500' :
                          step.active ? 'text-blue-500' : 'text-gray-400'
                        }`
                      })}
                    </div>
                    <div className="text-left">
                      <span className={`text-sm font-semibold ${
                        step.completed 
                          ? 'text-green-700 dark:text-green-400' 
                          : step.active 
                            ? 'text-blue-700 dark:text-blue-400' 
                            : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        Étape {step.step}
                      </span>
                      <h3 className={`font-bold ${
                        step.completed || step.active 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {step.active && (
                    <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                      <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                          initial={{ width: '30%' }}
                          animate={{ width: ['30%', '70%', '30%'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        En cours de traitement...
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Informations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Délais */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Délais de traitement</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Vérification initiale : 2-4 heures</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Validation complète : 24-48 heures</span>
                  </li>
                </ul>
              </div>

              {/* Notifications */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  {notifications.some(n => !n.read) && (
                    <Bttn
                      variant="outline"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Tout marquer lu
                    </Bttn>
                  )}
                </div>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg ${notif.read 
                        ? 'bg-white/50 dark:bg-gray-700/50' 
                        : 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {notif.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Bttn
                variant="primary"
                onClick={handleCheckStatus}
                icon={RefreshCw}
                iconSize="medium"
                className="flex-1 justify-center"
              >
                Vérifier le statut
              </Bttn>

              <Bttn
                variant="outline"
                onClick={handleContactSupport}
                icon={MessageSquare}
                iconSize="medium"
                className="flex-1 justify-center"
              >
                Contacter le support
              </Bttn>

              <Bttn
                variant="outline"
                onClick={() => navigate('/')}
                icon={Home}
                iconSize="medium"
                className="flex-1 justify-center"
              >
                Accueil
              </Bttn>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Besoin d'aide ? Contactez-nous à support@takataka.com
                </span>
              </div>
              <Bttn
                variant="ghost"
                size="sm"
                onClick={() => navigate('/connexion')}
                icon={LogOut}
                iconSize="default"
              >
                Se déconnecter
              </Bttn>
            </div>
          </div>
        </div>

        {/* Message d'attente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400">
            ⏳ Patientez pendant que nous vérifions vos informations. Vous recevrez une notification dès que votre compte sera validé.
          </p>
        </motion.div>
      </motion.div>

      {/* Modal de contact */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contactez le support"
        size="lg"
      >
        <div className="p-6">
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-blue-500 w-5 h-5" />
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">Support disponible 24/7</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Notre équipe est disponible pour vous aider
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-xl p-4 hover:border-blue-500 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="text-blue-500 w-5 h-5" />
                  <h5 className="font-medium text-gray-800 dark:text-white">Email</h5>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">support@takataka.com</p>
              </div>
              <div className="border rounded-xl p-4 hover:border-green-500 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="text-green-500 w-5 h-5" />
                  <h5 className="font-medium text-gray-800 dark:text-white">Téléphone</h5>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">+225 XX XX XX XX</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Votre message
              </label>
              <textarea
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                rows="4"
                placeholder="Décrivez votre problème..."
              />
            </div>

            <div className="flex justify-end gap-4">
              <Bttn
                variant="outline"
                onClick={() => setShowContactModal(false)}
              >
                Annuler
              </Bttn>
              <Bttn
                variant="primary"
                onClick={() => {
                  showToast('Support', 'Message envoyé au support', 'success');
                  setShowContactModal(false);
                }}
              >
                Envoyer le message
              </Bttn>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de statut */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Statut de validation"
        size="md"
      >
        <div className="p-6 text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mb-6">
            <Shield className="text-white" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Vérification en cours
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Votre dossier est actuellement examiné par notre équipe de validation.
            Cette opération peut prendre jusqu'à 48 heures.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-500 w-5 h-5" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Temps estimé : 24-48 heures
              </span>
            </div>
          </div>
          <Bttn
            variant="primary"
            onClick={() => setShowStatusModal(false)}
            className="w-full"
          >
            Compris
          </Bttn>
        </div>
      </Modal>

      {/* Toast */}
      {toast?.show && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false })}
        />
      )}
    </div>
  );
};

export default ValidationEnAttente;
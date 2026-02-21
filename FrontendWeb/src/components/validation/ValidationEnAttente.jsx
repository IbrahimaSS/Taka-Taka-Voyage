import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, Shield, Mail, Bell, CheckCircle, RefreshCw,
  MessageSquare, HelpCircle, Home, LogOut, AlertCircle,
  FileText, Car, User, Sparkles, X, PartyPopper, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Bttn from '../admin/ui/Bttn';
import Modal from '../admin/ui/Modal';
import ConfirmModal from '../admin/ui/ConfirmModal';
import Toast from '../admin/ui/Toast';
import { socketService } from '../../services/socketService';
import { chauffeurService } from '../../services/chauffeurService';

import { useAuth } from '../../context/AuthContext';

const ValidationEnAttente = () => {
  const { user } = useAuth();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Votre dossier est en cours d\'examen', time: 'Il y a 5 min', read: false },
    { id: 2, message: 'Documents reçus avec succès', time: 'Il y a 10 min', read: true },
  ]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null); // 'valide' | 'rejete' | null
  const [validationMessage, setValidationMessage] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const navigate = useNavigate();

  // Chrono d'attente
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // 🔌 Connexion Socket.IO pour écouter la validation/rejet en temps réel
  useEffect(() => {
    // Récupérer l'ID utilisateur via le contexte Auth ou localStorage en fallback
    const userId = user?._id || user?.id;
    let finalUserId = userId;
    let userData = user;

    if (!finalUserId) {
      try {
        const stored = localStorage.getItem('user') || localStorage.getItem('utilisateur') || localStorage.getItem('pendingDriver');
        if (stored) {
          const parsed = JSON.parse(stored);
          finalUserId = parsed._id || parsed.id;
          userData = parsed;
        }
      } catch (e) { /* ignore */ }
    }

    if (finalUserId) {
      console.log('🔌 [SOCKET] Tentative de connexion pour le chauffeur:', finalUserId);
      socketService.connect(finalUserId, 'CHAUFFEUR', userData?.prenom || '', userData?.nom || '');
    }

    // Écouter la validation
    const onValide = (data) => {
      console.log('🎉 [SOCKET] Chauffeur validé !', data);
      setValidationStatus('valide');
      setValidationMessage(data.message || 'Votre compte a été validé !');

      // Ajouter une notification avec action de redirection
      setNotifications(prev => [{
        id: Date.now(),
        message: '🎉 Votre compte a été validé ! Cliquez ici pour vous connecter maintenant.',
        time: 'Maintenant',
        read: false,
        type: 'success',
        action: () => navigate('/connexion')
      }, ...prev]);
    };

    // Écouter le rejet
    const onRejete = (data) => {
      console.log('❌ [SOCKET] Chauffeur rejeté', data);
      setValidationStatus('rejete');
      setValidationMessage(data.message || 'Votre demande a été rejetée.');

      setNotifications(prev => [{
        id: Date.now(),
        message: `❌ ${data.motif || 'Documents non conformes'}`,
        time: 'Maintenant',
        read: false,
      }, ...prev]);
    };

    socketService.on('chauffeur:valide', onValide);
    socketService.on('chauffeur:rejete', onRejete);

    return () => {
      socketService.off('chauffeur:valide', onValide);
      socketService.off('chauffeur:rejete', onRejete);
    };
  }, [user, navigate]);

  // 🔄 Polling de secours pour vérifier le statut via l'API (toutes les 15s)
  useEffect(() => {
    if (validationStatus === 'valide') return;

    const checkStatus = async () => {
      try {
        const res = await chauffeurService.getProfile();
        if (res.data.succes && res.data.chauffeur?.statut === 'ACTIF') {
          console.log('✅ [POLLING] Chauffeur validé détecté !');
          setValidationStatus('valide');
          setValidationMessage('Félicitations ! Votre compte a été validé par notre équipe.');
        }
      } catch (e) {
        // Silencieusement ignorer les erreurs 401/403 si pas encore totalement auth
      }
    };

    const interval = setInterval(checkStatus, 15000); // 15 secondes
    return () => clearInterval(interval);
  }, [validationStatus]);

  // Countdown + redirection auto quand validé
  useEffect(() => {
    if (validationStatus === 'valide') {
      setRedirectCountdown(8);
      const interval = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate('/connexion');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [validationStatus, navigate]);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return `${hours}h${remaining > 0 ? ` ${remaining}min` : ''}`;
  };

  const handleContactSupport = () => {
    setShowContactModal(true);
  };

  const handleCheckStatus = async () => {
    try {
      showToast('Vérification', 'Vérification de votre statut...', 'info');
      const res = await chauffeurService.getProfile();
      if (res.data.succes && res.data.chauffeur?.statut === 'ACTIF') {
        setValidationStatus('valide');
        setValidationMessage('Votre compte est déjà valide !');
      } else {
        setShowStatusModal(true);
      }
    } catch (e) {
      setShowStatusModal(true);
    }
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
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.completed
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : step.active
                        ? 'bg-blue-100 dark:bg-blue-900/30 animate-pulse'
                        : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                      {React.createElement(step.icon, {
                        className: `w-6 h-6 ${step.completed ? 'text-green-500' :
                          step.active ? 'text-blue-500' : 'text-gray-400'
                          }`
                      })}
                    </div>
                    <div className="text-left">
                      <span className={`text-sm font-semibold ${step.completed
                        ? 'text-green-700 dark:text-green-400'
                        : step.active
                          ? 'text-blue-700 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                        }`}>
                        Étape {step.step}
                      </span>
                      <h3 className={`font-bold ${step.completed || step.active
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
                      onClick={notif.action}
                      className={`p-3 rounded-lg ${notif.action ? 'cursor-pointer hover:translate-x-1 transition-all border-l-4' : ''} ${notif.read
                        ? 'bg-white/50 dark:bg-gray-700/50'
                        : notif.type === 'success'
                          ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                          : 'bg-blue-100 dark:bg-blue-900/30 border-blue-500'
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

      {/* 🎉 Overlay de validation/rejet en temps réel */}
      <AnimatePresence>
        {validationStatus === 'valide' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Bannière verte */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center relative overflow-hidden">
                {/* Confettis animés */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][i % 6],
                      left: `${Math.random() * 100}%`,
                      top: `-10px`,
                    }}
                    animate={{
                      y: [0, 300],
                      x: [0, (Math.random() - 0.5) * 100],
                      rotate: [0, Math.random() * 720],
                      opacity: [1, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}

                <motion.div
                  animate={{ rotate: [0, -15, 15, -15, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                  className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm"
                >
                  <CheckCircle size={40} />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Votre compte est validé ! 🎉</h2>
                <p className="opacity-90 text-sm">Vous faites maintenant partie de l'équipe TakaTaka</p>
              </div>

              {/* Contenu */}
              <div className="p-6 text-center">
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  {validationMessage}
                </p>

                {/* Countdown */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full">
                    <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Redirection dans {redirectCountdown} seconde{redirectCountdown > 1 ? 's' : ''}...
                    </span>
                  </div>
                </div>

                {/* Bouton de connexion */}
                <Bttn
                  variant="primary"
                  onClick={() => navigate('/connexion')}
                  className="w-full justify-center py-4 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Se connecter maintenant
                </Bttn>
              </div>
            </motion.div>
          </motion.div>
        )}

        {validationStatus === 'rejete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Bannière rouge */}
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-white text-center">
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                  <XCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Demande Rejetée</h2>
                <p className="opacity-90 text-sm">Votre dossier n'a pas été approuvé</p>
              </div>

              {/* Contenu */}
              <div className="p-6 text-center">
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  {validationMessage}
                </p>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6 text-left">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Vous pouvez corriger vos documents et resoumettre votre demande, ou contacter le support pour plus d'informations.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Bttn
                    variant="outline"
                    onClick={() => setShowContactModal(true)}
                    className="flex-1 justify-center"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contacter le support
                  </Bttn>
                  <Bttn
                    variant="primary"
                    onClick={() => {
                      setValidationStatus(null);
                      navigate('/');
                    }}
                    className="flex-1 justify-center"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Accueil
                  </Bttn>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
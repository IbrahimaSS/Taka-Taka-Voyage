// src/App.jsx - VERSION MODERNE COMPLÈTE
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Layout Components
import Sidebar from '../components/admin/layout/Sidebar';
import Header from '../components/admin/layout/Header';

// Section Components
import Dashboard from '../components/admin/sections/Dashboard';
import Users from '../components/admin/sections/Passagers';
import Drivers from '../components/admin/sections/Chauffeurs';
import Trips from '../components/admin/sections/Trajets';
import Payments from '../components/admin/sections/Payments';
import Validations from '../components/admin/sections/Validations';
import Disputes from '../components/admin/sections/Litiges';
import Documents from '../components/admin/sections/Documents';
import Reports from '../components/admin/sections/Reports';
import Commissions from '../components/admin/sections/Commissions';
import Settings from '../components/admin/sections/Settings';
import ActivityLogs from '../components/admin/sections/ActivityLogs';
import Coupons from '../components/admin/sections/Coupons';
import Transactions from '../components/admin/sections/Transactions';
import GarageVirtuel from '../components/admin/sections/GarageVirtuel';
import UserProfile from '../components/admin/profile/UserProfile';
import { useSettings } from '../context/SettingsContext';
import { useNotificationCenter, NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from '../context/NotificationContext';
import { socketService } from '../services/socketService';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Download, Mail, Send, Loader2 } from 'lucide-react';
import AdminButton from '../components/admin/ui/Bttn';
import { apiClient } from '../services/apiClient';




// UI Components
import Toast from '../components/admin/ui/Toast';
import Modal from '../components/admin/ui/Modale';

function AdminApp() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const platform = settings?.platform || {};
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [reportGeneratedData, setReportGeneratedData] = useState(null);
  const [newContactData, setNewContactData] = useState(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const location = useLocation();

  useEffect(() => {
    setCurrentDate(format(new Date(), 'EEEE d MMMM yyyy', { locale: fr }));

    const interval = setInterval(() => {
      setCurrentDate(format(new Date(), 'EEEE d MMMM yyyy', { locale: fr }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const { user } = useAuth();
  const { addNotification } = useNotificationCenter();


  // Real-time socket for Admin
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      console.log("🔌 [ADMIN] Connecting to socket system...");
      socketService.connect(userId, 'ADMIN', user.nom, user.prenom);

      const playNotificationSound = () => {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const now = audioCtx.currentTime;

          // Double bip audible (2 tonalités successives)
          const playTone = (freq, startTime, duration) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration);
          };

          // Bip 1 : 880 Hz pendant 0.15s
          playTone(880, now, 0.15);
          // Bip 2 : 1100 Hz après 0.2s pendant 0.2s
          playTone(1100, now + 0.2, 0.2);
        } catch (e) {
          console.error("Audio error", e);
        }
      };

      const onSystemAlert = (data) => {
        playNotificationSound();
        addNotification({
          title: data.title || 'Système 🚨',
          message: data.message,
          type: NOTIFICATION_TYPES.URGENT,
          category: NOTIFICATION_CATEGORIES.SYSTEM,
          priority: 'high'
        });
      };

      socketService.on('system:alert', onSystemAlert);

      const onNewDispute = (data) => {
        playNotificationSound();
        addNotification({
          title: 'Nouveau litige ⚠️',
          message: `${data.reference}: ${data.type}`,
          type: NOTIFICATION_TYPES.WARNING,
          category: NOTIFICATION_CATEGORIES.MODERATION,
          link: '/admin/litiges',
          priority: 'high'
        });
      };

      socketService.on('dispute:new', onNewDispute);

      // Listener pour les nouvelles inscriptions de chauffeurs
      const onNewChauffeur = (data) => {
        playNotificationSound();
        addNotification({
          title: 'Nouvelle Inscription 🚗',
          message: `Un nouveau chauffeur s'est inscrit : ${data.nom || 'Nouveau chauffeur'}`,
          type: NOTIFICATION_TYPES.INFO,
          category: NOTIFICATION_CATEGORIES.SYSTEM,
          link: '/admin/validations',
          priority: 'high'
        });
      };

      socketService.on('chauffeur:inscription', onNewChauffeur);
      socketService.on('chauffeur:new', onNewChauffeur);

      // Listener pour les rapports générés automatiquement
      const onReportGenerated = (data) => {
        playNotificationSound();
        setReportGeneratedData(data);
        addNotification({
          title: 'Rapport Prêt ✅',
          message: `Le rapport "${data.title || data.rapport || 'Auto'}" est prêt.`,
          type: NOTIFICATION_TYPES.SUCCESS,
          category: NOTIFICATION_CATEGORIES.SYSTEM,
          link: '/admin/rapports',
          priority: 'high'
        });
      };

      socketService.on('report:generated', onReportGenerated);
      socketService.on('rapport:genere', onReportGenerated);

      const onNewContact = (data) => {
        playNotificationSound();
        setNewContactData(data); // Déclenche la modale
        addNotification({
          title: 'Nouveau message 📩',
          message: `De ${data.name}: ${data.subject}`,
          type: NOTIFICATION_TYPES.INFO,
          category: NOTIFICATION_CATEGORIES.SYSTEM,
          priority: 'high'
        });
      };

      socketService.on('contact:new', onNewContact);

      const onNewLog = (data) => {
        playNotificationSound();
        addNotification({
          title: 'Activité Journal 📝',
          message: data.message,
          type: NOTIFICATION_TYPES.INFO,
          category: NOTIFICATION_CATEGORIES.SYSTEM,
          link: '/admin/logs',
          priority: 'low'
        });
      };

      socketService.on('admin:log:new', onNewLog);

      return () => {
        socketService.off('system:alert', onSystemAlert);
        socketService.off('dispute:new', onNewDispute);
        socketService.off('chauffeur:inscription', onNewChauffeur);
        socketService.off('chauffeur:new', onNewChauffeur);
        socketService.off('report:generated', onReportGenerated);
        socketService.off('rapport:genere', onReportGenerated);
        socketService.off('contact:new', onNewContact);
        socketService.off('admin:log:new', onNewLog);
      };

    }
  }, [user?._id, user?.id, addNotification]);



  const showToast = (titleOrObj, message, type = 'success') => {
    let finalTitle, finalMessage, finalType;

    if (typeof titleOrObj === 'object' && titleOrObj !== null) {
      finalTitle = titleOrObj.title || 'Notification';
      finalMessage = titleOrObj.message || '';
      finalType = titleOrObj.type || 'success';
    } else {
      finalTitle = titleOrObj;
      finalMessage = message;
      finalType = type;
    }

    setToast({ title: finalTitle, message: finalMessage, type: finalType });

    // Also add to notification history for the bell icon
    addNotification({
      title: finalTitle,
      message: finalMessage,
      type: finalType === 'error' ? NOTIFICATION_TYPES.ERROR : (finalType === 'warning' ? NOTIFICATION_TYPES.WARNING : NOTIFICATION_TYPES.SUCCESS),
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      showToast: false // We already show it via the local toast state
    });
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      const res = await apiClient.post('/common/contact/reply', {
        messageId: newContactData.id,
        reply: replyText
      });
      if (res.data.succes) {
        showToast('Succès', 'La réponse a été envoyée au visiteur', 'success');
        setNewContactData(null);
        setShowReplyInput(false);
        setReplyText("");
      } else {
        showToast('Erreur', res.data.message || "Erreur lors de l\'envoi", 'error');
      }
    } catch (err) {
      showToast('Erreur', 'Impossible de joindre le serveur', 'error');
    } finally {
      setIsReplying(false);
    }
  };


  const showModal = (content) => {
    setModal(content);
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <div className="flex min-h-screen inset-0 bg-gray-100 bg-gradient-to-br from-primary-50 to-secondary-100  dark:from-gray-800  dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}>
        {/* Header */}
        <Header
          currentDate={currentDate}
          onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
          showToast={showToast}
        />
        <main className="content-padding flex-1">
          <div className="content-container">
            {/* Main Content Area */}
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* Route par défaut pour /admin */}
                <Route index element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard showToast={showToast} />
                  </motion.div>
                } />

                {/* Les autres routes - elles sont maintenant relatives à /admin */}
                <Route path="utilisateurs" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Users showToast={showToast} />
                  </motion.div>
                } />
                <Route path="chauffeurs" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Drivers showToast={showToast} />
                  </motion.div>
                } />
                <Route path="trajets" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Trips showToast={showToast} />
                  </motion.div>
                } />
                <Route path="paiements" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Payments showToast={showToast} />
                  </motion.div>
                } />
                <Route path="validations" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Validations showToast={showToast} />
                  </motion.div>
                } />
                <Route path="litiges" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Disputes showToast={showToast} />
                  </motion.div>
                } />
                <Route path="promotions" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Coupons showToast={showToast} />
                  </motion.div>
                } />
                <Route path="documents" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Documents showToast={showToast} />
                  </motion.div>
                } />
                <Route path="rapports" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Reports showToast={showToast} />
                  </motion.div>
                } />
                <Route path="commissions" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Commissions showToast={showToast} />
                  </motion.div>
                } />
                <Route path="parametres" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Settings showToast={showToast} />
                  </motion.div>
                } />
                <Route path="logs" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ActivityLogs showToast={showToast} />
                  </motion.div>
                } />
                <Route path="transactions" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Transactions showToast={showToast} />
                  </motion.div>
                } />
                <Route path="locations" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <GarageVirtuel showToast={showToast} />
                  </motion.div>
                } />
                <Route path="profil" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <UserProfile showToast={showToast} />
                  </motion.div>
                } />

                {/* Route pour /admin directement (dashboard) */}
                <Route path="" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard showToast={showToast} />
                  </motion.div>
                } />
              </Routes>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-2 md:mb-0">
              © {new Date().getFullYear()} {platform.name || 'TakaTaka'} Admin. {t('common.all_rights_reserved') || 'Tous droits réservés.'}
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-all duration-200 text-sm hover:underline">
                {t('common.help') || 'Aide'}
              </a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-all duration-200 text-sm hover:underline">
                {t('common.security') || 'Sécurité'}
              </a>
              <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-all duration-200 text-sm hover:underline">
                {t('common.privacy') || 'Confidentialité'}
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notification */}
      <Toast {...toast} onClose={() => setToast(null)} />

      {/* Modale Notification Rapport */}
      <Modal
        isOpen={!!reportGeneratedData}
        onClose={() => setReportGeneratedData(null)}
        title="Rapport Automatique Généré"
      >
        <div className="text-center p-2">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
            Votre rapport est prêt !
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Le rapport planifié <span className="font-semibold text-gray-800 dark:text-gray-100">"{reportGeneratedData?.title || reportGeneratedData?.rapport}"</span> a été généré avec succès et envoyé aux destinataires.
          </p>
          <div className="flex flex-col gap-2">
            <AdminButton
              variant="perso"
              icon={Download}
              onClick={() => {
                // Logique de téléchargement si l'URL est fournie
                setReportGeneratedData(null);
                window.location.href = '/admin/rapports';
              }}
            >
              Consulter les rapports
            </AdminButton>
            <AdminButton variant="outline" onClick={() => setReportGeneratedData(null)}>
              Fermer
            </AdminButton>
          </div>
        </div>
      </Modal>

      {/* Modale Notification Nouveau Contact */}
      <Modal
        isOpen={!!newContactData}
        onClose={() => {
          setNewContactData(null);
          setShowReplyInput(false);
          setReplyText("");
        }}
        title="Nouveau Message de Contact"
      >
        <div className="text-center p-2">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
            Nouveau message reçu
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-wrap">
            <span className="font-semibold block">De: {newContactData?.name} ({newContactData?.email})</span>
            Sujet: {newContactData?.subject}
          </p>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left mb-6 font-medium text-sm text-gray-700 dark:text-gray-300 italic border border-gray-200 dark:border-gray-700">
            "{newContactData?.message}"
          </div>

          {!showReplyInput ? (
            <div className="flex flex-col gap-2">
              <AdminButton variant="perso" onClick={() => setShowReplyInput(true)}>
                Répondre
              </AdminButton>
              <AdminButton variant="outline" onClick={() => {
                setNewContactData(null);
                setShowReplyInput(false);
                setReplyText("");
              }}>
                Fermer
              </AdminButton>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-4 text-left">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">Votre réponse :</h4>
              <textarea
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none focus:ring-2 focus:ring-primaryGreen-start focus:border-transparent transition-all"
                rows={4}
                placeholder="Tapez votre réponse ici..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={isReplying}
              />
              <div className="flex gap-2">
                <AdminButton variant="outline" onClick={() => setShowReplyInput(false)} className="flex-1">
                  Annuler
                </AdminButton>
                <AdminButton
                  variant="perso"
                  className="flex-1"
                  onClick={handleReplySubmit}
                  disabled={isReplying || !replyText.trim()}
                  icon={isReplying ? Loader2 : Send}
                >
                  {isReplying ? 'Envoi...' : 'Envoyer'}
                </AdminButton>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Générique */}
      <Modal isOpen={!!modal} onClose={closeModal}>
        {modal}
      </Modal>

      {/* Toaster global */}
      <Toaster
        position="top-right"
        containerStyle={{
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
          loading: {
            style: {
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            },
          },
        }}
      />
    </div>
  );
}

export default AdminApp;
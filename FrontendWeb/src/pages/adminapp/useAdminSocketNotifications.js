import { useEffect } from 'react';
import { socketService } from '../../services/socketService';
import { NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from '../../context/NotificationContext';

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

// Connecte le socket admin et branche tous les listeners de notifications temps reel
export const useAdminSocketNotifications = ({ user, addNotification, setReportGeneratedData, setNewContactData }) => {
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      console.log("🔌 [ADMIN] Connecting to socket system...");
      socketService.connect(userId, 'ADMIN', user.nom, user.prenom);

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
};

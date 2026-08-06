import { useEffect } from 'react';
import { socketService } from '../../../../services/socketService';
import { ROLES } from '../../../../config/navConfig';

// Real-time admin notifications (Deposit & Withdrawal alerts)
export const useHeaderAdminAlerts = ({ role, user, showToast }) => {
  useEffect(() => {
    if (role !== ROLES.ADMIN || !user) return;

    const onAdminNotification = (data) => {
      if (showToast) showToast('Info Portefeuille', data.message, 'success');
      console.log('💳 [ADMIN_NOTIF] Dépôt reçu:', data);
    };

    const onWithdrawAlert = (data) => {
      if (showToast) showToast('ALERTE RETRAIT', data.message, 'warning');

      // Play a beep sound for withdrawals
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.warn("Audio play blocked by browser:", e));
      } catch (e) {
        console.error("Erreur sonnerie:", e);
      }
    };

    // Initialisation socket si non fait
    if (!socketService.isConnected()) {
      socketService.connect(user.id || user._id, role, user.nom, user.prenom);
    }

    socketService.on("admin:notification", onAdminNotification);
    socketService.on("admin:withdraw_alert", onWithdrawAlert);

    return () => {
      socketService.off("admin:notification", onAdminNotification);
      socketService.off("admin:withdraw_alert", onWithdrawAlert);
    };
  }, [role, user, showToast]);
};

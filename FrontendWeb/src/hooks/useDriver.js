import { useState, useCallback } from 'react';
import { adminService } from '../services/adminService';

/**
 * Hook réutilisable pour les actions "Activer / Désactiver / Suspendre" d'un chauffeur,
 * avec modale de confirmation + toast.
 *
 * @param {Object} params
 * @param {Function} params.refresh - Fonction pour rafraîchir la liste
 * @param {Function} params.showToast - (title, message, type) => void
 */
export default function useDriverActions({ refresh, showToast } = {}) {
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: null,
    driver: null,
    action: null, // 'activate' | 'deactivate' | 'suspend'
  });

  const [isLoading, setIsLoading] = useState(false);

  const closeConfirmationModal = useCallback(() => {
    setConfirmationModal({ isOpen: false, type: null, driver: null, action: null });
    setIsLoading(false);
  }, []);

  const openStatusModal = useCallback((driver, action) => {
    let title = '';
    let message = '';
    let confirmText = '';
    let confirmVariant = 'success';
    let type = 'success';

    if (action === 'activate') {
      title = 'Activer le chauffeur';
      message = `Êtes-vous sûr de vouloir activer le compte de ${driver.name} ?`;
      confirmText = 'Activer';
    } else if (action === 'deactivate') {
      title = 'Désactiver le chauffeur';
      message = `Le chauffeur ${driver.name} ne pourra plus accepter de courses. Continuer ?`;
      confirmText = 'Désactiver';
      confirmVariant = 'warning';
      type = 'warning';
    } else if (action === 'suspend') {
      title = 'Suspendre le chauffeur';
      message = `Le compte de ${driver.name} sera suspendu. Cette action est réversible.`;
      confirmText = 'Suspendre';
      confirmVariant = 'danger';
      type = 'danger';
    }

    setConfirmationModal({
      isOpen: true,
      driver,
      action,
      title,
      message,
      confirmText,
      confirmVariant,
      type
    });
  }, []);

  const confirmAction = useCallback(
    async (comment) => {
      const { driver, action } = confirmationModal;
      if (!driver || !action) return;

      setIsLoading(true);
      const newStatus =
        action === 'activate'
          ? 'ACTIF'
          : action === 'deactivate'
            ? 'INACTIF'
            : 'SUSPENDU';

      try {
        await adminService.updateDriverStatus(driver.id, newStatus);

        if (showToast) {
          const label =
            newStatus === 'ACTIF'
              ? 'activé'
              : newStatus === 'INACTIF'
                ? 'désactivé'
                : 'suspendu';

          showToast(
            'Statut modifié',
            `Le chauffeur ${driver.name} a été ${label}${comment ? ` (${comment})` : ''}.`,
            newStatus === 'ACTIF' ? 'success' : newStatus === 'INACTIF' ? 'warning' : 'danger'
          );
        }

        if (refresh) refresh();
        closeConfirmationModal();
      } catch (error) {
        console.error('Erreur lors du changement de statut:', error);
        if (showToast) showToast('Erreur', 'Impossible de modifier le statut', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [confirmationModal, refresh, showToast, closeConfirmationModal]
  );

  return {
    confirmationModal,
    openStatusModal,
    confirmAction,
    closeConfirmationModal,
    isLoading,
  };
}

// src/hooks/useDriverActions.js
import { useCallback, useState } from 'react';

/**
 * Hook réutilisable pour les actions "Activer / Désactiver / Suspendre" d'un chauffeur,
 * avec modale de confirmation + toast.
 *
 * @param {Object} params
 * @param {Array} params.drivers - Liste actuelle (optionnel, pas nécessaire si setDrivers utilise un updater)
 * @param {Function} params.setDrivers - setState React: setDrivers(prev => ...)
 * @param {Function} params.showToast - (title, message, type) => void
 */
export default function useDriverActions({ setDrivers, showToast } = {}) {
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: null,
    driver: null,
    action: null, // 'activate' | 'deactivate' | 'suspend'
  });

  const closeConfirmationModal = useCallback(() => {
    setConfirmationModal({ isOpen: false, type: null, driver: null, action: null });
  }, []);

  const openStatusModal = useCallback((driver, action) => {
    const type =
      action === 'activate'
        ? 'success'
        : action === 'deactivate'
          ? 'warning'
          : 'danger';

    setConfirmationModal({
      isOpen: true,
      type,
      driver,
      action,
    });
  }, []);

  const confirmAction = useCallback(
    async (comment) => {
      const { driver, action } = confirmationModal;
      if (!driver || !action) return;

      const newStatus =
        action === 'activate'
          ? 'active'
          : action === 'deactivate'
            ? 'inactive'
            : 'suspended';

      // TODO API (admin/chauffeurs):
      // Remplacer la maj locale par un appel backend (ex: adminService / driverService)
      // Exemple: POST /admin/validations ou PATCH /drivers/:id/status
      if (typeof setDrivers === 'function') {
        setDrivers((prev) =>
          Array.isArray(prev)
            ? prev.map((d) => (d.id === driver.id ? { ...d, status: newStatus } : d))
            : prev
        );
      }

      if (showToast) {
        const label =
          newStatus === 'active'
            ? 'activé'
            : newStatus === 'inactive'
              ? 'désactivé'
              : 'suspendu';

        showToast(
          'Statut modifié',
          `Le chauffeur ${driver.name} a été ${label}${comment ? ` (${comment})` : ''}.`,
          newStatus === 'active' ? 'success' : newStatus === 'inactive' ? 'warning' : 'danger'
        );
      }

      closeConfirmationModal();
    },
    [confirmationModal, setDrivers, showToast, closeConfirmationModal]
  );

  return {
    confirmationModal,
    openStatusModal,
    confirmAction,
    closeConfirmationModal,
  };
}

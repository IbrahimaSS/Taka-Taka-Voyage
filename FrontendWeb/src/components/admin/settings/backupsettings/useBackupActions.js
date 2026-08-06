import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../../../services/adminService';

export const useBackupActions = ({ onExport, onReset, showToast }) => {
  const [backups, setBackups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [backupName, setBackupName] = useState("");
  const [confirmAction, setConfirmAction] = useState({ open: false, type: '', id: '', nom: '' });

  const fetchBackups = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getBackups();
      if (response.data.succes) {
        setBackups(response.data.backups);
      }
    } catch (error) {
      console.error('Erreur chargement backups:', error);
      showToast('Erreur', 'Impossible de récupérer l\'historique des sauvegardes', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleOpenNameModal = () => {
    setBackupName(`Sauvegarde_${new Date().toISOString().split('T')[0]}_${new Date().getHours()}h${new Date().getMinutes()}`);
    setIsNameModalOpen(true);
  };

  const handleCreateBackup = async () => {
    setIsNameModalOpen(false);
    setIsCreating(true);
    try {
      const response = await adminService.createBackup(backupName || "Sauvegarde manuelle");
      if (response.data.succes) {
        showToast('Succès', 'Point de restauration créé avec succès sur le serveur', 'success');
        fetchBackups();
        // On garde l'export local optionnel
        if (onExport) onExport();
      }
    } catch (error) {
      showToast('Erreur', 'Échec de la sauvegarde serveur', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const triggerRestore = (id, nom) => {
    setConfirmAction({ open: true, type: 'restore', id, nom });
  };

  const triggerDelete = (id, nom) => {
    setConfirmAction({ open: true, type: 'delete', id, nom });
  };

  const triggerReset = () => {
    setConfirmAction({ open: true, type: 'reset', id: 'all', nom: 'TOUTE LA CONFIGURATION' });
  };

  const closeConfirmAction = () => setConfirmAction(prev => ({ ...prev, open: false }));

  const handleConfirm = async () => {
    const { type, id } = confirmAction;

    if (type === 'reset') {
      closeConfirmAction();
      onReset();
      return;
    }

    closeConfirmAction();

    if (type === 'restore') {
      setIsRestoring(true);
      try {
        const response = await adminService.restoreBackup(id);
        if (response.data.succes) {
          showToast('Restauré ✅', 'Les paramètres système ont été restaurés', 'success');
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (error) {
        showToast('Erreur', 'Impossible de restaurer cette sauvegarde', 'error');
        setIsRestoring(false);
      }
    } else if (type === 'delete') {
      try {
        const response = await adminService.deleteBackup(id);
        if (response.data.succes) {
          showToast('Supprimé', 'Sauvegarde effacée définitivement', 'info');
          setBackups(prev => prev.filter(b => b._id !== id));
        }
      } catch (error) {
        showToast('Erreur', 'Suppression impossible', 'error');
      }
    }
  };

  return {
    backups, isLoading, isCreating, isRestoring,
    isNameModalOpen, setIsNameModalOpen, backupName, setBackupName,
    confirmAction, closeConfirmAction,
    fetchBackups, handleOpenNameModal, handleCreateBackup,
    triggerRestore, triggerDelete, triggerReset, handleConfirm,
  };
};

import { useState, useCallback } from 'react';
import { adminService } from '../../../services/adminService';

// Mapper les rôles backend → frontend
const mapRoleLabel = (role) => {
  const map = {
    'ADMIN': 'Administrateur',
    'SUPERVISEUR': 'Superviseur',
    'AGENT': 'Agent',
    'ANALYSTE': 'Analyste',
  };
  return map[role] || role;
};

// Mapper les rôles frontend → backend
const mapRoleBackend = (role) => {
  const map = {
    'admin': 'ADMIN',
    'supervisor': 'SUPERVISEUR',
    'agent': 'AGENT',
    'analyst': 'ANALYSTE',
    'Administrateur': 'ADMIN',
    'Superviseur': 'SUPERVISEUR',
    'Agent': 'AGENT',
    'Analyste': 'ANALYSTE',
  };
  return map[role] || 'AGENT';
};

// Gere le CRUD complet du personnel (distinct de la gestion du profil personnel de l'admin connecte)
export const usePersonnelManagement = ({ showToast, setIsSaving }) => {
  const [users, setUsers] = useState([]);
  const [loadingPersonnels, setLoadingPersonnels] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchPersonnels = useCallback(async () => {
    setLoadingPersonnels(true);
    try {
      const response = await adminService.getPersonnels();
      if (response.data?.succes && response.data?.personnels) {
        const mappedUsers = response.data.personnels.map(p => ({
          id: p._id,
          name: `${p.prenom || ''} ${p.nom || ''}`.trim(),
          email: p.email || '',
          phone: p.telephone || '',
          role: mapRoleLabel(p.role),
          roleBackend: p.role,
          status: p.statut === 'ACTIF' ? 'active' : 'inactive',
          statusBackend: p.statut,
          joinDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : '',
          permissions: {
            view: p.permissions?.lecture ?? true,
            edit: p.permissions?.edition ?? false,
            create: p.permissions?.creation ?? false,
            delete: p.permissions?.suppression ?? false,
            manageUsers: p.permissions?.gestionUtilisateurs ?? false,
          },
          photoProfil: p.photoProfil || null,
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error('Erreur chargement personnels:', error);
      showToast('Erreur', 'Impossible de charger les personnels', 'error');
    } finally {
      setLoadingPersonnels(false);
    }
  }, [showToast]);

  const handleAddUser = useCallback(async (userData) => {
    setIsSaving(true);
    try {
      const nameParts = (userData.name || '').trim().split(' ');
      const prenom = nameParts[0] || '';
      const nom = nameParts.slice(1).join(' ') || prenom;

      const payload = {
        nom,
        prenom,
        email: userData.email,
        telephone: userData.phone || '',
        role: mapRoleBackend(userData.role),
        permissions: {
          lecture: userData.permissions?.view ?? true,
          edition: userData.permissions?.edit ?? false,
          creation: userData.permissions?.create ?? false,
          suppression: userData.permissions?.delete ?? false,
          gestionUtilisateurs: userData.permissions?.manageUsers ?? false,
        },
      };

      const response = await adminService.createPersonnel(payload);

      if (response.data?.succes) {
        showToast('Succès', `Personnel créé avec succès. Mot de passe temporaire : ${response.data.motDePasseTemporaire || '(envoyé par email)'}`, 'success');
        setShowUserForm(false);
        setEditingUser(null);
        await fetchPersonnels();
      } else {
        showToast('Erreur', response.data?.message || 'Erreur lors de la création', 'error');
      }
    } catch (error) {
      console.error('Erreur création personnel:', error);
      showToast('Erreur', error.response?.data?.message || 'Erreur lors de la création du personnel', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [showToast, fetchPersonnels, setIsSaving]);

  const handleEditUser = useCallback(async (userData) => {
    if (!editingUser || !editingUser.id) return;
    setIsSaving(true);
    try {
      const nameParts = (userData.name || '').trim().split(' ');
      const prenom = nameParts[0] || '';
      const nom = nameParts.slice(1).join(' ') || prenom;

      const payload = {
        nom,
        prenom,
        email: userData.email,
        telephone: userData.phone || '',
        role: mapRoleBackend(userData.role),
        permissions: {
          lecture: userData.permissions?.view ?? true,
          edition: userData.permissions?.edit ?? false,
          creation: userData.permissions?.create ?? false,
          suppression: userData.permissions?.delete ?? false,
          gestionUtilisateurs: userData.permissions?.manageUsers ?? false,
        },
      };

      const response = await adminService.updatePersonnel(editingUser.id, payload);

      if (response.data?.succes) {
        showToast('Succès', 'Personnel modifié avec succès', 'success');
        setShowUserForm(false);
        setEditingUser(null);
        await fetchPersonnels();
      } else {
        showToast('Erreur', response.data?.message || 'Erreur lors de la modification', 'error');
      }
    } catch (error) {
      console.error('Erreur modification personnel:', error);
      showToast('Erreur', error.response?.data?.message || 'Erreur lors de la modification du personnel', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [editingUser, showToast, fetchPersonnels, setIsSaving]);

  const handleToggleUserStatus = useCallback(async (userId) => {
    try {
      const response = await adminService.togglePersonnelStatus(userId);

      if (response.data?.succes) {
        const newStatut = response.data.statut;
        showToast(
          'Succès',
          `Personnel ${newStatut === 'ACTIF' ? 'débloqué' : 'bloqué'} avec succès`,
          'success'
        );
        setUsers(prev => prev.map(u =>
          u.id === userId
            ? { ...u, status: newStatut === 'ACTIF' ? 'active' : 'inactive', statusBackend: newStatut }
            : u
        ));
      } else {
        showToast('Erreur', response.data?.message || 'Erreur lors du changement de statut', 'error');
      }
    } catch (error) {
      console.error('Erreur toggle statut personnel:', error);
      showToast('Erreur', error.response?.data?.message || 'Erreur lors du changement de statut', 'error');
    }
  }, [showToast]);

  const handleDeleteUser = useCallback(async (userId) => {
    try {
      const response = await adminService.deletePersonnel(userId);

      if (response.data?.succes) {
        showToast('Succès', 'Personnel supprimé avec succès', 'success');
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        showToast('Erreur', response.data?.message || 'Erreur lors de la suppression', 'error');
      }
    } catch (error) {
      console.error('Erreur suppression personnel:', error);
      showToast('Erreur', error.response?.data?.message || 'Erreur lors de la suppression', 'error');
    }
  }, [showToast]);

  return {
    users,
    loadingPersonnels,
    showUserForm,
    setShowUserForm,
    editingUser,
    setEditingUser,
    fetchPersonnels,
    handleAddUser,
    handleEditUser,
    handleToggleUserStatus,
    handleDeleteUser,
  };
};

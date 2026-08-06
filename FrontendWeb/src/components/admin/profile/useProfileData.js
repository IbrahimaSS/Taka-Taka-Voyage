import { useState, useCallback, useEffect } from 'react';
import { useImageUpload } from '../../../hooks/useImageUpload';
import { useUserStore } from '../../../data/userStore';
import { useAuth } from '../../../context/AuthContext';
import { profileService } from '../../../services/profileService';
import { adminService } from '../../../services/adminService';

// Gere les donnees du profil personnel de l'admin connecte (distinct de la gestion du personnel)
export const useProfileData = ({ showToast, isSaving, setIsSaving }) => {
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileStats, setProfileStats] = useState({ actions: 0, validations: 0, notifications: 0 });

  const { uploadImage } = useImageUpload(null);
  const { profile: staticProfile, updateProfile: updateStaticProfile } = useUserStore();
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : (user?.nom || staticProfile?.name || 'Administrateur'),
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || staticProfile?.email || '',
    phone: user?.telephone || staticProfile?.phone || '',
    avatar: user?.avatar || user?.photoUrl || staticProfile?.avatar || null,
    role: user?.role || staticProfile?.role || 'Administrateur',
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : (staticProfile?.joinDate || '01/01/2024')
  });

  // Mettre à jour quand user change
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.prenom && user.nom ? `${user.prenom} ${user.nom}` : (user.nom || 'Administrateur'),
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        phone: user.telephone || '',
        avatar: user.avatar || user.photoUrl || null,
        role: user.role || 'Administrateur',
      }));
    }
  }, [user]);

  const fetchProfileStats = useCallback(async () => {
    try {
      const [dashRes, valRes, docRes] = await Promise.all([
        adminService.getDashboardStats().catch(() => ({ data: {} })),
        adminService.getValidationStats().catch(() => ({ data: {} })),
        adminService.getDocumentStats().catch(() => ({ data: {} }))
      ]);
      const dash = dashRes.data?.stats || dashRes.data || {};
      const val = valRes.data?.stats || {};
      const doc = docRes.data?.stats || {};

      setProfileStats({
        actions: dash.trajetsAujourdhui || dash.trajetsEffectues || 0,
        validations: (val.enAttente || 0) + (doc.enAttente || 0),
        notifications: doc.enAttente || 0,
      });
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }, []);

  const handleProfileChange = useCallback((key, value) => {
    setProfileData(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'prenom' || key === 'nom') {
        next.name = `${next.prenom || ''} ${next.nom || ''}`.trim();
      }
      return next;
    });
  }, []);

  const handleAvatarChange = useCallback(async (file) => {
    try {
      // Prévisualisation locale
      const previewUrl = await uploadImage(file);
      setProfileData(prev => ({ ...prev, avatar: previewUrl }));
      setAvatarFile(file); // Garder le fichier pour l'envoi au serveur
      showToast('Succès', 'Photo de profil mise à jour (prévisualisation)', 'success');
    } catch (error) {
      showToast('Erreur', error.message, 'error');
    }
  }, [uploadImage, showToast]);

  const handleSaveProfile = useCallback(async () => {
    setIsSaving(true);
    try {
      let response;
      const formData = new FormData();

      formData.append('nom', profileData.nom || '');
      formData.append('prenom', profileData.prenom || '');
      formData.append('email', profileData.email || '');
      formData.append('telephone', profileData.phone || '');

      if (avatarFile) {
        formData.append('photoUrl', avatarFile);
        response = await profileService.admin.updateProfileWithPhoto(formData);
      } else {
        response = await profileService.admin.updateProfile({
          nom: profileData.nom,
          prenom: profileData.prenom,
          email: profileData.email,
          telephone: profileData.phone
        });
      }

      if (response.data?.succes) {
        updateStaticProfile(profileData);
        if (updateUser) {
          updateUser(response.data.utilisateur);
        }
        showToast('Succès', 'Profil mis à jour avec succès', 'success');
        setAvatarFile(null); // Reset file
        return true;
      } else {
        showToast('Erreur', response.data?.message || 'Erreur lors de la mise à jour', 'error');
        return false;
      }
    } catch (error) {
      console.error('Erreur mise à jour profil admin:', error);
      showToast('Erreur', error.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [profileData, avatarFile, updateStaticProfile, updateUser, showToast, setIsSaving]);

  const handlePasswordChange = useCallback(async (passwordData) => {
    setIsSaving(true);
    try {
      const response = await profileService.changePassword('ADMIN', passwordData);
      if (response.data?.succes) {
        showToast('Succès', 'Mot de passe mis à jour avec succès', 'success');
        if (response.data.forceLogout) {
          // Si le backend demande la déconnexion
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } else {
        showToast('Erreur', response.data?.message || 'Erreur lors du changement de mot de passe', 'error');
      }
    } catch (error) {
      console.error('Erreur changement mot de passe admin:', error);
      showToast('Erreur', error.response?.data?.message || 'Erreur lors du changement de mot de passe', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [showToast, setIsSaving]);

  return {
    profileData,
    profileStats,
    fetchProfileStats,
    handleProfileChange,
    handleAvatarChange,
    handleSaveProfile,
    handlePasswordChange,
  };
};

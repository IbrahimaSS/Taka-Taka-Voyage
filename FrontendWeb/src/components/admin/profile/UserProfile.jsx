// src/components/profile/UserProfile.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Users, Shield, Bell, Settings,
  Activity, BarChart3, TrendingUp, Calendar,
  Mail, Phone, MapPin
} from 'lucide-react';

// Composants UI
import Tabs from '../ui/Tabs';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Toast from '../ui/Toast';

// Composants Profile
import ProfileHeader from './ProfileHeader';
import ProfileInfoCard from './ProfileInfoCard';
import ProfileAvatarCard from './ProfileAvatarCard';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import UserManagement from './UserManagement';
import UserFormModal from './UserFormModal';
import ProfileDocumentsCard from './ProfileDocumentsCard';


// Hooks
import { useImageUpload } from '../../../hooks/useImageUpload';
import { useUserStore } from '../../../data/userStore';
import { useAuth } from '../../../context/AuthContext';
import { profileService } from '../../../services/profileService';
import { adminService } from '../../../services/adminService';

const UserProfile = () => {
  // États principaux
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loadingPersonnels, setLoadingPersonnels] = useState(false);

  // Gestion de l'avatar
  const { uploadImage } = useImageUpload(null);

  // Données du profil (globales)
  const { profile: staticProfile, updateProfile: updateStaticProfile } = useUserStore();
  const { user, updateUser } = useAuth();

  // Initialiser profileData avec les données réelles ou statiques
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

  // Données des personnels (depuis le backend)
  const [users, setUsers] = useState([]);

  // Charger les personnels depuis le backend
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
  }, []);

  // Charger au montage
  useEffect(() => {
    fetchPersonnels();
  }, [fetchPersonnels]);

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

  // Tabs
  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'users', label: 'Personnels', icon: Users },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  // Handlers
  const showToast = useCallback((title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 5000);
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

      // Données de base
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
        setIsEditing(false);
        setAvatarFile(null); // Reset file
      } else {
        showToast('Erreur', response.data?.message || 'Erreur lors de la mise à jour', 'error');
      }
    } catch (error) {
      console.error('Erreur mise à jour profil admin:', error);
      showToast('Erreur', error.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [profileData, avatarFile, updateStaticProfile, updateUser, showToast]);

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
  }, [showToast]);

  // ========================
  // CRUD Personnel (API réelle)
  // ========================

  const handleAddUser = useCallback(async (userData) => {
    setIsSaving(true);
    try {
      // Extraire nom et prénom depuis le champ name
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
        // Recharger la liste
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
  }, [showToast, fetchPersonnels]);

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
  }, [editingUser, showToast, fetchPersonnels]);

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
        // Mettre à jour localement pour réactivité immédiate
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

  // Rendu du contenu des onglets
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ProfileInfoCard
                  profile={profileData}
                  isEditing={isEditing}
                  onProfileChange={handleProfileChange}
                />

                <ProfileDocumentsCard showToast={showToast} />
              </div>

              <div className="space-y-6 w-full">
                <ProfileAvatarCard
                  profile={profileData}
                  isEditing={isEditing}
                  onAvatarChange={handleAvatarChange}
                />

                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Statistiques</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { label: 'Actions aujourd\'hui', value: '24', icon: User, color: 'green' },
                          { label: 'Validations en attente', value: '12', icon: Shield, color: 'blue' },
                          { label: 'Notifications', value: '8', icon: Bell, color: 'purple' },
                        ].map((stat, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                                <stat.icon className={`text-${stat.color}-500`} />
                              </div>
                              <span className="text-gray-700 dark:text-gray-200">{stat.label}</span>
                            </div>
                            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'users':
        return (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <UserManagement
              users={users}
              loading={loadingPersonnels}
              onAddUser={() => {
                setEditingUser(null);
                setShowUserForm(true);
              }}
              onEditUser={(u) => {
                setEditingUser(u);
                setShowUserForm(true);
              }}
              onToggleStatus={handleToggleUserStatus}
              onDeleteUser={handleDeleteUser}
              onRefresh={fetchPersonnels}
              showToast={showToast}
            />
          </motion.div>
        );

      case 'security':
        return (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SecuritySettings
              onPasswordChange={handlePasswordChange}
              isSaving={isSaving}
            />
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <NotificationSettings />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen  p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <ProfileHeader
          title={activeTab === 'users' ? "Gestion des personnels" : "Mon profil"}
          description={activeTab === 'users' ? "Gérez les profils, permissions et paramètres système" : "Gérez vos informations personnelles et paramètres de compte"}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={handleSaveProfile}
          isSaving={isSaving}
          onCancel={() => setIsEditing(false)}
          showAddButton={activeTab === 'users'}
          onAddClick={() => {
            setEditingUser(null);
            setShowUserForm(true);
          }}
        />

        {/* Onglets */}
        <Card hoverable={false} className="border-2 border-gray-100 dark:border-gray-900">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </Card>

        {/* Contenu */}
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </div>

      {/* Modal d'ajout/modification d'utilisateur */}
      <UserFormModal
        isOpen={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleEditUser : handleAddUser}
        initialData={editingUser ? {
          ...editingUser,
          permissions: editingUser.permissions || {
            view: true,
            edit: false,
            create: false,
            delete: false,
            manageUsers: false
          }
        } : null}
        title={editingUser ? "Modifier le personnel" : "Ajouter un personnel"}
      />

      {/* Toast */}
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default UserProfile;
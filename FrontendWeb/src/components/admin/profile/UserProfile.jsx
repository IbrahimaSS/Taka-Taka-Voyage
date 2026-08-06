// src/components/profile/UserProfile.jsx
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Shield, Bell } from 'lucide-react';

// Composants UI
import Tabs from '../ui/Tabs';
import Card from '../ui/Card';
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
import ProfileStatsCard from './ProfileStatsCard';

// Hooks
import { useProfileData } from './useProfileData';
import { usePersonnelManagement } from './usePersonnelManagement';

const UserProfile = () => {
  // États principaux
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = useCallback((title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const {
    profileData,
    profileStats,
    fetchProfileStats,
    handleProfileChange,
    handleAvatarChange,
    handleSaveProfile,
    handlePasswordChange,
  } = useProfileData({ showToast, isSaving, setIsSaving });

  const {
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
  } = usePersonnelManagement({ showToast, setIsSaving });

  // Charger au montage
  useEffect(() => {
    fetchPersonnels();
    fetchProfileStats();
  }, [fetchPersonnels, fetchProfileStats]);

  // Tabs
  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'users', label: 'Personnels', icon: Users },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const onSaveProfile = async () => {
    const ok = await handleSaveProfile();
    if (ok) setIsEditing(false);
  };

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
                  <ProfileStatsCard stats={profileStats} />
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
          onSave={onSaveProfile}
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

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useProfileEditor } from './profile/useProfileEditor';
import { useTickets } from './profile/useTickets';
import ProfileTabsHeader from './profile/ProfileTabsHeader';
import ProfileAvatarCard from './profile/ProfileAvatarCard';
import ProfilePersonalInfoForm from './profile/ProfilePersonalInfoForm';
import ProfilePreferencesForm from './profile/ProfilePreferencesForm';
import ProfileActionsBar from './profile/ProfileActionsBar';
import ProfileTicketsTab from './profile/ProfileTicketsTab';
import ProfileStatsSidebar from './profile/ProfileStatsSidebar';
import ProfileBadgesSidebar from './profile/ProfileBadgesSidebar';
import PasswordChangeModal from './profile/PasswordChangeModal';
import TicketDetailModal from './profile/TicketDetailModal';

const Profile = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('info');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const fileInputRef = useRef(null);

  const {
    passenger, isLoadingProfile, user,
    profileData, setProfileData,
    isEditing, setIsEditing,
    isSaving, handleSave,
    handleImageUpload,
    realStats,
    getImageUrl,
  } = useProfileEditor(t);

  const {
    tickets, isLoadingTickets,
    selectedTicket, setSelectedTicket,
    searchTerm, setSearchTerm,
  } = useTickets(activeTab, setActiveTab);

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 animate-pulse">{t('profile.messages.loading')}</p>
      </div>
    );
  }

  if (!passenger) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-gray-500">{t('profile.messages.error_loading')}</p>
        <button onClick={() => window.location.reload()} className="text-green-600 font-bold underline">{t('profile.messages.retry')}</button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
        {/* Informations principales */}
        <div className="lg:col-span-2 passenger-glass dark:bg-gray-800/80 rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/50">
          <ProfileTabsHeader activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'info' ? (
            <>
              <ProfileAvatarCard
                profileData={profileData}
                setProfileData={setProfileData}
                isEditing={isEditing}
                user={user}
                passenger={passenger}
                fileInputRef={fileInputRef}
                onImageUpload={handleImageUpload}
                getImageUrl={getImageUrl}
              />

              <div className="space-y-8">
                <ProfilePersonalInfoForm
                  profileData={profileData}
                  setProfileData={setProfileData}
                  isEditing={isEditing}
                />

                <ProfilePreferencesForm
                  profileData={profileData}
                  setProfileData={setProfileData}
                />

                <ProfileActionsBar
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  isSaving={isSaving}
                  onSave={handleSave}
                  profileData={profileData}
                  setProfileData={setProfileData}
                  passenger={passenger}
                  onOpenPasswordModal={() => setShowPasswordModal(true)}
                />
              </div>
            </>
          ) : (
            <ProfileTicketsTab
              tickets={tickets}
              isLoadingTickets={isLoadingTickets}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSelectTicket={setSelectedTicket}
            />
          )}
        </div>

        {/* Sidebar - Statistiques et badges */}
        <div className="space-y-8">
          <ProfileStatsSidebar realStats={realStats} />
          <ProfileBadgesSidebar />
        </div>
      </div>

      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        passengerName={profileData.name}
        passengerPhoto={profileData.photo || profileData.avatar}
        onClose={() => setSelectedTicket(null)}
      />
    </>
  );
};

export default Profile;

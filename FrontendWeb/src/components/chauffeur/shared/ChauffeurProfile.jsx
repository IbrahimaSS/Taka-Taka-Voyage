import { Shield } from 'lucide-react';
import Badge from '../../admin/ui/Badge';

import { useChauffeurProfile } from '../profile/useChauffeurProfile';
import ProfileHeaderCard from '../profile/ProfileHeaderCard';
import ProfileInfoForm from '../profile/ProfileInfoForm';
import ProfileStatsCard from '../profile/ProfileStatsCard';
import ProfileBadgesCard from '../profile/ProfileBadgesCard';
import PasswordChangeModal from '../profile/PasswordChangeModal';

const ChauffeurProfile = () => {
    const {
        profileData,
        setProfileData,
        isEditing,
        startEditing,
        cancelEditing,
        isSaving,
        fileInputRef,
        showPasswordModal,
        setShowPasswordModal,
        passwordData,
        setPasswordData,
        isChangingPassword,
        realStats,
        handleImageUpload,
        handleSave,
        handlePasswordChange,
        getImageUrl,
    } = useChauffeurProfile();

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-1">
                <div className="lg:col-span-2 surface dark:bg-gray-800/80 rounded-2xl p-4 sm:p-8 shadow-xl border border-white/20 dark:border-gray-700/50">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profil Chauffeur</h2>
                        <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-none" size="sm">
                            <Shield className="w-4 h-4 mr-1" />
                            Chauffeur Vérifié
                        </Badge>
                    </div>

                    <ProfileHeaderCard
                        profileData={profileData}
                        setProfileData={setProfileData}
                        isEditing={isEditing}
                        fileInputRef={fileInputRef}
                        onImageUpload={handleImageUpload}
                        getImageUrl={getImageUrl}
                    />

                    <ProfileInfoForm
                        profileData={profileData}
                        setProfileData={setProfileData}
                        isEditing={isEditing}
                        onStartEditing={startEditing}
                        onCancelEditing={cancelEditing}
                        isSaving={isSaving}
                        onSave={handleSave}
                        onOpenPasswordModal={() => setShowPasswordModal(true)}
                    />
                </div>

                <div className="space-y-6">
                    <ProfileStatsCard realStats={realStats} />
                    <ProfileBadgesCard />
                </div>
            </div>

            <PasswordChangeModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                passwordData={passwordData}
                setPasswordData={setPasswordData}
                isChangingPassword={isChangingPassword}
                onSubmit={handlePasswordChange}
            />
        </>
    );
};

export default ChauffeurProfile;

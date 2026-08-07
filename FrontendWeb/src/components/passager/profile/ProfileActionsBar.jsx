import { useTranslation } from 'react-i18next';
import { Key } from 'lucide-react';
import Button from '../../admin/ui/Bttn';

const ProfileActionsBar = ({
  isEditing, setIsEditing, isSaving, onSave,
  profileData, setProfileData, passenger, onOpenPasswordModal,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
      <Button
        variant="outline"
        icon={Key}
        onClick={onOpenPasswordModal}
        fullWidth
        className="border-blue-300 text-blue-700 dark:text-blue-400 dark:border-blue-600 sm:w-auto"
      >
        {t('profile.password.change_btn')}
      </Button>

      <div className="flex flex-col sm:flex-row gap-4">
        {isEditing ? (
          <>
            <Button
              variant="secondary"
              fullWidth
              className="sm:w-auto"
              onClick={() => {
                setProfileData({ ...passenger });
                setIsEditing(false);
              }}
            >
              {t('profile.actions.cancel')}
            </Button>
            <Button
              variant="primary"
              fullWidth
              className="sm:w-auto"
              onClick={onSave}
              loading={isSaving}
            >
              {t('profile.actions.save')}
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            fullWidth
            className="sm:w-auto"
            onClick={() => setIsEditing(true)}
          >
            {t('profile.actions.edit')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfileActionsBar;

import { useTranslation } from 'react-i18next';
import ConfirmModal from '../../admin/ui/ConfirmModal';

const SettingsConfirmModals = ({
  showSaveConfirm, onCloseSave, onConfirmSave,
  showCancelConfirm, onCloseCancel, onConfirmCancel,
  showDeleteAccount, onCloseDelete, onConfirmDelete,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <ConfirmModal
        isOpen={showSaveConfirm}
        onClose={onCloseSave}
        onConfirm={onConfirmSave}
        title={t('passenger_settings.save_confirm_title')}
        message={t('passenger_settings.save_confirm_msg')}
        type="info"
        confirmText={t('passenger_settings.save_btn')}
        cancelText={t('common.cancel')}
      />

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={onCloseCancel}
        onConfirm={onConfirmCancel}
        title={t('passenger_settings.cancel_confirm_title')}
        message={t('passenger_settings.cancel_confirm_msg')}
        type="warning"
        confirmText={t('passenger_settings.yes_cancel')}
        cancelText={t('passenger_settings.no_keep')}
      />

      <ConfirmModal
        isOpen={showDeleteAccount}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
        title={t('passenger_settings.delete_confirm_title')}
        message={t('passenger_settings.delete_confirm_msg')}
        type="delete"
        confirmText={t('passenger_settings.delete_permanently')}
        cancelText={t('common.cancel')}
        destructive={true}
        showComment={true}
        commentLabel={t('passenger_settings.delete_reason_label')}
        commentPlaceholder={t('passenger_settings.delete_reason_placeholder')}
      />
    </>
  );
};

export default SettingsConfirmModals;

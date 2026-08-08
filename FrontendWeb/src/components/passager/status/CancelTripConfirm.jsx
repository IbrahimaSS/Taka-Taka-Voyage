import { useTranslation } from 'react-i18next';
import ConfirmModal from '../../admin/ui/ConfirmModal';

const CancelTripConfirm = ({
  isOpen, onClose, onConfirm, isCancelling,
  cancelReason, onCancelReasonChange,
}) => {
  const { t } = useTranslation();

  const cancelReasons = [
    t('status.cancel_confirm.reasons.too_long'),
    t('status.cancel_confirm.reasons.change_plans'),
    t('status.cancel_confirm.reasons.too_expensive'),
    t('status.cancel_confirm.reasons.driver_late'),
    t('status.cancel_confirm.reasons.vehicle_problem'),
    t('status.cancel_confirm.reasons.other'),
  ];

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('status.cancel_confirm.title')}
      message={t('status.cancel_confirm.message')}
      type="warning"
      confirmText={t('status.cancel_confirm.confirm_btn')}
      cancelText={t('status.cancel_confirm.cancel_btn')}
      confirmVariant="danger"
      loading={isCancelling}
      showComment={true}
      commentLabel={t('status.cancel_confirm.reason_label')}
      commentPlaceholder={t('status.cancel_confirm.reason_placeholder')}
      commentValue={cancelReason}
      onCommentChange={onCancelReasonChange}
      destructive={true}
    >
      <div className="space-y-2 mb-4">
        {cancelReasons.map((reason, index) => (
          <button
            key={index}
            onClick={() => onCancelReasonChange(reason)}
            className={`w-full text-left px-4 py-2 rounded-lg border text-sm ${cancelReason === reason
              ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
              : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
          >
            {reason}
          </button>
        ))}
      </div>

      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          {t('status.cancel_confirm.late_cancel_warning')}
        </p>
      </div>
    </ConfirmModal>
  );
};

export default CancelTripConfirm;

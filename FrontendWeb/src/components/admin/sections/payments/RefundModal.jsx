import { useTranslation } from 'react-i18next';
import ConfirmModal from '../../ui/ConfirmModal';

// Modal de remboursement
const RefundModal = ({ payment, isOpen, onClose, onConfirm, loading }) => {
  const { t } = useTranslation();

  if (!payment) return null;

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => onConfirm(payment.id)}
      title={t('payments.confirm_refund')}
      message={t('payments.refund_confirm_msg', { id: payment.id, amount: payment.amount })}
      type="warning"
      confirmText={t('payments.refund')}
      cancelText={t('common.cancel')}
      loading={loading}
      showComment={true}
      commentLabel={t('payments.refund_reason')}
      commentPlaceholder={t('payments.refund_reason_placeholder')}
    />
  );
};

export default RefundModal;

import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import Modal from '../../admin/ui/Modal';
import Button from '../../admin/ui/Bttn';

const SupportSuccessModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
    >
      <div className="text-center p-6">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t('support.success_title')}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t('support.success_msg')}
        </p>
        <div className="space-y-4">
          <Button
            variant="primary"
            fullWidth
            onClick={onClose}
          >
            {t('support.ok_btn')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SupportSuccessModal;

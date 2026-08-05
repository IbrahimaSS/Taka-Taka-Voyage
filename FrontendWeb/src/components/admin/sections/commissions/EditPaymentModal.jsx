import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Bttn';
import DriverAvatar from './DriverAvatar';
import { formatGNF, getServiceLabel } from './commissionHelpers';

// Fonction de rendu pour le modal d'édition, en composant module-level
// (meme raisonnement que PaymentDetailsModal.jsx sur le commentaire
// "PAS un composant pour eviter le re-mount/flicker" d'origine)
const EditPaymentModal = ({ payment, isOpen, editForm, setEditForm, onClose, onSave, loading }) => {
  const { t } = useTranslation();

  if (!payment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('payments.edit_title')}
      size="md"
    >
      <div className="space-y-6 scroll-m-t-2 overflow-y-auto h-[70vh]">
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 mb-4">
          <div className="flex items-center mb-3">
            <div className="mr-3">
              <DriverAvatar photo={payment.photo} nom={payment.nom} size="sm" />
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-100">{payment.nom}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{payment.telephone}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('commissions.service')}</p>
              <p className="font-medium">{getServiceLabel(payment.service, t)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('commissions.gross_amount')}</p>
              <p className="font-medium">{formatGNF(payment.montantBrut)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('payments.method')}</label>
            <select
              value={editForm.methode}
              onChange={(e) => setEditForm(prev => ({ ...prev, methode: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="ORANGE_MONEY">Orange Money</option>
              <option value="MTN_MONEY">MTN Mobile Money</option>
              <option value="CASH">Espèces</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('payments.account')}</label>
            <input
              type="text"
              value={editForm.compte}
              onChange={(e) => setEditForm(prev => ({ ...prev, compte: e.target.value }))}
              placeholder="+224 6XX XX XX XX"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('common.comment')} ({t('common.optional')})</label>
            <textarea
              value={editForm.commentaire}
              onChange={(e) => setEditForm(prev => ({ ...prev, commentaire: e.target.value }))}
              placeholder={t('common.comment_placeholder')}
              rows="3"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">{t('commissions.recap')}</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">{t('payments.platform_commission')} :</span>
              <span className="font-bold text-red-600">{formatGNF(payment.commission)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">{t('commissions.to_pay')} :</span>
              <span className="font-bold text-green-600">{formatGNF(payment.montantNet)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" icon={CheckCircle} onClick={onSave} loading={loading}>
            {t('common.save_changes')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditPaymentModal;

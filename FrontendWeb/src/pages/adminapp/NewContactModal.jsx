import { useState } from 'react';
import { Mail, Send, Loader2 } from 'lucide-react';
import Modal from '../../components/admin/ui/Modal';
import AdminButton from '../../components/admin/ui/Bttn';
import { apiClient } from '../../services/apiClient';

const NewContactModal = ({ contactData, onClose, showToast }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const handleClose = () => {
    onClose();
    setShowReplyInput(false);
    setReplyText("");
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      const res = await apiClient.post('/common/contact/reply', {
        messageId: contactData.id,
        reply: replyText
      });
      if (res.data.succes) {
        showToast('Succès', 'La réponse a été envoyée au visiteur', 'success');
        handleClose();
      } else {
        showToast('Erreur', res.data.message || "Erreur lors de l\'envoi", 'error');
      }
    } catch (err) {
      showToast('Erreur', 'Impossible de joindre le serveur', 'error');
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <Modal
      isOpen={!!contactData}
      onClose={handleClose}
      title="Nouveau Message de Contact"
    >
      <div className="text-center p-2">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
          Nouveau message reçu
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-wrap">
          <span className="font-semibold block">De: {contactData?.name} ({contactData?.email})</span>
          Sujet: {contactData?.subject}
        </p>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left mb-6 font-medium text-sm text-gray-700 dark:text-gray-300 italic border border-gray-200 dark:border-gray-700">
          "{contactData?.message}"
        </div>

        {!showReplyInput ? (
          <div className="flex flex-col gap-2">
            <AdminButton variant="perso" onClick={() => setShowReplyInput(true)}>
              Répondre
            </AdminButton>
            <AdminButton variant="outline" onClick={handleClose}>
              Fermer
            </AdminButton>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-4 text-left">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">Votre réponse :</h4>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none focus:ring-2 focus:ring-primaryGreen-start focus:border-transparent transition-all"
              rows={4}
              placeholder="Tapez votre réponse ici..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={isReplying}
            />
            <div className="flex gap-2">
              <AdminButton variant="outline" onClick={() => setShowReplyInput(false)} className="flex-1">
                Annuler
              </AdminButton>
              <AdminButton
                variant="perso"
                className="flex-1"
                onClick={handleReplySubmit}
                disabled={isReplying || !replyText.trim()}
                icon={isReplying ? Loader2 : Send}
              >
                {isReplying ? 'Envoi...' : 'Envoyer'}
              </AdminButton>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NewContactModal;

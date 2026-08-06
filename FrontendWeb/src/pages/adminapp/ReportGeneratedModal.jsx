import { CheckCircle, Download } from 'lucide-react';
import Modal from '../../components/admin/ui/Modal';
import AdminButton from '../../components/admin/ui/Bttn';

const ReportGeneratedModal = ({ reportData, onClose }) => {
  return (
    <Modal
      isOpen={!!reportData}
      onClose={onClose}
      title="Rapport Automatique Généré"
    >
      <div className="text-center p-2">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
          Votre rapport est prêt !
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Le rapport planifié <span className="font-semibold text-gray-800 dark:text-gray-100">"{reportData?.title || reportData?.rapport}"</span> a été généré avec succès et envoyé aux destinataires.
        </p>
        <div className="flex flex-col gap-2">
          <AdminButton
            variant="perso"
            icon={Download}
            onClick={() => {
              // Logique de téléchargement si l'URL est fournie
              onClose();
              window.location.href = '/admin/rapports';
            }}
          >
            Consulter les rapports
          </AdminButton>
          <AdminButton variant="outline" onClick={onClose}>
            Fermer
          </AdminButton>
        </div>
      </div>
    </Modal>
  );
};

export default ReportGeneratedModal;

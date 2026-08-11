import Modal from '../../admin/ui/Modal';
import Button from '../../admin/ui/Bttn';
import { documentTypes } from './useDriverRegistrationForm';

// Modal "Guide d'upload des documents" - extraite de
// InscriptionChauffeur.jsx (decomposition), aucun changement de
// comportement.
const DocumentInfoModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Guide d'upload des documents">
      <div className="space-y-4">
        {documentTypes.map((doc) => (
          <div key={doc.key} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{doc.label}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{doc.info}</p>
            <div className="mt-2 text-xs text-gray-500">
              <span className="font-medium">Format accepté:</span> {doc.accept.includes('image') ? 'Images (JPG, PNG) ou PDF' : 'PDF'}
              <br />
              <span className="font-medium">Taille max:</span> {doc.maxSize}MB
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-4">
          <Button variant="primary" onClick={onClose}>
            Compris
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentInfoModal;

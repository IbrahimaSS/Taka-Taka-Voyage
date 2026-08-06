import { Trash2, RefreshCw } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Bttn';

const BackupModals = ({
  isNameModalOpen, onCloseNameModal, backupName, onBackupNameChange, onCreateBackup,
  confirmAction, onCloseConfirm, onConfirm,
}) => {
  return (
    <>
      {/* Modal de Nom de Sauvegarde */}
      <Modal
        isOpen={isNameModalOpen}
        onClose={onCloseNameModal}
        title="Nouvelle sauvegarde"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom du point de restauration :
            </label>
            <input
              type="text"
              value={backupName}
              onChange={(e) => onBackupNameChange(e.target.value)}
              className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none transition-all"
              placeholder="Ex: Avant mise à jour tarifs"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={onCloseNameModal}>Annuler</Button>
            <Button
              variant="primary"
              className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 h-12"
              onClick={onCreateBackup}
            >
              Sauvegarder
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmation */}
      <Modal
        isOpen={confirmAction.open}
        onClose={onCloseConfirm}
        title="Confirmation requise"
      >
        <div className="text-center py-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmAction.type === 'delete' || confirmAction.type === 'reset' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
            {confirmAction.type === 'delete' ? <Trash2 className="w-8 h-8" /> : <RefreshCw className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 uppercase">
            {confirmAction.type === 'restore' ? 'Restaurer le système ?' :
              confirmAction.type === 'delete' ? 'Supprimer cette sauvegarde ?' :
                'RESET TOTAL ?'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 px-4">
            {confirmAction.type === 'restore' ? `Les réglages actuels seront remplacés par "${confirmAction.nom}".` :
              confirmAction.type === 'delete' ? `Voulez-vous supprimer définitivement "${confirmAction.nom}" ? Cette action est irréversible.` :
                `Êtes-vous ABSOLUMENT SÛR de vouloir réinitialiser toute la configuration aux valeurs par défaut ?`}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={onCloseConfirm}>Annuler</Button>
            <Button
              variant={confirmAction.type === 'delete' || confirmAction.type === 'reset' ? 'danger' : 'primary'}
              className="flex-1 h-12"
              onClick={onConfirm}
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BackupModals;

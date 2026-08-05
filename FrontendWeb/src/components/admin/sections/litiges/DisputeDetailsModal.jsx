import { useTranslation } from 'react-i18next';
import { Check, X, User, Car, File } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Bttn';
import { renderStatus, renderPriority, renderType } from './disputeBadges';

// Modal pour les détails du litige
const DisputeDetailsModal = ({ dispute, isOpen, onClose, onResolve, onReject }) => {
  const { t } = useTranslation();

  if (!dispute) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails du litige - ${dispute.id}`}
      size="lg"
    >
      <div className="space-y-6 scroll-me-t-2 overflow-auto h-[70vh]">
        {/* En-tête avec statut et priorité */}
        <div className="flex flex-wrap gap-3">
          {renderStatus(dispute.status, t)}
          {renderPriority(dispute.priority)}
          {renderType(dispute.type, t)}

        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Informations générales</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Titre</p>
                  <p className="font-medium">{dispute.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Description</p>
                  <p className="text-gray-700 dark:text-gray-200">{dispute.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Date de création</p>
                    <p className="font-medium">{dispute.date}</p>
                  </div>

                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Trajet concerné</h3>
              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                <div className="flex items-center justify-center mb-2 gap-10">
                  <div className='text-gray-900 dark:text-gray-100 text-sm font-medium'>Depart <p>{dispute.tripInfo?.depart || 'N/A'}</p></div>
                  <div className='text-gray-900 dark:text-gray-100 text-sm font-medium'>Destination <p>{dispute.tripInfo?.destination || 'N/A'}</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Parties concernées</h3>
              <div className="space-y-3 dark:bg-gray-900/40">
                <div className="bg-green-50 dark:bg-green-900/40 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <User className="w-4 h-4 text-green-500 mr-2" />
                    <span className="font-medium">Passager</span>
                  </div>
                  <p className="text-sm font-medium">{dispute.users.passenger}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/40 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <Car className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="font-medium">Chauffeur</span>
                  </div>
                  <p className="text-sm font-medium">{dispute.users.driver}</p>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Preuves */}
        {dispute.evidence && dispute.evidence.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Preuves jointes</h3>
            <div className="flex flex-wrap gap-2 dark:bg-gray-900/40">
              {dispute.evidence?.map((file, index) => (
                <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-900/40 rounded-lg px-3 py-2">
                  <File className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm">{file}</span>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Commentaires */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Historique des commentaires</h3>
          <div className="space-y-3 dark:bg-gray-900/40">
            {dispute.comments?.map((comment) => (
              <div key={comment.id} className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">{comment.user}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{comment.date}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-200">{comment.message}</p>
              </div>
            ))}
          </div>
        </div>


        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Fermer
          </Button>
          <Button
            variant="success"
            icon={Check}
            onClick={onResolve}
            disabled={dispute.status === 'resolved'}
          >
            Résoudre
          </Button>
          <Button
            variant="danger"
            icon={X}
            onClick={onReject}
            disabled={dispute.status === 'rejected'}
          >
            Rejeter
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DisputeDetailsModal;

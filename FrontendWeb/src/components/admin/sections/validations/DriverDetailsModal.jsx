import { RefreshCw, UserCheck, Phone, Calendar, FileText, Eye, Check, X, XCircle, CheckCircle } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Bttn';
import Badge from '../../ui/Badge';
import Progress from '../../ui/Progress';
import { getFullAssetURL } from '../../../../utils/urlHelper';

const DriverDetailsModal = ({
  isOpen,
  onClose,
  isLoadingDetails,
  selectedDriver,
  onUpdateDocStatus,
  onReject,
  onValidate
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails du chauffeur"
      size="lg"
    >
      {isLoadingDetails ? (
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <p className="text-gray-500">Chargement des documents...</p>
        </div>
      ) : selectedDriver && (
        <div className="space-y-6 scroll-m-t-2 overflow-auto h-full px-2">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-slate-200/30 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-green-100">
              {selectedDriver.utilisateur?.photoUrl ? (
                <img src={getFullAssetURL(selectedDriver.utilisateur.photoUrl)} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserCheck className="text-3xl text-green-500" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {selectedDriver.utilisateur?.prenom} {selectedDriver.utilisateur?.nom}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{selectedDriver.typeVehicule || 'Véhicule non défini'}</p>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Phone className="w-4 h-4 mr-2" />
                  {selectedDriver.utilisateur?.telephone}
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  Inscrit le {new Date(selectedDriver.inscritLe).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-200">Progression de la validation</h4>
              <span className="text-sm font-bold text-green-600">{selectedDriver.progression?.pourcentage}%</span>
            </div>
            <Progress value={selectedDriver.progression?.pourcentage} color="green" />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-200">Documents à vérifier</h4>
            <div className="grid grid-cols-1 gap-3">
              {selectedDriver.documents && selectedDriver.documents.map((doc, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-900">
                  <div className="flex items-center mb-3 sm:mb-0">
                    <div className={`p-2 rounded-lg mr-4 ${doc.statut === 'VALIDE' ? 'bg-green-100/50 text-green-600' :
                      doc.statut === 'REFUSE' ? 'bg-red-100/50 text-red-600' :
                        'bg-yellow-100/50 text-yellow-600'
                      }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 dark:text-gray-100 text-sm">{doc.nom}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.statut === 'VALIDE' ? 'success' : doc.statut === 'REFUSE' ? 'danger' : 'warning'} size="xs">
                          {doc.statut}
                        </Badge>
                        {doc.url && (
                          <a href={getFullAssetURL(doc.url)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">
                            <Eye className="w-3 h-3 mr-1" /> Voir le fichier
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto sm:ml-0">
                    <button
                      onClick={() => onUpdateDocStatus(doc.id, 'VALIDE')}
                      disabled={doc.statut === 'VALIDE'}
                      className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${doc.statut === 'VALIDE' ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-green-500 border border-gray-200 dark:border-gray-700'}`}
                      title="Valider ce document"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onUpdateDocStatus(doc.id, 'REFUSE')}
                      disabled={doc.statut === 'REFUSE'}
                      className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${doc.statut === 'REFUSE' ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 border border-gray-200 dark:border-gray-700'}`}
                      title="Refuser ce document"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t dark:border-gray-800">
            <Button
              variant="secondary"
              className="order-2 sm:order-1"
              onClick={onClose}
            >
              Fermer
            </Button>
            <Button
              variant="danger"
              icon={XCircle}
              className="order-3 sm:order-2"
              onClick={() => {
                onReject(selectedDriver);
                onClose();
              }}
            >
              Rejeter le profil
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle}
              className="order-1 sm:order-3"
              disabled={!selectedDriver.actions?.peutValider}
              onClick={() => {
                onValidate({ id: selectedDriver.id, name: `${selectedDriver.utilisateur?.prenom} ${selectedDriver.utilisateur?.nom}` });
                onClose();
              }}
            >
              {selectedDriver.progression?.pourcentage < 100 ? 'Docs incomplets' : 'Valider le Chauffeur'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DriverDetailsModal;

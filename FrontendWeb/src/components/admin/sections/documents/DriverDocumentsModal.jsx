import { motion } from 'framer-motion';
import { Check, CheckSquare, Square, CheckCircle, XCircle, Trash2, Eye, Download } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Bttn';
import ExportDropdown from '../../ui/ExportDropdown';
import { getFullAssetURL } from '../../../../utils/urlHelper';
import { documentTypes } from './documentConstants';
import { getStatusBadge } from './documentBadges';
import { getDocumentIcon, getTypeColor } from './documentHelpers';

const DriverDocumentsModal = ({
  driver,
  onClose,
  selectedDocuments,
  onSelectDocument,
  onSelectAllDocuments,
  onBatchValidate,
  onBatchReject,
  onCancelSelection,
  onViewDocument,
  onValidateDocument,
  onRejectDocument,
  exportColumns,
  showToast
}) => {
  if (!driver) return null;

  return (
    <Modal
      isOpen={!!driver}
      onClose={onClose}
      title={`Documents de ${driver.name}`}
      size="xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 overflow-hidden shadow-md">
                {driver.photoUrl ? (
                  <img src={getFullAssetURL(driver.photoUrl)} className="w-full h-full object-cover" />
                ) : driver.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{driver.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{driver.phone || ''} {driver.phone && driver.email ? '•' : ''} {driver.email || ''}</p>
                <div className="flex items-center mt-2">
                  <div className="w-48 bg-gray-200 dark:bg-gray-800 rounded-full h-2 mr-3">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${driver.completeness}%` }}
                    />
                  </div>
                  <span className="font-semibold">{driver.completeness}% complet</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Documents</p>
              <p className="text-2xl font-bold">{driver.totalDocuments}</p>
            </div>
          </div>
        </div>

        {/* Actions batch */}
        {selectedDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="font-medium">
                  {selectedDocuments.length} document(s) sélectionné(s)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="small"
                  icon={CheckCircle}
                  onClick={onBatchValidate}
                >
                  Valider
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  icon={XCircle}
                  onClick={onBatchReject}
                >
                  Rejeter
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  icon={Trash2}
                  onClick={onCancelSelection}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Liste des documents */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Tous les documents ({driver.documents.length})</h4>
            <button
              onClick={onSelectAllDocuments}
              className="min-h-11 px-2 -mr-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
            >
              {selectedDocuments.length === driver.documents.length ? (
                <CheckSquare className="w-4 h-4 mr-1" />
              ) : (
                <Square className="w-4 h-4 mr-1" />
              )}
              {selectedDocuments.length === driver.documents.length
                ? 'Tout désélectionner'
                : 'Tout sélectionner'}
            </button>
          </div>

          {driver.documents.map((doc, index) => {
            const DocIcon = getDocumentIcon(doc.type);
            const docType = documentTypes.find(t => t.id === doc.type);
            const isSelected = selectedDocuments.includes(doc.id);

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-lg p-4 transition-all duration-200 ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onSelectDocument(doc.id)}
                      className="w-11 h-11 flex items-center justify-center shrink-0"
                    >
                      <span className={`w-5 h-5 border rounded flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-700'
                        }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </span>
                    </button>
                    <div className={`w-10 h-10 rounded-lg ${getTypeColor(doc.type)} flex items-center justify-center`}>
                      <DocIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{docType?.label || doc.type}</p>
                      <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>Mis en ligne le {new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(doc.statut)}

                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="small"
                        icon={Eye}
                        onClick={() => onViewDocument({
                          id: doc.id,
                          type: doc.type,
                          fileName: docType?.label || doc.type,
                          fileUrl: getFullAssetURL(doc.fichier),
                          owner: { name: driver.name },
                          createdAt: doc.createdAt
                        })}
                        title="Visualiser"
                      />
                      <a
                        href={getFullAssetURL(doc.fichier)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </a>

                      {doc.statut === 'VERIFIER' && (
                        <>
                          <Button
                            variant="ghost"
                            size="small"
                            icon={CheckCircle}
                            onClick={() => onValidateDocument(doc.id)}
                            title="Valider"
                            className="text-green-600 hover:text-green-700"
                          />
                          <Button
                            variant="ghost"
                            size="small"
                            icon={XCircle}
                            onClick={() => onRejectDocument(doc.id)}
                            title="Rejeter"
                            className="text-red-600 hover:text-red-700"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ExportDropdown dans le modal */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Exporter les données</h4>
            <ExportDropdown
              data={(driver.documents || []).map(doc => ({
                ...doc,
                chauffeur: { nom: driver.name || driver.nom || 'Inconnu' }
              }))}
              columns={exportColumns}
              fileName={`documents_${(driver.name || 'chauffeur').toLowerCase().replace(/\s+/g, '_')}`}
              title={`Documents de ${driver.name}`}
              orientation="landscape"
              showToast={showToast}
              onPrint={() => window.print()}
              className="w-auto"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Exportez les documents de {driver.name} en CSV, Word ou PDF
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DriverDocumentsModal;

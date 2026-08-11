import { CheckCircle, Eye, X, Upload, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { documentTypes } from './useDriverRegistrationForm';

// Colonne gauche (documents requis + conseils) - extraite de
// InscriptionChauffeur.jsx (decomposition), aucun changement de
// comportement.
const DocumentUploadList = ({
  driverData,
  uploadProgress,
  previewUrls,
  validationErrors,
  fileInputsRef,
  onFileChange,
  onRemoveFile,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Documents requis
          <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full ml-2">
            Tous obligatoires
          </span>
        </h3>

        <div className="space-y-4">
          {documentTypes.map((doc) => (
            <motion.div
              key={doc.key}
              whileHover={{ y: -2 }}
              className={`border-2 rounded-xl p-4 transition-all ${driverData[doc.key]
                ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                : validationErrors[doc.key]
                  ? 'border-red-300 bg-red-50/50 dark:bg-red-900/10'
                  : 'border-gray-300 dark:border-gray-600 border-dashed hover:border-blue-500'
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      {doc.label}
                    </h4>
                    {doc.required && (
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                        Obligatoire
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {doc.description}
                  </p>

                  {driverData[doc.key] ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {driverData[doc.key].name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(driverData[doc.key].size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {previewUrls[doc.key] && (
                          <button
                            onClick={() => window.open(previewUrls[doc.key], '_blank')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onRemoveFile(doc.key)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                          title="Supprimer"
                        >
                          <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept={doc.accept}
                        onChange={(e) => onFileChange(doc.key, e.target.files[0])}
                        className="hidden"
                        ref={el => fileInputsRef.current[doc.key] = el}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputsRef.current[doc.key]?.click()}
                        className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex flex-col items-center justify-center gap-2"
                      >
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Cliquez pour télécharger
                        </span>
                        <span className="text-xs text-gray-500">
                          Max {doc.maxSize}MB • {doc.accept.includes('image') ? 'Images ou PDF' : 'PDF'}
                        </span>
                      </button>
                    </div>
                  )}

                  {uploadProgress[doc.key] > 0 && uploadProgress[doc.key] < 100 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Envoi en cours...</span>
                        <span>{uploadProgress[doc.key]}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress[doc.key]}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {validationErrors[doc.key] && (
                    <p className="text-red-500 text-xs mt-2">{validationErrors[doc.key]}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Conseils */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">
              Conseils pour des documents valides
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Photos nettes et en couleur
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Documents à jour et valides
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Toutes les informations doivent être visibles
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Éviter les reflets et ombres
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadList;

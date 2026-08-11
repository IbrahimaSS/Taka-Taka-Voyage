import React, { useState, useRef } from 'react';
import {
  Car,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  X,
  AlertCircle,
  Info,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../admin/ui/Bttn';
import Modal from '../admin/ui/Modal';
import { useSettings } from '../../context/SettingsContext';

// Composant pour l'étape documents chauffeur
const InscriptionChauffeur = ({ onBack, onSubmit, formData, showToast }) => {
  const { settings } = useSettings();
  const platform = settings?.platform || {};

  const [driverData, setDriverData] = useState({
    photo: null,
    license: null,
    idCard: null,
    carRegistration: null,
    insurance: null,
    vehicle: {
      brand: '',
      model: '',
      plate: '',
      color: '',
      type: 'voiture_privé',
      capacity: 4,
      year: new Date().getFullYear()
    }
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [showDocumentInfo, setShowDocumentInfo] = useState(false);

  const fileInputsRef = useRef({});

  const documentTypes = [
    {
      key: 'photo',
      label: 'Photo du vehicule',
      description: 'Très claire et identifiable',
      required: true,
      accept: 'image/*,.pdf',
      maxSize: 2,
      info: 'La photo doit être claire et lisible. Assurez-vous que la soit  visibles.'
    },
    {
      key: 'license',
      label: 'Permis de conduire',
      description: 'Recto/verso en couleur',
      required: true,
      accept: 'image/*,.pdf',
      maxSize: 2,
      info: 'Le permis doit être valide et lisible. Assurez-vous que toutes les informations sont visibles.'
    },
    {
      key: 'idCard',
      label: 'Carte d\'identité',
      description: 'Recto/verso en couleur',
      required: true,
      accept: 'image/*,.pdf',
      maxSize: 2,
      info: 'La carte d\'identité doit être en cours de validité. Scannez recto et verso.'
    },
    {
      key: 'carRegistration',
      label: 'Carte grise',
      description: 'Document officiel en cours de validité',
      required: true,
      accept: 'image/*,.pdf',
      maxSize: 2,
      info: 'La carte grise doit correspondre au véhicule utilisé. Vérifiez la date de validité.'
    },
    {
      key: 'insurance',
      label: 'Assurance véhicule',
      description: 'Attestation d\'assurance à jour',
      required: true,
      accept: 'image/*,.pdf',
      maxSize: 2,
      info: 'L\'assurance doit couvrir l\'activité de transport de personnes.'
    }
  ];

  const vehicleTypes = [
    { value: 'moto', label: 'Moto-taxi', icon: '/assets/images/vehicles/moto.png', color: ' bg-gradient-to-r from-blue-100 to-blue-100' },
    { value: 'taxi', label: 'Taxi', icon: '/assets/images/vehicles/taxi.png', color: 'bg-gradient-to-r from-blue-100 to-blue-100' },
    { value: 'voiture_privé', label: 'Voiture privée', icon: '/assets/images/vehicles/car.png', color: 'bg-gradient-to-r from-blue-100 to-blue-100' }
  ];

  const handleFileChange = (key, file) => {
    if (!file) return;

    const docType = documentTypes.find(doc => doc.key === key);
    const maxSize = docType?.maxSize * 1024 * 1024;

    if (file.size > maxSize) {
      showToast('Fichier trop volumineux', `Maximum: ${docType.maxSize}MB`, 'error');
      return;
    }

    if (!docType.accept.includes(file.type.split('/')[0]) && !docType.accept.includes('.pdf')) {
      showToast('Format non supporté', 'Veuillez uploader une image ou un PDF', 'error');
      return;
    }

    setUploadProgress(prev => ({ ...prev, [key]: 0 }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({ ...prev, [key]: progress }));

      if (progress >= 100) {
        clearInterval(interval);

        setDriverData(prevData => ({
          ...prevData,
          [key]: file
        }));

        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          setPreviewUrls(prev => ({ ...prev, [key]: url }));
        }

        setValidationErrors(prev => ({ ...prev, [key]: null }));
        showToast('Document uploadé', `${docType.label} téléchargé avec succès`, 'success');
      }
    }, 100);
  };

  const handleRemoveFile = (key) => {
    setDriverData(prev => ({ ...prev, [key]: null }));
    setUploadProgress(prev => ({ ...prev, [key]: 0 }));

    if (previewUrls[key]) {
      URL.revokeObjectURL(previewUrls[key]);
      setPreviewUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[key];
        return newUrls;
      });
    }
  };

  const handleVehicleChange = (field, value) => {
    setDriverData(prev => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        [field]: value
      }
    }));

    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateDriverData = () => {
    const errors = {};

    // Validate documents
    documentTypes.forEach(doc => {
      if (doc.required && !driverData[doc.key]) {
        errors[doc.key] = `Le ${doc.label.toLowerCase()} est requis`;
      }
    });

    // Validate vehicle information
    if (!driverData.vehicle.brand.trim()) {
      errors.brand = 'La marque du véhicule est requise';
    }
    if (!driverData.vehicle.model.trim()) {
      errors.model = 'Le modèle du véhicule est requis';
    }
    if (!driverData.vehicle.plate.trim()) {
      errors.plate = 'La plaque d\'immatriculation est requise';
    } else if (!/^[A-Z0-9-\s]{5,10}$/.test(driverData.vehicle.plate)) {
      errors.plate = 'Format de plaque invalide';
    }
    if (!driverData.vehicle.color.trim()) {
      errors.color = 'La couleur du véhicule est requise';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateDriverData()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(driverData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = () => {
    return documentTypes.every(doc => !doc.required || driverData[doc.key]) &&
      driverData.vehicle.brand && driverData.vehicle.model && driverData.vehicle.plate;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Document Info Modal */}
      <Modal
        isOpen={showDocumentInfo}
        onClose={() => setShowDocumentInfo(false)}
        title="Guide d'upload des documents"
      >
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
            <Button
              variant="primary"
              onClick={() => setShowDocumentInfo(false)}
            >
              Compris
            </Button>
          </div>
        </div>
      </Modal>

      {/* En-tête */}
      <div className="mb-8 text-center ">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Documents & Véhicule
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Complétez votre profil chauffeur avec vos documents et informations véhicule
        </p>
        <button
          onClick={() => setShowDocumentInfo(true)}
          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2"
        >
          <Info className="w-4 h-4 mr-1" />
          Guide d'upload des documents
        </button>
      </div>

      {/* Contenu en deux colonnes */}
      <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 scrollbar-thin overflow-auto max-h-[65vh]">
        {/* Colonne gauche : Documents */}
        <div className="space-y-6">
          <div className="  border-gray-100 dark:border-gray-700 p-6">
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
                              onClick={() => handleRemoveFile(doc.key)}
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
                            onChange={(e) => handleFileChange(doc.key, e.target.files[0])}
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

        {/* Colonne droite : Véhicule */}
        <div className="space-y-6">
          <div className="  border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-green-500" />
              Informations du véhicule
            </h3>

            <div className="space-y-6">
              {/* Type de véhicule */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-3 font-medium">
                  Type de véhicule
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {vehicleTypes.map((type) => (
                    <button
                      type="button"
                      key={type.value}
                      onClick={() => handleVehicleChange('type', type.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${driverData.vehicle.type === type.value
                        ? `border-blue-500 bg-gradient-to-r ${type.color} bg-opacity-10`
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                    >
                      <div className="w-16 h-12 mb-3 mx-auto flex items-center justify-center">
                        <img src={type.icon} alt={type.label} className="max-w-full max-h-full object-contain drop-shadow-md" />
                      </div>
                      <span className={`text-sm font-medium ${driverData.vehicle.type === type.value
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                        }`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulaire véhicule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Marque
                  </label>
                  <input
                    type="text"
                    value={driverData.vehicle.brand}
                    onChange={(e) => handleVehicleChange('brand', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${validationErrors.brand
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent`}
                    placeholder="Toyota"
                  />
                  {validationErrors.brand && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.brand}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Modèle
                  </label>
                  <input
                    type="text"
                    value={driverData.vehicle.model}
                    onChange={(e) => handleVehicleChange('model', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${validationErrors.model
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent`}
                    placeholder="Corolla"
                  />
                  {validationErrors.model && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.model}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Immatriculation
                  </label>
                  <input
                    type="text"
                    value={driverData.vehicle.plate}
                    onChange={(e) => handleVehicleChange('plate', e.target.value.toUpperCase())}
                    className={`w-full px-4 py-3 rounded-xl border ${validationErrors.plate
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent font-mono`}
                    placeholder="AB-123-CD"
                  />
                  {validationErrors.plate && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.plate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Couleur
                  </label>
                  <input
                    type="text"
                    value={driverData.vehicle.color}
                    onChange={(e) => handleVehicleChange('color', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${validationErrors.color
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent`}
                    placeholder="Blanc"
                  />
                  {validationErrors.color && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.color}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Année
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    value={driverData.vehicle.year}
                    onChange={(e) => handleVehicleChange('year', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Capacité (nombre de places)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={driverData.vehicle.capacity}
                      onChange={(e) => handleVehicleChange('capacity', e.target.value)}
                      className="flex-1 accent-blue-600 dark:accent-green-500"
                    />
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400 min-w-[3rem]">
                      {driverData.vehicle.capacity} place{driverData.vehicle.capacity > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
            <h4 className="font-medium text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Récapitulatif
            </h4>
            <div className="space-y-3">
              {documentTypes.map((doc) => (
                <div key={doc.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{doc.label}</span>
                  {driverData[doc.key] ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800 dark:text-white">Véhicule</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {driverData.vehicle.brand ? `${driverData.vehicle.brand} ${driverData.vehicle.model}` : 'Non spécifié'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onBack}
          icon={ArrowLeft}
          iconSize="medium"
          className="w-full sm:w-auto"
        >
          Retour
        </Button>

        <Button
          type="button"
          variant={isStepComplete() ? "primary" : "secondary"}
          size="lg"
          onClick={handleSubmit}
          disabled={!isStepComplete() || isSubmitting}
          loading={isSubmitting}
          icon={!isSubmitting ? ChevronRight : undefined}
          iconSize="medium"
          className="w-full sm:w-auto"
        >
          {isSubmitting ? 'Enregistrement...' : 'Finaliser l\'inscription'}
        </Button>
      </div>
    </motion.div>
  );
};

export default InscriptionChauffeur;

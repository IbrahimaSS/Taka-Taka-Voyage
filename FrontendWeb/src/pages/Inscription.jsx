import React, { useState, useEffect, useRef } from 'react';
import {
  Car,
  User,
  Shield,
  ArrowLeft,
  ArrowRight,
  Check,
  Star,
  ChartLine,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  Smartphone,
  Mail,
  Lock,
  Clock,
  Users,
  ChevronRight,
  Upload,
  FileText,
  X,
  Camera,
  AlertCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/admin/ui/Bttn';
import Modal from '../components/admin/ui/Modal';
import ConfirmModal from '../components/admin/ui/ConfirmModal';
import Toast from '../components/admin/ui/Toast';
import { authService } from '../services/authService';
import { chauffeurService } from '../services/chauffeurService';

// Composant pour l'étape documents chauffeur
const InscriptionChauffeur = ({ onBack, onSubmit, formData, showToast }) => {
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
      description: 'Tes claire et indentifiable',
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
    { value: 'moto', label: 'Moto-taxi', icon: '🏍️', color: 'from-blue-100 to-blue-100' },
    { value: 'taxi', label: 'Taxi', icon: '🚕', color: 'from-blue-100 to-blue-100' },
    { value: 'voiture_privé', label: 'Voiture privée', icon: '🚗', color: 'from-blue-100 to-blue-100' }
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

    // TODO API (documents chauffeur + vehicule):
    // Remplacer le mock ci-dessous par:
    // - upload des documents (FormData) vers API_ROUTES.drivers.documents(driverId)
    // - sauvegarde du vehicule vers API_ROUTES.drivers.details(driverId) ou /vehicles
    // - retour statut chauffeur = pending
    //
    // Voir: src/services/driverService.js et src/services/apiRoutes.js

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
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <Shield className="w-10 h-10 text-white" />
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
      <div className="md:max-w-10xl w-full mx-auto  grid grid-cols-1 lg:grid-cols-2 gap-8  scrollbar-thin overflow-auto h-[65vh]">
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
                <div className="grid grid-cols-3 gap-3">
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
                      <div className="text-2xl mb-2">{type.icon}</div>
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
              <div className="grid grid-cols-2 gap-4">
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

                <div className="col-span-2">
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

                <div className="col-span-2">
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
          fullWidth={window.innerWidth < 640}
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
          fullWidth={window.innerWidth < 640}
        >
          {isSubmitting ? 'Enregistrement...' : 'Finaliser l\'inscription'}
        </Button>
      </div>
    </motion.div>
  );
};

const Inscription = () => {
  const [currentStep, setCurrentStep] = useState(1);  // pour  
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    genre: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ['', '', '', '', '', ''],
    termsAccepted: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: '#6b7280'
  });
  const [otpTimer, setOtpTimer] = useState(60);
  const [generatedOtp, setGeneratedOtp] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showStepModal, setShowStepModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'info' });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // useEffect(() => {
  //   const typeFromUrl = searchParams.get('type');
  //   if (typeFromUrl === 'passenger' || typeFromUrl === 'driver') {
  //     setUserType(typeFromUrl);
  //   }

  //   const otp = Math.floor(100000 + Math.random() * 900000);
  //   setGeneratedOtp(otp);
  //   console.log('Code OTP (pour test):', otp);
  // }, [searchParams]);

  useEffect(() => {
    let interval;
    if (currentStep === 3 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, otpTimer]);

  const showToast = (title, message, type = 'info') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 5000);
  };

  const buildInscriptionPayload = () => ({
    nom: formData.lastName,
    prenom: formData.firstName,
    telephone: formData.phone.replace(/\s/g, ''),
    genre: formData.genre,
    email: formData.email,
    motDePasse: formData.password,
    typeProfil: userType === 'driver' ? 'CHAUFFEUR' : 'PASSAGER',
  });

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    showToast('Type de compte sélectionné',
      type === 'passenger'
        ? 'Vous avez choisi le compte Passager'
        : 'Vous avez choisi le compte Chauffeur',
      'success');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Calcul de la force du mot de passe
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData(prev => ({ ...prev, otp: newOtp }));
    setOtpVerified(false);

    if (value && index < 5) {
      setActiveOtpIndex(index + 1);
    }

    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      autoVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      setActiveOtpIndex(index - 1);
    }
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    let message = '';
    let color = '#6b7280';

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 0:
        message = 'Très faible';
        color = '#ef4444';
        break;
      case 1:
        message = 'Faible';
        color = '#f97316';
        break;
      case 2:
        message = 'Moyen';
        color = '#eab308';
        break;
      case 3:
        message = 'Bon';
        color = '#22c55e';
        break;
      case 4:
        message = 'Très bon';
        color = '#0d8c6f';
        break;
    }

    setPasswordStrength({ score, message, color });
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!userType) {
        errors.userType = 'Veuillez sélectionner un type de compte';
      }
    }

    if (step === 2) {
      const { firstName, lastName, phone, genre, email, password, confirmPassword } = formData;

      if (!firstName.trim()) {
        errors.firstName = 'Le prénom est requis';
      } else if (firstName.length < 2) {
        errors.firstName = 'Le prénom doit contenir au moins 2 caractères';
      }

      if (!lastName.trim()) {
        errors.lastName = 'Le nom est requis';
      } else if (lastName.length < 2) {
        errors.lastName = 'Le nom doit contenir au moins 2 caractères';
      }

      if (!phone.trim()) {
        errors.phone = 'Le numéro de téléphone est requis';
      } else if (!/^\d{9}$/.test(phone.replace(/\s/g, ''))) {
        errors.phone = 'Numéro de téléphone invalide (9 chiffres requis)';
      }

      if (!genre.trim()) {
        errors.genre = 'Le genre est requis';
      } else if (genre.trim() !== 'MASCULIN' && genre.trim() !== 'FEMININ') {
        errors.genre = 'Genre invalide';
      }

      if (!email.trim()) {
        errors.email = "L'email est requis";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.email = "L'email est invalide";
        }
      }

      if (!password) {
        errors.password = 'Le mot de passe est requis';
      } else if (password.length < 8) {
        errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      }

      if (!confirmPassword) {
        errors.confirmPassword = 'La confirmation du mot de passe est requise';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    if (step === 3) {
      if (!formData.termsAccepted) {
        errors.termsAccepted = "Vous devez accepter les conditions d'utilisation";
      }

      const otpValue = formData.otp.join('');
      if (otpValue.length !== 6) {
        errors.otp = 'Le code de vérification doit contenir 6 chiffres';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = async () => {
    if (!validateStep(currentStep)) {
      showToast('Validation échouée', 'Veuillez vérifier les champs du formulaire', 'error');
      return;
    }

    // Show modal for step transition
    if (currentStep === 1 && userType) {
      setShowStepModal(true);
      return;
    }

    // Lors du passage à l'OTP, initier l'inscription côté backend
    if (currentStep === 2) {
      setIsSubmitting(true);
      try {
        await authService.initInscription(buildInscriptionPayload());
        showToast('Code envoyé', 'Un code OTP a été envoyé à votre numéro', 'success');
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        const apiMessage = error?.response?.data?.message;
        const apiError = error?.response?.data?.erreurs?.[0]?.msg;
        showToast(
          'Erreur inscription',
          apiMessage || apiError || 'Impossible d\'initier l\'inscription',
          'error'
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const resendOtp = async () => {
    if (otpTimer > 0) {
      showToast('Temps d\'attente', `Veuillez attendre ${otpTimer} secondes`, 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.initInscription(buildInscriptionPayload());
      setOtpTimer(60);
      setOtpVerified(false);
      showToast('Code renvoyé', 'Un nouveau code a été envoyé à votre numéro', 'success');
      setFormData(prev => ({ ...prev, otp: ['', '', '', '', '', ''] }));
      setActiveOtpIndex(0);
    } catch (error) {
      setOtpVerified(false);
      showToast(
        'Erreur OTP',
        error?.response?.data?.message || 'Impossible de renvoyer le code',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const autoVerifyOtp = async (otp) => {
    try {
      await authService.verifyOtp({ telephone: formData.phone.replace(/\\s/g, ''), code: otp });
      setOtpVerified(true);
      showToast('Code correct', 'Vérification réussie !', 'success');
    } catch (error) {
      setOtpVerified(false);
      showToast(
        'Code invalide',
        error?.response?.data?.message || 'Le code OTP est incorrect',
        'error'
      );
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    setIsSubmitting(true);


    try {
      const otpValue = formData.otp.join('');
      if (!otpVerified) {
        await authService.verifyOtp({ telephone: formData.phone.replace(/\\s/g, ''), code: otpValue });
        setOtpVerified(true);
      }

      await authService.finaliserInscription(buildInscriptionPayload());

      if (userType === 'driver') {
        await authService.login({
          identifiant: formData.phone.replace(/\\s/g, ''),
          motDePasse: formData.password,
        });
        setCurrentStep(4);
        showToast('Informations sauvegard�es', 'Passez maintenant aux documents du chauffeur', 'success');
      } else {
        showToast('Compte cr�� !', 'Votre compte passager a �t� cr�� avec succ�s', 'success');
        setTimeout(() => {
          navigate('/connexion');
        }, 2000);
      }
    } catch (error) {
      showToast(
        'Erreur inscription',
        error?.response?.data?.message || 'Impossible de finaliser l\'inscription',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDriverFinalSubmit = async (driverData) => {
    setIsSubmitting(true);

    try {
      await chauffeurService.updateVehicule({
        typeVehicule: driverData.vehicle.type,
        marque: driverData.vehicle.brand,
        modele: driverData.vehicle.model,
        plaque: driverData.vehicle.plate,
        couleur: driverData.vehicle.color,
        capacite: driverData.vehicle.capacity,
        annee: driverData.vehicle.year,
      });

      const formDataDocs = new FormData();
      if (driverData.photo) formDataDocs.append('photo', driverData.photo);
      if (driverData.license) formDataDocs.append('license', driverData.license);
      if (driverData.idCard) formDataDocs.append('idCard', driverData.idCard);
      if (driverData.carRegistration) formDataDocs.append('carRegistration', driverData.carRegistration);
      if (driverData.insurance) formDataDocs.append('insurance', driverData.insurance);

      await chauffeurService.uploadDocuments(formDataDocs);

      showToast('Inscription compl�te', 'Votre demande est en cours de validation', 'success');
      setTimeout(() => {
        navigate('/validation-en-attente');
      }, 1500);
    } catch (error) {
      showToast(
        'Erreur documents',
        error?.response?.data?.message || 'Impossible d\'envoyer les documents',
        'error'
      );
      console.log(error?.response?.data?.message)
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    const totalSteps = userType === 'driver' ? 4 : 3;
    return ((currentStep - 1) / (totalSteps - 1)) * 100;
  };

  const isPasswordMatch = () => {
    return formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;
  };

  const getStepModalContent = () => {
    if (currentStep === 1 && userType === 'passenger') {
      return {
        title: 'Étape suivante : Informations personnelles',
        content: 'Vous allez maintenant renseigner vos informations personnelles. Assurez-vous d\'avoir votre numéro de téléphone à portée de main.'
      };
    }
    if (currentStep === 1 && userType === 'driver') {
      return {
        title: 'Important pour les chauffeurs',
        content: 'En tant que chauffeur, vous devrez fournir des documents supplémentaires (permis, carte grise, assurance) et des informations sur votre véhicule.'
      };
    }
    return {
      title: 'Confirmer l\'étape',
      content: 'Êtes-vous prêt à passer à l\'étape suivante ?'
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 bg-gradient-to-br from-primary-50 to-secondary-100  dark:from-gray-800  dark:bg-slate-900">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Step Transition Modal */}
      <ConfirmModal
        isOpen={showStepModal}
        onClose={() => setShowStepModal(false)}
        onConfirm={() => {
          setCurrentStep(prev => prev + 1);
          setShowStepModal(false);
        }}
        title={getStepModalContent().title}
        message={getStepModalContent().content}
        type="info"
        confirmText="Continuer"
        cancelText="Revenir"
      />

      {/* Terms Modal */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Conditions d'utilisation"
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Mentions importantes</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              En créant un compte Taka Taka, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium text-gray-800 dark:text-gray-200">1. Utilisation du service</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Le service Taka Taka permet la mise en relation entre passagers et chauffeurs pour des trajets urbains.
            </p>

            <h5 className="font-medium text-gray-800 dark:text-gray-200">2. Données personnelles</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vos données sont collectées et traitées conformément à notre politique de confidentialité.
            </p>

            <h5 className="font-medium text-gray-800 dark:text-gray-200">3. Responsabilités</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Les utilisateurs sont responsables du respect des lois en vigueur lors de l'utilisation du service.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              onClick={() => setShowTermsModal(false)}
            >
              Compris
            </Button>
          </div>
        </div>
      </Modal>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-1/3 lg:w-1/4 bg-gradient-to-b from-blue-900 to-green-900 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute w-64 h-64 bg-white/5 rounded-full -top-32 -left-32"></div>
            <div className="absolute w-96 h-96 bg-green-500/10 rounded-full -bottom-48 -right-48"></div>
          </div>

          <div className="relative z-10 p-8 flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg">
                <Car className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TAKA TAKA</h1>
                <p className="text-sm text-blue-200">Mobilité Intelligente</p>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mb-8">
              <a
                href="/"
                className="inline-flex items-center text-blue-200 hover:text-white text-sm transition-colors group bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/10"
              >
                <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={16} />
                Retour à l'accueil
              </a>
            </div>

            {/* Navigation des étapes */}
            <nav className="space-y-6 mb-12">
              {/* Étape 1 */}
              <div className={`flex items-center gap-4 p-3 rounded-xl transition-all ${currentStep >= 1 ? 'bg-white/10' : 'opacity-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-white text-green-600' : 'bg-white/10 text-white'}`}>
                  {currentStep > 1 ? <Check size={16} /> : '1'}
                </div>
                <div>
                  <p className="font-semibold text-white">Profil</p>
                  <p className="text-sm text-blue-200">Choisissez votre type de compte</p>
                </div>
              </div>

              {/* Étape 2 */}
              <div className={`flex items-center gap-4 p-3 rounded-xl transition-all ${currentStep >= 2 ? 'bg-white/10' : 'opacity-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-white text-green-600' : 'bg-white/10 text-white'}`}>
                  {currentStep > 2 ? <Check size={16} /> : '2'}
                </div>
                <div>
                  <p className="font-semibold text-white">Informations</p>
                  <p className="text-sm text-blue-200">Renseignez vos coordonnées</p>
                </div>
              </div>

              {/* Étape 3 */}
              <div className={`flex items-center gap-4 p-3 rounded-xl transition-all ${currentStep >= 3 ? 'bg-white/10' : 'opacity-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-white text-green-600' : 'bg-white/10 text-white'}`}>
                  {currentStep > 3 ? <Check size={16} /> : '3'}
                </div>
                <div>
                  <p className="font-semibold text-white">Vérification</p>
                  <p className="text-sm text-blue-200">Confirmez votre identité</p>
                </div>
              </div>

              {/* Étape 4 (uniquement pour chauffeurs) */}
              {userType === 'driver' && (
                <div className={`flex items-center gap-4 p-3 rounded-xl transition-all ${currentStep >= 4 ? 'bg-white/10' : 'opacity-50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 4 ? 'bg-white text-green-600' : 'bg-white/10 text-white'}`}>
                    {currentStep > 4 ? <Check size={16} /> : '4'}
                  </div>
                  <div>
                    <p className="font-semibold text-white">Documents</p>
                    <p className="text-sm text-blue-200">Véhicule et pièces justificatives</p>
                  </div>
                </div>
              )}
            </nav>

            {/* Statistiques */}
            <div className="mt-auto pt-8 border-t border-white/20">
              <p className="text-sm text-blue-200 mb-4">Rejoignez notre communauté</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-2xl font-bold text-green-300">50K+</p>
                  <p className="text-xs text-blue-200">Utilisateurs</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-2xl font-bold text-yellow-300">4.8★</p>
                  <p className="text-xs text-blue-200">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-3xl">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-3 mb-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg">
                <Car className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">TAKA TAKA</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Mobilité Intelligente</p>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="mb-8">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-green-600 transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <h1 className={`text-2xl font-bold ${userType === 'passenger' ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'}`}>
                  {userType === 'passenger' ? 'Compte Passager' : ''}
                  {userType === 'driver' ? 'Compte Chauffeur' : ''}
                  {!userType && 'Création de compte'}
                </h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Étape {currentStep} sur {userType === 'driver' ? 4 : 3}
                </span>
              </div>
            </div>

            {/* Conteneur du formulaire   bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700  */}
            <div className=" p-6 md:p-8  ">
              <AnimatePresence mode="wait">
                {/* Étape 1: Type de compte */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="animate-fade-in"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choisissez votre profil</h2>
                        <p className="text-gray-600 dark:text-gray-300">Sélectionnez le type de compte qui correspond à vos besoins</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast('Information', 'Choisissez entre passager (réserver des trajets) ou chauffeur (proposer des trajets)', 'info')}
                        className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                      >
                        <Info size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ">
                      {/* Option Passager */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`option-card rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 border-2 ${userType === 'passenger'
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                        onClick={() => handleUserTypeSelect('passenger')}
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 flex items-center justify-center mb-4 mx-auto">
                          <User className="text-blue-600 dark:text-blue-400 text-2xl" />
                        </div>
                        <h3 className={`text-lg font-bold text-center mb-3 ${userType === 'passenger' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>Passager</h3>
                        <p className={`text-center text-sm mb-4 ${userType === 'passenger' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                          Voyagez facilement, rapidement et en toute sécurité
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <CheckCircle className="text-green-500 mr-2" size={14} />
                            <span className={userType === 'passenger' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}>Réservation en 30 secondes</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <CheckCircle className="text-green-500 mr-2" size={14} />
                            <span className={userType === 'passenger' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}>Support 24h/24</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <CheckCircle className="text-green-500 mr-2" size={14} />
                            <span className={userType === 'passenger' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}>Paiement sécurisé</span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Option Chauffeur */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`option-card rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 border-2 ${userType === 'driver'
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-300'}`}
                        onClick={() => handleUserTypeSelect('driver')}
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 flex items-center justify-center mb-4 mx-auto">
                          <Car className="text-green-600 dark:text-green-400 text-2xl" />
                        </div>
                        <h3 className={`text-lg font-bold text-center mb-3 ${userType === 'driver' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>Chauffeur</h3>
                        <p className={`text-center text-sm mb-4 ${userType === 'driver' ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
                          Gagnez de l'argent en conduisant, gérez vos horaires librement
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <CheckCircle className="text-green-500 mr-2" size={14} />
                            <span className={userType === 'driver' ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}>Revenus garantis</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <CheckCircle className="text-green-500 mr-2" size={14} />
                            <span className={userType === 'driver' ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}>Horaires flexibles</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <CheckCircle className="text-green-500 mr-2" size={14} />
                            <span className={userType === 'driver' ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}>Assistance technique</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {validationErrors.userType && (
                      <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <div className="flex items-center">
                          <AlertTriangle className="text-red-500 mr-2" size={16} />
                          <span className="text-red-600 dark:text-red-400 text-sm">{validationErrors.userType}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        onClick={handleNextStep}
                        disabled={!userType}
                        icon={ArrowRight}
                        iconSize="medium"
                      >
                        Continuer
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Étape 2: Informations */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="animate-fade-in"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Vos informations</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">Renseignez vos coordonnées pour créer votre compte</p>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                            Prénom
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border ${validationErrors.firstName
                              ? 'border-red-500 focus:ring-red-500/50'
                              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                            placeholder="Votre prénom"
                          />
                          {validationErrors.firstName && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                            Nom
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border ${validationErrors.lastName
                              ? 'border-red-500 focus:ring-red-500/50'
                              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                            placeholder="Votre nom de famille"
                          />
                          {validationErrors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                            Numéro de téléphone
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-4 border-2 border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-l-lg font-medium">
                              +224
                            </span>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className={`flex-1 px-4 py-3 rounded-r-xl border-2 border-l-0 ${validationErrors.phone
                                ? 'border-red-500 focus:ring-red-500/50'
                                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                              placeholder="XX XX XX XX"
                            />
                          </div>
                          {validationErrors.phone && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                          )}
                        </div>
                        {/* Genre liste deroulante */}
                        <div className="">
                          <label htmlFor="genre" onChange={handleInputChange} className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Genre</label>
                          <select value={formData.genre} name="genre" className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 focus:ring-blue-500/50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all" id="genre" onChange={handleInputChange}>
                            <option value="">Genre</option>
                            <option value="MASCULIN">MASCULIN</option>
                            <option value="FEMININ">FEMININ</option>
                          </select>
                        </div>

                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                          Adresse email
                        </label>
                        <div className="flex">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`flex-1 px-4 py-3 rounded-r-xl border-2 border-l-0 ${validationErrors.email
                              ? 'border-red-500 focus:ring-red-500/50'
                              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}

                            placeholder="votre@email.com"
                          />
                        </div>
                        {validationErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                            Mot de passe
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 pr-12 rounded-xl border ${validationErrors.password
                                ? 'border-red-500 focus:ring-red-500/50'
                                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                              placeholder="Minimum 8 caractères"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                          {validationErrors.password && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                              {passwordStrength.message}
                            </span>
                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all duration-300"
                                style={{
                                  width: `${passwordStrength.score * 25}%`,
                                  backgroundColor: passwordStrength.color
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                            Confirmer le mot de passe
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 pr-12 rounded-xl border ${validationErrors.confirmPassword
                                ? 'border-red-500 focus:ring-red-500/50'
                                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                              placeholder="Retapez votre mot de passe"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                          {validationErrors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
                          )}
                          {formData.confirmPassword && !validationErrors.confirmPassword && (
                            <div className="flex items-center gap-1 mt-2">
                              {isPasswordMatch() ? (
                                <>
                                  <CheckCircle className="text-green-500" size={14} />
                                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    Les mots de passe correspondent
                                  </span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="text-red-500" size={14} />
                                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                    Les mots de passe ne correspondent pas
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        onClick={handlePrevStep}
                        icon={ArrowLeft}
                        iconSize="medium"
                      >
                        Retour
                      </Button>

                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        onClick={handleNextStep}
                        loading={isSubmitting}
                        icon={isSubmitting ? undefined : CheckCircle}
                        iconSize="medium"

                      >
                        {isSubmitting ? 'Création en cours...' : 'Continuer'}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Étape 3: Vérification */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="animate-fade-in"
                  >
                    <div className="text-center mb-8">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Shield className="text-blue-600 dark:text-blue-400 text-3xl" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Vérification</h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        Nous avons envoyé un code à 6 chiffres à votre numéro
                      </p>
                    </div>

                    <div className="text-center mb-6">
                      <p className="font-bold text-gray-900 dark:text-white text-lg">
                        +225 {formData.phone}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Code valide pendant{' '}
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {otpTimer}
                        </span>{' '}
                        secondes
                      </p>
                    </div>

                    <div className="flex justify-center items-center gap-2 mb-8">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <React.Fragment key={index}>
                          <input
                            type="text"
                            maxLength="1"
                            value={formData.otp[index]}
                            onChange={(e) => handleOtpChange(e.target.value, index)}
                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                            onFocus={() => setActiveOtpIndex(index)}
                            className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all ${formData.otp[index]
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-300 dark:border-gray-600'
                              } ${activeOtpIndex === index ? 'ring-2 ring-blue-500/50' : ''}`}
                            ref={ref => {
                              if (ref && activeOtpIndex === index) {
                                ref.focus();
                              }
                            }}
                          />
                          {index === 2 && (
                            <span className="h-16 flex items-center text-gray-400 dark:text-gray-500 font-bold text-xl mx-2">
                              -
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {validationErrors.otp && (
                      <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <div className="flex items-center">
                          <AlertTriangle className="text-red-500 mr-2" size={16} />
                          <span className="text-red-600 dark:text-red-400 text-sm">{validationErrors.otp}</span>
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Vous n'avez pas reçu le code ?</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resendOtp}
                        disabled={otpTimer > 0}
                        icon={RefreshCw}
                        iconSize="medium"
                        className={otpTimer > 0 ? '[&>svg]:animate-spin' : ''}
                      >
                        {otpTimer > 0 ? `Renvoyer (${otpTimer}s)` : 'Renvoyer le code'}
                      </Button>
                    </div>

                    <div className="flex items-start mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                      <div className="mr-3">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={formData.termsAccepted}
                          onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                          className="hidden"
                        />
                        <label htmlFor="terms" className="cursor-pointer">
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${formData.termsAccepted
                            ? 'bg-green-600 border-green-600'
                            : 'border-gray-300 dark:border-gray-600'
                            }`}>
                            {formData.termsAccepted && <Check className="text-white" size={14} />}
                          </div>
                        </label>
                      </div>
                      <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300 flex-1 cursor-pointer">
                        J'accepte les{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold hover:underline"
                        >
                          Conditions d'utilisation
                        </button>{' '}
                        et la{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold hover:underline"
                        >
                          Politique de confidentialité
                        </button>{' '}
                        de Taka Taka
                      </label>
                    </div>

                    {validationErrors.termsAccepted && (
                      <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <div className="flex items-center">
                          <AlertTriangle className="text-red-500 mr-2" size={16} />
                          <span className="text-red-600 dark:text-red-400 text-sm">{validationErrors.termsAccepted}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handlePrevStep}
                        icon={ArrowLeft}
                        iconSize="medium"
                      >
                        Retour
                      </Button>

                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        icon={isSubmitting ? undefined : CheckCircle}
                        iconSize="medium"
                      >
                        {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Étape 4: Documents et véhicule (uniquement pour chauffeurs) */}
                {currentStep === 4 && userType === 'driver' && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <InscriptionChauffeur
                      onBack={() => setCurrentStep(3)}
                      onSubmit={handleDriverFinalSubmit}
                      formData={formData}
                      showToast={showToast}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Liens */}
            <div className="text-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                Vous avez déjà un compte ?{' '}
                <a href="/connexion" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold ml-2 hover:underline">
                  Se connecter
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscription;






















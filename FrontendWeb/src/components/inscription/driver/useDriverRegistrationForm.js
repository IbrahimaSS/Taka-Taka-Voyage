import { useState, useRef } from 'react';

// Documents requis et types de vehicule - extraits tel quel de
// InscriptionChauffeur.jsx (decomposition).
export const documentTypes = [
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

export const vehicleTypes = [
  { value: 'moto', label: 'Moto-taxi', icon: '/assets/images/vehicles/moto.png', color: ' bg-gradient-to-r from-blue-100 to-blue-100' },
  { value: 'taxi', label: 'Taxi', icon: '/assets/images/vehicles/taxi.png', color: 'bg-gradient-to-r from-blue-100 to-blue-100' },
  { value: 'voiture_privé', label: 'Voiture privée', icon: '/assets/images/vehicles/car.png', color: 'bg-gradient-to-r from-blue-100 to-blue-100' }
];

export const useDriverRegistrationForm = ({ onSubmit, showToast }) => {
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

    documentTypes.forEach(doc => {
      if (doc.required && !driverData[doc.key]) {
        errors[doc.key] = `Le ${doc.label.toLowerCase()} est requis`;
      }
    });

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

  return {
    driverData, uploadProgress, isSubmitting, previewUrls, validationErrors,
    showDocumentInfo, setShowDocumentInfo,
    fileInputsRef,
    handleFileChange, handleRemoveFile, handleVehicleChange, handleSubmit,
    isStepComplete,
  };
};

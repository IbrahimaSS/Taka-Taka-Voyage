import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { litigeService } from '../../../services/litigeService';
import { tripService } from '../../../services/tripService';

export const useSupportForm = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    attachDetails: false,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error(`Type de fichier non supporté: ${file.name}`);
        return false;
      }

      if (file.size > maxSize) {
        toast.error(`Fichier trop volumineux: ${file.name} (max 5MB)`);
        return false;
      }

      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject || !formData.description) {
      toast.error(t('support.error_fields'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Mapping des types pour correspondre à l'enum du backend : PAIEMENT, COMPORTEMENT, TRAJET, ACCIDENT, AGRESSION, URGENCE_MEDICALE, DANGER, AUTRE
      const typeMapping = {
        'trip_problem': 'TRAJET',
        'payment_problem': 'PAIEMENT',
        'driver_problem': 'COMPORTEMENT',
        'account_question': 'AUTRE',
        'suggestion': 'AUTRE',
        'other': 'AUTRE'
      };

      let finalData = {
        type: typeMapping[formData.subject] || 'AUTRE',
        description: formData.description,
        piecesJointes: uploadedFiles.map(f => f.name),
      };

      // Si l'utilisateur veut joindre les détails du dernier trajet
      if (formData.attachDetails) {
        try {
          const { data } = await tripService.getPassengerHistory({ limit: 1 });
          if (data.succes && data.trajets.length > 0) {
            // Le backend attend "reservation" (ObjectId)
            finalData.reservation = data.trajets[0].reservation;

            if (!finalData.reservation) {
              // Fallback au cas où le champ reservation du trajet est manquant (peu probable mais sécurité)
              finalData.reservation = data.trajets[0]._id;
            }
          }
        } catch (tripErr) {
          console.error("Erreur lors de la récupération du dernier trajet:", tripErr);
        }
      }

      const response = await litigeService.creerLitige(finalData);

      if (response.data.succes) {
        setShowSuccessModal(true);
        setFormData({ subject: '', description: '', attachDetails: false });
        setUploadedFiles([]);
        toast.success(t('support.send_success'));
      } else {
        throw new Error(response.data.message || "Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("Erreur support:", error);
      toast.error(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData, setFormData,
    showSuccessModal, setShowSuccessModal,
    isSubmitting,
    uploadedFiles,
    handleFileUpload,
    removeFile,
    handleSubmit,
  };
};

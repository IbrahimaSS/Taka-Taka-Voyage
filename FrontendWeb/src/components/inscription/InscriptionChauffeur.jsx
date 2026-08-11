import { Shield, Info, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../admin/ui/Bttn';
import { useDriverRegistrationForm } from './driver/useDriverRegistrationForm';
import DocumentUploadList from './driver/DocumentUploadList';
import VehicleInfoForm from './driver/VehicleInfoForm';
import DocumentInfoModal from './driver/DocumentInfoModal';

// Etape 4 de l'inscription (documents + vehicule chauffeur) - orchestrateur.
// Decompose en hook + sous-composants (voir components/inscription/driver/),
// aucun changement de comportement en dehors des corrections deja
// appliquees (faute de frappe, fullWidth CSS-first, classe Tailwind
// invalide).
const InscriptionChauffeur = ({ onBack, onSubmit, showToast }) => {
  const {
    driverData, uploadProgress, isSubmitting, previewUrls, validationErrors,
    showDocumentInfo, setShowDocumentInfo,
    fileInputsRef,
    handleFileChange, handleRemoveFile, handleVehicleChange, handleSubmit,
    isStepComplete,
  } = useDriverRegistrationForm({ onSubmit, showToast });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <DocumentInfoModal isOpen={showDocumentInfo} onClose={() => setShowDocumentInfo(false)} />

      {/* En-tête */}
      <div className="mb-8 text-center">
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
        <DocumentUploadList
          driverData={driverData}
          uploadProgress={uploadProgress}
          previewUrls={previewUrls}
          validationErrors={validationErrors}
          fileInputsRef={fileInputsRef}
          onFileChange={handleFileChange}
          onRemoveFile={handleRemoveFile}
        />
        <VehicleInfoForm
          driverData={driverData}
          validationErrors={validationErrors}
          onVehicleChange={handleVehicleChange}
        />
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

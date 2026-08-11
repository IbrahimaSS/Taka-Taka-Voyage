import { Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/admin/ui/Modal';
import ConfirmModal from '../components/admin/ui/ConfirmModal';
import Toast from '../components/admin/ui/Toast';
import Button from '../components/admin/ui/Bttn';
import { useSettings } from '../context/SettingsContext';
import InscriptionChauffeur from '../components/inscription/InscriptionChauffeur';
import InscriptionSidebar from '../components/inscription/InscriptionSidebar';
import StepUserType from '../components/inscription/StepUserType';
import StepPersonalInfo from '../components/inscription/StepPersonalInfo';
import StepOtpVerification from '../components/inscription/StepOtpVerification';
import { useInscriptionFlow } from '../components/inscription/useInscriptionFlow';

const Inscription = () => {
  const { settings } = useSettings();
  const platform = settings?.platform || {};

  const {
    currentStep, userType, formData,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    passwordStrength, otpTimer, isSubmitting,
    activeOtpIndex, setActiveOtpIndex,
    validationErrors,
    showStepModal, setShowStepModal,
    showTermsModal, setShowTermsModal,
    toast, setToast,
    handleUserTypeSelect, handleInputChange, handleOtpChange, handleOtpKeyDown, handleTermsChange,
    handleNextStep, handlePrevStep, handleConfirmStepModal, resendOtp, handleSubmit, handleDriverFinalSubmit,
    getProgressPercentage, isPasswordMatch, getStepModalContent,
  } = useInscriptionFlow();

  const showToast = (title, message, type = 'info') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-100 bg-gradient-to-br from-primary-50 to-secondary-100  dark:from-gray-800  dark:bg-slate-900">
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
        onConfirm={handleConfirmStepModal}
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
              Le service <span className="font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">{platform.name || 'Taka Taka'}</span> permet la mise en relation entre passagers et chauffeurs pour des trajets urbains.
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
        <InscriptionSidebar currentStep={currentStep} userType={userType} platform={platform} />

        {/* Contenu principal */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-3xl">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-3 mb-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg">
                <Car className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold uppercase tracking-tight bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">{platform.name || 'TAKA TAKA'}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{platform.tagline || 'Mobilité Intelligente'}</p>
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

            <div className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="animate-fade-in"
                  >
                    <StepUserType
                      userType={userType}
                      onSelect={handleUserTypeSelect}
                      error={validationErrors.userType}
                      showToast={showToast}
                    />
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="animate-fade-in"
                  >
                    <StepPersonalInfo
                      formData={formData}
                      onChange={handleInputChange}
                      errors={validationErrors}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      showConfirmPassword={showConfirmPassword}
                      setShowConfirmPassword={setShowConfirmPassword}
                      passwordStrength={passwordStrength}
                      isPasswordMatch={isPasswordMatch}
                      onNext={handleNextStep}
                      onPrev={handlePrevStep}
                      isSubmitting={isSubmitting}
                    />
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="animate-fade-in"
                  >
                    <StepOtpVerification
                      formData={formData}
                      otpTimer={otpTimer}
                      activeOtpIndex={activeOtpIndex}
                      setActiveOtpIndex={setActiveOtpIndex}
                      onOtpChange={handleOtpChange}
                      onOtpKeyDown={handleOtpKeyDown}
                      errors={validationErrors}
                      onResendOtp={resendOtp}
                      onTermsChange={handleTermsChange}
                      onShowTerms={() => setShowTermsModal(true)}
                      platform={platform}
                      onPrev={handlePrevStep}
                      onSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                    />
                  </motion.div>
                )}

                {currentStep === 4 && userType === 'driver' && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <InscriptionChauffeur
                      onBack={handlePrevStep}
                      onSubmit={handleDriverFinalSubmit}
                      showToast={showToast}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Liens */}
            <div className="text-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                Vous avez déjà un compte <span className="font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">{platform.name || 'Taka Taka'}</span> ?{' '}
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

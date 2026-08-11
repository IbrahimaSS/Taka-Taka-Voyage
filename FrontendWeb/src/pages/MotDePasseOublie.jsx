import { Car } from 'lucide-react';
import Toast from '../components/admin/ui/Toast';
import { useSettings } from '../context/SettingsContext';
import ConnexionBrandPanel from '../components/connexion/ConnexionBrandPanel';
import { useMotDePasseOublieFlow } from '../components/motdepasseoublie/useMotDePasseOublieFlow';
import StepIdentifiant from '../components/motdepasseoublie/StepIdentifiant';
import StepCodeVerification from '../components/motdepasseoublie/StepCodeVerification';
import StepNouveauMotDePasse from '../components/motdepasseoublie/StepNouveauMotDePasse';

// Flux "Mot de passe oublie" (frontend uniquement - voir
// services/passwordResetService.js pour le point d'integration backend).
// Reprend le meme habillage visuel que Connexion.jsx (meme panneau de
// marque a gauche) pour rester dans la meme famille d'ecrans.
const MotDePasseOublie = () => {
  const { settings } = useSettings();
  const platform = settings?.platform || {};

  const {
    currentStep,
    identifiant, identifiantMasque,
    code, resendCooldown,
    newPassword, confirmPassword, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
    passwordStrength, isPasswordMatch,
    isLoading, validationErrors,
    toast, setToast,
    handleIdentifiantChange, handleSubmitIdentifiant,
    handleCodeChange, handleCodeKeyDown, handleResendCode, handleSubmitCode,
    handleNewPasswordChange, handleConfirmPasswordChange, handleSubmitNewPassword,
    handlePrevStep,
  } = useMotDePasseOublieFlow();

  return (
    <div className="min-h-screen bg-gray-100 bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-800 dark:bg-slate-900">
      {toast.show && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="flex min-h-screen">
        <ConnexionBrandPanel platform={platform} />

        <div className="flex-1 flex items-center bg-white dark:bg-gray-800 justify-center p-4 md:p-8">
          <div className="w-full max-w-2xl">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center shadow-lg overflow-hidden">
                  {platform.logo ? (
                    <img src={platform.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Car className="text-white" size={24} />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold uppercase tracking-tight bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">{platform.name || 'TAKA TAKA'}</h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{platform.tagline || 'Mobilité Intelligente'}</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 w-full max-w-4xl">
              {currentStep === 1 && (
                <StepIdentifiant
                  identifiant={identifiant}
                  error={validationErrors.identifiant}
                  isLoading={isLoading}
                  onChange={handleIdentifiantChange}
                  onSubmit={handleSubmitIdentifiant}
                />
              )}

              {currentStep === 2 && (
                <StepCodeVerification
                  identifiantMasque={identifiantMasque}
                  code={code}
                  resendCooldown={resendCooldown}
                  error={validationErrors.code}
                  isLoading={isLoading}
                  onCodeChange={handleCodeChange}
                  onCodeKeyDown={handleCodeKeyDown}
                  onResend={handleResendCode}
                  onSubmit={handleSubmitCode}
                  onPrev={handlePrevStep}
                />
              )}

              {currentStep === 3 && (
                <StepNouveauMotDePasse
                  newPassword={newPassword}
                  confirmPassword={confirmPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  passwordStrength={passwordStrength}
                  isPasswordMatch={isPasswordMatch}
                  errors={validationErrors}
                  isLoading={isLoading}
                  onNewPasswordChange={handleNewPasswordChange}
                  onConfirmPasswordChange={handleConfirmPasswordChange}
                  onSubmit={handleSubmitNewPassword}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotDePasseOublie;

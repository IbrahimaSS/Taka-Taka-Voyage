import { Car, Shield } from 'lucide-react';
import Toast from '../components/admin/ui/Toast';
import { useSettings } from '../context/SettingsContext';
import { useConnexionForm } from '../components/connexion/useConnexionForm';
import ConnexionBrandPanel from '../components/connexion/ConnexionBrandPanel';
import ConnexionOtpStep from '../components/connexion/ConnexionOtpStep';
import ConnexionLoginForm from '../components/connexion/ConnexionLoginForm';

const Connexion = () => {
  const { settings } = useSettings();
  const platform = settings?.platform || {};

  const {
    showPassword, setShowPassword,
    rememberMe, setRememberMe,
    isLoading, loginSuccess,
    formData, validationErrors,
    requires2FA, otpCode, maskedPhone, maskedEmail, resendCooldown,
    toast, setToast, showToast,
    navigate,
    handleInputChange, handleSubmit, handleOtpChange, handleOtpKeyDown,
    handleResendOtp, handleBackToLogin, handleSocialLogin,
  } = useConnexionForm();

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

      <div className="flex min-h-screen">
        <ConnexionBrandPanel platform={platform} />

        {/* Right Panel: Login Form */}
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

            <div className="p-6 md:p-20 w-full">
              <div className="mb-8">
                <h2 className="text-2xl text-center font-bold text-gray-900 dark:text-white mb-2">Se connecter</h2>
                <p className="text-gray-600 text-center dark:text-gray-400">Accédez à votre compte {platform.name || 'Taka Taka'}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {requires2FA ? (
                  <ConnexionOtpStep
                    otpCode={otpCode}
                    maskedPhone={maskedPhone}
                    maskedEmail={maskedEmail}
                    resendCooldown={resendCooldown}
                    isLoading={isLoading}
                    loginSuccess={loginSuccess}
                    onOtpChange={handleOtpChange}
                    onOtpKeyDown={handleOtpKeyDown}
                    onResendOtp={handleResendOtp}
                    onBack={handleBackToLogin}
                  />
                ) : (
                  <ConnexionLoginForm
                    formData={formData}
                    validationErrors={validationErrors}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    rememberMe={rememberMe}
                    setRememberMe={setRememberMe}
                    onInputChange={handleInputChange}
                    onSocialLogin={handleSocialLogin}
                    showToast={showToast}
                    platform={platform}
                    navigate={navigate}
                    isLoading={isLoading}
                    loginSuccess={loginSuccess}
                  />
                )}
              </form>

              {/* Security Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                  <Shield className="w-4 h-4 mr-2 text-green-500" />
                  Connexion 100% sécurisée • Vos données sont protégées
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connexion;

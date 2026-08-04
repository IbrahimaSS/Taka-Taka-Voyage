import React from 'react';
import { Shield, AlertTriangle, RefreshCw, Check, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../admin/ui/Bttn';

const StepOtpVerification = ({
  formData,
  otpTimer,
  activeOtpIndex,
  setActiveOtpIndex,
  onOtpChange,
  onOtpKeyDown,
  errors,
  onResendOtp,
  onTermsChange,
  onShowTerms,
  platform,
  onPrev,
  onSubmit,
  isSubmitting
}) => {
  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Shield className="text-blue-600 dark:text-blue-400 w-8 h-8 sm:w-12 sm:h-12" />
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

      <div className="flex justify-center items-center gap-1 sm:gap-2 mb-8">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <React.Fragment key={index}>
            <input
              type="text"
              maxLength="1"
              value={formData.otp[index]}
              onChange={(e) => onOtpChange(e.target.value, index)}
              onKeyDown={(e) => onOtpKeyDown(e, index)}
              onFocus={() => setActiveOtpIndex(index)}
              className={`w-10 sm:w-14 h-10 sm:h-14 text-center text-lg sm:text-2xl font-bold rounded-xl border-2 transition-all ${formData.otp[index]
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
              <span className="h-10 sm:h-16 flex items-center text-gray-400 dark:text-gray-500 font-bold text-lg sm:text-xl mx-1 sm:mx-2">
                -
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {errors.otp && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={16} />
            <span className="text-red-600 dark:text-red-400 text-sm">{errors.otp}</span>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Vous n'avez pas reçu le code ?</p>
        <Button
          type="button"
          variant="outline"
          onClick={onResendOtp}
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
            onChange={(e) => onTermsChange(e.target.checked)}
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
            onClick={onShowTerms}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold hover:underline"
          >
            Conditions d'utilisation
          </button>{' '}
          et la{' '}
          <button
            type="button"
            onClick={onShowTerms}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold hover:underline"
          >
            Politique de confidentialité
          </button>{' '}
          de <span className="font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">{platform.name || 'Taka Taka'}</span>
        </label>
      </div>

      {errors.termsAccepted && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={16} />
            <span className="text-red-600 dark:text-red-400 text-sm">{errors.termsAccepted}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onPrev}
          icon={ArrowLeft}
          iconSize="medium"
        >
          Retour
        </Button>

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onSubmit}
          loading={isSubmitting}
          icon={isSubmitting ? undefined : CheckCircle}
          iconSize="medium"
        >
          {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
        </Button>
      </div>
    </>
  );
};

export default StepOtpVerification;

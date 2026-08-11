import { Shield, Mail, Lock, Clock, ArrowLeft } from 'lucide-react';

// Etape de verification 2FA/OTP - extraite de pages/Connexion.jsx.
// Fix responsive au passage : les 6 cases OTP utilisaient une largeur fixe
// en dur (style={{width:'52px'}}) + une classe Tailwind invalide (w-13,
// absente de l'echelle par defaut) qui debordait un viewport 360px
// (6 x 52px + espacements ~= 372px, avant meme le padding du conteneur).
// Remplace par une taille responsive (44px mobile, 56px des sm:) qui tient
// confortablement des 320px tout en gardant des cibles tactiles >= 44px.
const ConnexionOtpStep = ({
  otpCode,
  maskedPhone,
  maskedEmail,
  resendCooldown,
  isLoading,
  onOtpChange,
  onOtpKeyDown,
  onResendOtp,
  onBack,
}) => {
  return (
    <div className="text-center space-y-6">
      <div className="relative mx-auto w-20 h-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full opacity-20 animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Shield className="w-10 h-10 text-white" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Vérification de sécurité
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Nouvel appareil détecté sur votre compte
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Code envoyé par email
            </p>
            {(maskedPhone || maskedEmail) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {maskedPhone && <span>{maskedPhone}</span>}
                {maskedPhone && maskedEmail && <span className="mx-1">•</span>}
                {maskedEmail && <span>{maskedEmail}</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wider">
          Entrez le code à 6 chiffres
        </p>
        <div className="flex justify-center gap-1.5 sm:gap-3">
          {otpCode.map((digit, i) => (
            <input
              key={`otp-${i}`}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => onOtpChange(i, e.target.value)}
              onKeyDown={(e) => onOtpKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              className={`w-11 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none
                ${digit
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md shadow-blue-500/10'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                }
                focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10
                hover:border-blue-300 dark:hover:border-blue-500`}
            />
          ))}
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Code valable 5 min
          </span>
          {resendCooldown > 0 && (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {resendCooldown}s
            </span>
          )}
        </div>
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000"
            style={{ width: resendCooldown > 0 ? `${(resendCooldown / 60) * 100}%` : '100%' }}
          ></div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          disabled={resendCooldown > 0 || isLoading}
          onClick={onResendOtp}
          className={`inline-flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4 rounded-xl transition-all duration-200
            ${resendCooldown > 0
              ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
              : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
            }`}
        >
          <Mail size={16} />
          {resendCooldown > 0
            ? `Renvoyer dans ${resendCooldown}s`
            : 'Renvoyer un nouveau code'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors py-2"
        >
          <ArrowLeft size={14} />
          Retour à la connexion
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 pt-2">
        <Shield size={12} className="text-green-500" />
        <span>Protection renforcée pour votre sécurité</span>
      </div>
    </div>
  );
};

export default ConnexionOtpStep;

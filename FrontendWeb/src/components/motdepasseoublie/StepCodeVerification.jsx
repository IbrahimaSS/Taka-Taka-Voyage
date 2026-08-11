import { Shield, Mail, ArrowLeft } from 'lucide-react';
import Button from '../admin/ui/Bttn';

// Etape 2 : confirmation d'envoi + saisie du code recu. Tailles de cases
// responsives des la construction (w-11/h-12 mobile, sm:w-14/h-14) - pas de
// reprise du bug de debordement 360px corrige par ailleurs dans
// ConnexionOtpStep.jsx.
const StepCodeVerification = ({
  identifiantMasque,
  code,
  resendCooldown,
  error,
  isLoading,
  onCodeChange,
  onCodeKeyDown,
  onResend,
  onSubmit,
  onPrev,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 flex items-center justify-center mx-auto">
        <Shield className="text-blue-600 dark:text-blue-400 w-8 h-8" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Vérifiez votre code</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Un code à 6 chiffres a été envoyé à <span className="font-semibold">{identifiantMasque}</span>
        </p>
      </div>

      <div>
        <div className="flex justify-center gap-1.5 sm:gap-3">
          {code.map((digit, i) => (
            <input
              key={`reset-code-${i}`}
              id={`reset-code-${i}`}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => onCodeChange(i, e.target.value)}
              onKeyDown={(e) => onCodeKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              className={`w-11 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none
                ${digit
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                }
                focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500`}
            />
          ))}
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <button
        type="button"
        disabled={resendCooldown > 0 || isLoading}
        onClick={onResend}
        className={`inline-flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4 rounded-xl transition-all duration-200
          ${resendCooldown > 0
            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
            : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
          }`}
      >
        <Mail size={16} />
        {resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer le code'}
      </button>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading} disabled={code.join('').length < 6}>
        {isLoading ? 'Vérification...' : 'Vérifier le code'}
      </Button>

      <button
        type="button"
        onClick={onPrev}
        className="inline-flex items-center justify-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors py-2"
      >
        <ArrowLeft size={14} />
        Modifier l'identifiant
      </button>
    </form>
  );
};

export default StepCodeVerification;

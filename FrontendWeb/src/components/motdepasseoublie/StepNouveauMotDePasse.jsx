import { Eye, EyeOff, CheckCircle, XCircle, KeyRound } from 'lucide-react';
import Button from '../admin/ui/Bttn';

// Etape 3 : nouveau mot de passe. Reprend le meme pattern d'indicateur de
// force que StepPersonalInfo.jsx (Inscription).
const StepNouveauMotDePasse = ({
  newPassword,
  confirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordStrength,
  isPasswordMatch,
  errors,
  isLoading,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="text-center mb-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nouveau mot de passe</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Choisissez un nouveau mot de passe pour votre compte
        </p>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
          Nouveau mot de passe
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={onNewPasswordChange}
            className={`w-full px-4 py-3 pr-12 rounded-xl border ${errors.newPassword
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
        {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
        {newPassword && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
              {passwordStrength.message}
            </span>
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${passwordStrength.score * 25}%`, backgroundColor: passwordStrength.color }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            className={`w-full px-4 py-3 pr-12 rounded-xl border ${errors.confirmPassword
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
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        {confirmPassword && !errors.confirmPassword && (
          <div className="flex items-center gap-1 mt-2">
            {isPasswordMatch() ? (
              <>
                <CheckCircle className="text-green-500" size={14} />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Les mots de passe correspondent</span>
              </>
            ) : (
              <>
                <XCircle className="text-red-500" size={14} />
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">Les mots de passe ne correspondent pas</span>
              </>
            )}
          </div>
        )}
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
        {isLoading ? 'Enregistrement...' : 'Réinitialiser le mot de passe'}
      </Button>
    </form>
  );
};

export default StepNouveauMotDePasse;

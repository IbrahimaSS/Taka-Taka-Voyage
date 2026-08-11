import { Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Button from '../admin/ui/Bttn';

const StepPersonalInfo = ({
  formData,
  onChange,
  errors,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordStrength,
  isPasswordMatch,
  onNext,
  onPrev,
  isSubmitting
}) => {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Vos informations</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">Renseignez vos coordonnées pour créer votre compte</p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Prénom
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={onChange}
              className={`w-full px-4 py-3 rounded-xl border ${errors.firstName
                ? 'border-red-500 focus:ring-red-500/50'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              placeholder="Votre prénom"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Nom
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={onChange}
              className={`w-full px-4 py-3 rounded-xl border ${errors.lastName
                ? 'border-red-500 focus:ring-red-500/50'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              placeholder="Votre nom de famille"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Numéro de téléphone
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-4 border-2 border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-l-lg font-medium">
                +224
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={onChange}
                className={`flex-1 px-4 py-3 rounded-r-xl border-2 border-l-0 ${errors.phone
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                placeholder="XX XX XX XX"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
          {/* Genre liste deroulante */}
          <div className="">
            <label htmlFor="genre" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Genre</label>
            <select value={formData.genre} name="genre" className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 focus:ring-blue-500/50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all" id="genre" onChange={onChange}>
              <option value="">Genre</option>
              <option value="MASCULIN">MASCULIN</option>
              <option value="FEMININ">FEMININ</option>
            </select>
          </div>

        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            Adresse email
          </label>
          <div className="flex">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className={`flex-1 px-4 py-3 rounded-r-xl border-2 border-l-0 ${errors.email
                ? 'border-red-500 focus:ring-red-500/50'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}

              placeholder="votre@email.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={onChange}
                className={`w-full px-4 py-3 pr-12 rounded-xl border ${errors.password
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
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                {passwordStrength.message}
              </span>
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${passwordStrength.score * 25}%`,
                    backgroundColor: passwordStrength.color
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={onChange}
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
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
            {formData.confirmPassword && !errors.confirmPassword && (
              <div className="flex items-center gap-1 mt-2">
                {isPasswordMatch() ? (
                  <>
                    <CheckCircle className="text-green-500" size={14} />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Les mots de passe correspondent
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="text-red-500" size={14} />
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Les mots de passe ne correspondent pas
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          type="button"
          variant="secondary"
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
          onClick={onNext}
          loading={isSubmitting}
          icon={isSubmitting ? undefined : CheckCircle}
          iconSize="medium"

        >
          {isSubmitting ? 'Création en cours...' : 'Continuer'}
        </Button>
      </div>
    </>
  );
};

export default StepPersonalInfo;

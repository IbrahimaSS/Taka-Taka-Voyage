import { Mail, Lock, Eye, EyeOff, Info, Check, Smartphone } from 'lucide-react';
import Button from '../admin/ui/Bttn';

// Logo Google officiel (4 chemins couleur) - remplace un SVG casse qui ne
// contenait qu'un seul des 4 chemins du "G" (rendu comme un aplat rouge
// meconnaissable au lieu du logo Google).
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24">
    <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// Champs identifiant/mot de passe + "se souvenir de moi" + mot de passe
// oublie + connexion sociale + lien inscription - extrait de
// pages/Connexion.jsx. Icone Google corrigee (voir GoogleIcon ci-dessus),
// lien mot de passe oublie pointe desormais vers le vrai flux frontend
// (au lieu de /forgot-password, route inexistante -> 404 garanti).
const ConnexionLoginForm = ({
  formData,
  validationErrors,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  onInputChange,
  onSocialLogin,
  showToast,
  platform,
  navigate,
}) => {
  return (
    <>
      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium flex items-center">
          Numéro de téléphone / Adresse Email
          <button
            type="button"
            onClick={() => showToast('Format accepté', 'Utilisez votre numéro (9 chiffres) ou votre email', 'info')}
            className="ml-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            title="Plus d'informations"
          >
            <Info size={14} />
          </button>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Smartphone className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={onInputChange}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border ${validationErrors.phone
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
            placeholder="xxx xxx xxx / example@gmail.com"
          />
        </div>
        {validationErrors.phone && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
        )}
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
          Entrez votre numéro de téléphone (9 chiffres) ou votre adresse email
        </p>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
          Mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="text-gray-400" size={20} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={onInputChange}
            className={`w-full pl-10 pr-12 py-3 rounded-xl border ${validationErrors.password
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
            placeholder="Votre mot de passe"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {validationErrors.password && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
        )}
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
          Le mot de passe doit contenir au moins 8 caractères
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <label className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="hidden"
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${rememberMe
              ? 'bg-green-600 border-green-600 shadow-inner'
              : 'border-gray-300 dark:border-gray-600 group-hover:border-green-500'
              }`}>
              {rememberMe && <Check className="text-white" size={14} />}
            </div>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
            Se souvenir de moi
          </span>
        </label>
        <a
          href="/mot-de-passe-oublie"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors hover:underline"
        >
          Mot de passe oublié ?
        </a>
      </div>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 text-sm font-medium">
            Ou continuer avec
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSocialLogin('Google')}
          icon={GoogleIcon}
        >
          Google
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => onSocialLogin('Facebook')}
          icon={FacebookIcon}
        >
          Facebook
        </Button>
      </div>

      {/* Signup Links */}
      <div className="text-center mb-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Nouveau sur {platform.name || 'Taka Taka'} ?
          <button
            onClick={() => navigate('/inscription')}
            className="font-bold text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 ml-2 transition-colors hover:underline"
          >
            Créer un compte
          </button>
        </p>
        <div className="flex flex-col justify-center sm:flex-row gap-4">
          <Button
            onClick={() => navigate('/inscription?type=passenger')}
            variant="outline"
            className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
          >
            <div className="flex flex-col items-center">
              <span className="font-bold">Passager</span>
              <span className="text-xs opacity-75">Réserver des trajets</span>
            </div>
          </Button>
          <Button
            onClick={() => navigate('/inscription?type=driver')}
            variant="outline"
            className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
          >
            <div className="flex flex-col items-center">
              <span className="font-bold">Chauffeur</span>
              <span className="text-xs opacity-75">Offrir des trajets</span>
            </div>
          </Button>
        </div>
      </div>
    </>
  );
};

export default ConnexionLoginForm;

import { Mail, Lock, ArrowLeft } from 'lucide-react';
import Button from '../admin/ui/Bttn';

// Etape 1 : saisie de l'identifiant (telephone ou email) pour recevoir un
// code de reinitialisation. Meme regex de validation que Connexion.jsx.
const StepIdentifiant = ({ identifiant, error, isLoading, onChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="text-center mb-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 flex items-center justify-center mx-auto mb-4">
          <Lock className="text-blue-600 dark:text-blue-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mot de passe oublié ?</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Entrez votre numéro ou votre email, nous vous enverrons un code de vérification.
        </p>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
          Numéro de téléphone / Adresse Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            name="identifiant"
            value={identifiant}
            onChange={onChange}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border ${error
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/50'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
            placeholder="xxx xxx xxx / example@gmail.com"
            autoFocus
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
        {isLoading ? 'Envoi en cours...' : 'Envoyer le code'}
      </Button>

      <div className="text-center">
        <a
          href="/connexion"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={14} />
          Retour à la connexion
        </a>
      </div>
    </form>
  );
};

export default StepIdentifiant;

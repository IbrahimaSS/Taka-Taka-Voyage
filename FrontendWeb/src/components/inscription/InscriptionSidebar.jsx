import { Car, ArrowLeft, Check } from 'lucide-react';

const InscriptionSidebar = ({ currentStep, userType, platform }) => {
  return (
    <div className="hidden md:flex md:w-1/3 lg:w-1/4 bg-gradient-to-b from-blue-900 to-green-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute w-64 h-64 bg-white/5 rounded-full -top-32 -left-32"></div>
        <div className="absolute w-96 h-96 bg-green-500/10 rounded-full -bottom-48 -right-48"></div>
      </div>

      <div className="relative z-10 p-8 flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg">
            <Car className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white uppercase tracking-tight bg-gradient-to-r from-emerald-500 to-blue-200 bg-clip-text text-transparent">{platform.name || 'TAKA TAKA'}</h1>
            <p className="text-sm text-blue-200">{platform.tagline || 'Mobilité Intelligente'}</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center text-blue-200 hover:text-white text-sm transition-colors group bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={16} />
            Retour à l'accueil
          </a>
        </div>

        {/* Navigation des étapes */}
        <nav className="space-y-6 mb-12">
          {/* Étape 1 */}
          <div className={`flex items-center gap-4 p-3 rounded-xl transition-all ${currentStep >= 1 ? 'bg-white/10' : 'opacity-50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-white text-green-600' : 'bg-white/10 text-white'}`}>
              {currentStep > 1 ? <Check size={16} /> : '1'}
            </div>
            <div>
              <p className="font-semibold text-white">Profil</p>
              <p className="text-sm text-blue-200">Choisissez votre type de compte</p>
            </div>
          </div>

          {/* Étape 2 */}
          <div className={`flex items-center gap-4 p-3 rounded-xl transition-all ${currentStep >= 2 ? 'bg-white/10' : 'opacity-50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-white text-green-600' : 'bg-white/10 text-white'}`}>
              {currentStep > 2 ? <Check size={16} /> : '2'}
            </div>
            <div>
              <p className="font-semibold text-white">Informations</p>
              <p className="text-sm text-blue-200">Renseignez vos coordonnées</p>
            </div>
          </div>

          {/* Étape 3 */}
          <div className={`flex items-center gap-4 p-3 rounded-xl transition-all ${currentStep >= 3 ? 'bg-white/10' : 'opacity-50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-white text-green-600' : 'bg-white/10 text-white'}`}>
              {currentStep > 3 ? <Check size={16} /> : '3'}
            </div>
            <div>
              <p className="font-semibold text-white">Vérification</p>
              <p className="text-sm text-blue-200">Confirmez votre identité</p>
            </div>
          </div>

          {/* Étape 4 (uniquement pour chauffeurs) */}
          {userType === 'driver' && (
            <div className={`flex items-center gap-4 p-3 rounded-xl transition-all ${currentStep >= 4 ? 'bg-white/10' : 'opacity-50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 4 ? 'bg-white text-green-600' : 'bg-white/10 text-white'}`}>
                {currentStep > 4 ? <Check size={16} /> : '4'}
              </div>
              <div>
                <p className="font-semibold text-white">Documents</p>
                <p className="text-sm text-blue-200">Véhicule et pièces justificatives</p>
              </div>
            </div>
          )}
        </nav>

        {/* Statistiques */}
        <div className="mt-auto pt-8 border-t border-white/20">
          <p className="text-sm text-blue-200 mb-4">Rejoignez notre communauté</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-2xl font-bold text-green-300">50K+</p>
              <p className="text-xs text-blue-200">Utilisateurs</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-2xl font-bold text-yellow-300">4.8★</p>
              <p className="text-xs text-blue-200">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscriptionSidebar;

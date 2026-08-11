import { Car, ArrowLeft, Users, Star, Shield, Clock } from 'lucide-react';

const stats = [
  { value: '50K+', label: 'Utilisateurs actifs', icon: Users, color: 'text-blue-400' },
  { value: '4.8★', label: 'Satisfaction', icon: Star, color: 'text-green-400' },
  { value: '98%', label: 'Taux de réussite', icon: Shield, color: 'text-blue-500' },
  { value: '24/7', label: 'Support', icon: Clock, color: 'text-green-500' }
];

// Panneau de marque affiche a gauche sur desktop/large tablette uniquement
// (hidden lg:flex) - extrait tel quel de pages/Connexion.jsx.
const ConnexionBrandPanel = ({ platform }) => {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-green-900">
        <div className="absolute w-64 h-64 bg-white/5 rounded-full -top-32 -left-32 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-green-500/10 rounded-full -bottom-48 -right-48 animate-ping-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-12 flex flex-col justify-between text-white w-full">
        <div>
          <div className="flex items-start justify-between mb-12">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20 overflow-hidden">
                {platform.logo ? (
                  <img src={platform.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Car className="text-white" size={32} />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold uppercase tracking-tight bg-gradient-to-r from-emerald-500 to-blue-200 bg-clip-text text-transparent">{platform.name || 'TAKA TAKA'}</h1>
                <p className="text-blue-100 text-lg">{platform.tagline || 'Mobilité Intelligente'}</p>
              </div>
            </div>

            <a
              href="/"
              className="inline-flex items-center text-blue-100 hover:text-white text-sm transition-colors group bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={16} />
              Retour à l'accueil
            </a>
          </div>

          <div className="mb-12 max-w-lg">
            <h2 className="text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Bienvenue !
            </h2>
            <p className="text-blue-100/90 text-lg leading-relaxed">
              Connectez-vous pour accéder à vos trajets, suivre vos courses et profiter de nos services
              exclusifs de mobilité urbaine en toute sécurité.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-white/10"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg bg-white/10 ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                </div>
                <p className="text-blue-100/80 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-start space-x-3">
              <Shield className="text-green-400 mt-0.5" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Connexion sécurisée</h3>
                <p className="text-blue-100/80 text-sm">
                  Vos informations sont protégées par un chiffrement de bout en bout.
                  Nous ne partageons jamais vos données personnelles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnexionBrandPanel;

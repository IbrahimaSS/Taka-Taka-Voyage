
import { 
  MapPin, 
  Wallet, 
  Shield, 
  BarChart3, 
  History, 
  Globe, 
  CheckCircle, 
  ArrowRight 
} from 'lucide-react';
import Button from '../../ui/Buttons';


const FonctionnalitesSection = () => {
  const fonctionnalites = [
    {
      icon: MapPin,
      title: 'Géolocalisation en Temps Réel',
      description: 'Suivi GPS précis du chauffeur et du passager pour une expérience transparente et sécurisée.',
      iconColor: 'gradient',
      features: ['Matching intelligent', 'Estimation précise du prix', 'Navigation optimisée']
    },
    {
      icon: Wallet,
      title: 'Paiements Flexibles',
      description: 'Plusieurs options de paiement adaptées à tous les utilisateurs.',
      iconColor: 'green',
      badges: ['Espèces', 'Mobile Money', 'Portefeuille électronique']
    },
    {
      icon: Shield,
      title: 'Sécurité Renforcée',
      description: 'Voyagez en toute tranquillité avec nos fonctionnalités de sécurité avancées.',
      iconColor: 'blue',
      features: ['Chauffeurs vérifiés', 'Partage de trajet', 'Bouton d\'urgence']
    },
    {
      icon: BarChart3,
      title: 'Tableau de Bord Admin',
      description: 'Supervision complète du système avec statistiques détaillées et outils de gestion.',
      iconColor: 'gradient',
      features: ['Gestion des utilisateurs', 'Suivi des trajets en direct', 'Rapports détaillés']
    },
    {
      icon: History,
      title: 'Historique Complet',
      description: 'Accédez à l\'historique de tous vos trajets, paiements et évaluations.',
      iconColor: 'cyan',
      features: ['Historique des courses', 'Transactions financières', 'Évaluations reçues']
    },
    {
      icon: Globe,
      title: 'Multilingue & Accessible',
      description: 'Plateforme accessible à tous, avec support multilingue et options USDD/SMS.',
      iconColor: 'green',
      features: ['Interface en français et langues locales', 'Mode USDD pour non-smartphones', 'Support client 24/7']
    }
  ];

  return (
    <section 
      id="fonctionnalites" 
      className="py-20 px-6 bg-white dark:bg-gray-900"
      data-aos="fade-up"
    >
      <div className="container mx-auto">
        {/* Titre */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Fonctionnalités <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start">Principales</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            Découvrez les fonctionnalités qui font de Taka Taka la plateforme de mobilité la plus complète.
          </p>
        </div>

        {/* Grille de fonctionnalités */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          {fonctionnalites.map((feature, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 bg-gradient-to-b from-blue-500/10 via-white to-green-500/10 dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:-translate-y-2 hover:border-primaryGreen-start/50"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primaryGreen-start/20 to-primaryBlue-start/20 flex items-center justify-center mb-6">
                <feature.icon className="" size={28} />
              </div>


              {/* Title & Description */}
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>

              {/* Features or Badges */}
              {feature.features && (
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <CheckCircle className="text-primaryGreen-start mr-2" size={16} />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {feature.badges && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {feature.badges.map((badge, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-primaryGreen-start/10 text-primaryGreen-start dark:bg-primaryGreen-start/20 dark:text-primaryGreen-end"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div 
          className="text-center"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <Button
            variant="gradientMix"
            size="lg"
            icon={<ArrowRight size={20} />}
          >
            Voir toutes les fonctionnalités
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FonctionnalitesSection;
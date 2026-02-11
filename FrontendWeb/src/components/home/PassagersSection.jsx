import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Shield, 
  Wallet, 
  Route, 
  Search, 
  Car, 
  CarFront, 
  Users, 
} from 'lucide-react';
import Button from '../../ui/Buttons';
import FeatureCard from '../../ui/FeatureCard';

const PassagersSection = ({ selectedOption, setSelectedOption }) => {
  const navigate = useNavigate();
  const features = [
    {
      icon: Zap,
      title: 'Réservation Rapide',
      description: 'Réservez un trajet en moins de 30 secondes avec notre interface intuitive.',
      iconColor: 'green'
    },
    {
      icon: Shield,
      title: 'Sécurité Garantie',
      description: 'Tous nos chauffeurs sont vérifiés et notés par la communauté.',
      iconColor: 'blue'
    },
    {
      icon: Wallet,
      title: 'Paiement Flexible',
      description: 'Payez en espèces, par mobile money ou avec votre portefeuille électronique.',
      iconColor: 'Green'
    },
    {
      icon: Route,
      title: 'Trajet Optimisé',
      description: 'Des itinéraires optimisés pour arriver plus vite à destination.',
      iconColor: 'cyan'
    }
  ];

  const options = [
    {
      type: 'standard',
      price: '15,000 GNF',
      distance: '5.2 km'
    },
    {
      type: 'comfort',
      price: '25,000 GNF',
      distance: '5.2 km'
    },
    {
      type: 'group',
      price: '35,000 GNF',
      distance: '5.2 km'
    }
  ];

  const handleSearchDriver = () => {
    // Redirect to the real Passager module (full passenger experience)
    navigate('/passager');
  };

  return (
    <section id="passagers" className="py-20 px-6 bg-white dark:bg-gray-900">
      <div className="container mx-auto">
        {/* Titre */}
        <div 
          className="text-center mb-16"
          data-aos="fade-up"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pour les <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start">Passagers</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            Déplacez-vous facilement, rapidement et en toute sécurité avec Taka Taka.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Colonne gauche - Features */}
          <div 
            className="lg:w-1/2"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  iconColor={feature.iconColor}
                  className="h-full"
                />
              ))}
            </div>
          </div>

          {/* Colonne droite - Formulaire de réservation */}
          <div 
            className="lg:w-1/2"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="bg-gradient-to-b from-blue-500/10 via-white to-green-500/10 dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start">
                Réserver un trajet
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
                Simple, rapide et fiable
              </p>

              {/* Étapes de réservation */}
              <div className="space-y-6 mb-8">
                {/* Étape 1 */}
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                    1
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold mb-2 text-gray-800 dark:text-gray-200">Où êtes-vous ?</p>
                    <input 
                      type="text" 
                      placeholder="Votre position actuelle" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryGreen-start/50 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Étape 2 */}
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                    2
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold mb-2 text-gray-800 dark:text-gray-200">Où allez-vous ?</p>
                    <input 
                      type="text" 
                      placeholder="Votre destination" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryGreen-start/50 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Étape 3 - Options */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      3
                    </div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">Choisissez votre véhicule</p>
                  </div>
                  
                </div>
              </div>

              {/* Bouton Rechercher */}
              <div className="text-center">
                <Button
                  variant="gradientMix"
                  size="lg"
                  fullWidth
                  onClick={handleSearchDriver}
                  icon={<Search size={20} />}
                >
                  Rechercher un chauffeur
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PassagersSection;
import React from 'react';
import { 
  IdCard, 
  DollarSign, 
  Headphones, 
  ArrowRight, 
  Info, 
  Star 
} from 'lucide-react';
import Button from '../../ui/Buttons';
import FeatureCard from '../../ui/FeatureCard';

const ChauffeursSection = () => {
  const features = [
    {
      icon: IdCard,
      title: 'Inscription Rapide et Simple',
      description: 'Soumettez vos documents en ligne (permis, pièce d\'identité, carte grise) et obtenez une validation sous 24-48h.',
      iconColor: 'green'
    },
    {
      icon: DollarSign,
      title: 'Revenus Garantis',
      description: 'Gagnez jusqu\'à 30% de plus qu\'avec les applications concurrentes. Suivez vos revenus en temps réel.',
      iconColor: 'blue'
    },
    {
      icon: Headphones,
      title: 'Support 24h/24',
      description: 'Notre équipe est disponible à tout moment pour vous aider et résoudre les éventuels problèmes.',
      iconColor: 'blue'
    }
  ];

  return (
    <section 
      id="chauffeurs" 
      className="py-20 px-6 bg-gradient-to-b from-blue-500/10 via-white to-green-500/10 dark:from-gray-800 dark:to-gray-900"
      data-aos="fade-up"
    >
      <div className="container mx-auto">
        {/* Titre */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Devenez Chauffeur <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start">Taka Taka</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            Rejoignez notre réseau de chauffeurs professionnels et augmentez vos revenus avec une plateforme fiable et sécurisée.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:gap-12">
          {/* Contenu à gauche */}
          <div 
            className="lg:w-1/2 mb-12 lg:mb-0"
            data-aos="fade-right"
          >
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="transform transition-transform hover:-translate-y-1">
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    iconColor={feature.iconColor}
                    className="!p-5"
                  />
                </div>
              ))}

              {/* Boutons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  variant="gradientMix"
                  size="lg"
                  icon={<ArrowRight size={20} />}
                >
                  Devenir chauffeur
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  icon={<Info size={20} />}
                >
                  Savoir plus
                </Button>
              </div>
            </div>
          </div>

          {/* Image à droite */}
          <div 
            className="lg:w-1/2"
            data-aos="fade-left"
            data-aos-delay="200"
          >
            <div className="relative">
              <div className="bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start rounded-3xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
                <img 
                  src="acceuil.jpg" 
                  className="w-full h-auto object-cover rounded-3xl"
                />
              </div>
              
              {/* Badge Rating */}
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-b from-blue-500/10 via-white to-green-500/10 dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 rounded-2xl shadow-2xl">
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={20} 
                        fill={i < 4 ? "currentColor" : "none"} 
                        className={i === 4 ? "fill-yellow-400" : ""}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-xl text-gray-800 dark:text-white">4.8/5</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Satisfaction chauffeurs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChauffeursSection;
import React, { useEffect } from 'react';
import { Download, PlayCircle, Star, Users, Car, MapPin } from 'lucide-react';
import Button from '../../ui/Buttons';
import Card from '../../ui/Card';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
     const navigate=useNavigate()
  useEffect(() => {
    const createParticles = () => {
      const particlesContainer = document.getElementById('particles');
      if (!particlesContainer) return;

      particlesContainer.innerHTML = '';
      const particleCount = 30;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute rounded-full bg-white/10 dark:bg-primaryBlue-start/10';
        particle.style.width = `${Math.random() * 5 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animation = 'float 20s infinite linear';
        particlesContainer.appendChild(particle);
      }
    };
 

    createParticles();
  }, []);

  const stats = [
    { value: '10K+', label: 'Utilisateurs satisfaits', icon: Users },
    { value: '5K+', label: 'Chauffeurs vérifiés', icon: Car },
    { value: '50K+', label: 'Trajets effectués', icon: MapPin }
  ];

  return (
    <section id="accueil" className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primaryGreen-start/50  to-primaryBlue-start/80 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

      {/* Particules */}
      <div id="particles" className="absolute inset-0 pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Texte */}
          <div className="lg:w-1/2" >
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold mb-6 text-white leading-tight">
              Votre solution de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start">mobilité</span> en Guinée
            </h1>

            <p className="text-lg  md:text-xl mb-8 text-gray-600 dark:text-gray-300 leading-relaxed">
              Taka Taka connecte passagers et chauffeurs en temps réel pour des trajets rapides, sécurisés et abordables.
              Réservez un trajet en quelques secondes, suivez votre chauffeur en direct et payez facilement.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                variant="gradientMix"
                size="lg"
                onClick={() => navigate('/inscription')}
                icon={<Download size={20} />}
              >
                Commencez maintenant
              </Button>

              <Button
                variant="outline" // Utilise outline pour le bouton secondaire
                size="lg"
                onClick={() => document.getElementById('fonctionnalites').scrollIntoView({ behavior: 'smooth' })}
                icon={<PlayCircle size={20} />}
              >
                Voir plus
              </Button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  hover={false}
                  gradient={false}
                  className="text-center   hover:bg-gradient-to-b hover:from-blue-500/5 hover:via-white hover:to-green-500/5 dark:hover:from-gray-800/50 dark:hover:to-gray-900/50 transition-all duration-300"
                >
                  <div className="flex flex-col items-center">
                    {/* Icône avec un cercle de fond */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primaryGreen-start/20 to-primaryBlue-start/20 flex items-center justify-center mb-3">
                      <stat.icon className="text-primaryGreen-start" size={20} />
                    </div>

                    {/* Valeur avec effet de gradient */}
                    <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primaryGreen-start to-primaryBlue-end bg-clip-text text-transparent">
                      {stat.value}
                    </p>

                    {/* Label avec animation subtile au hover */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                      {stat.label}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Image/Illustration */}
          <div className="lg:w-1/2" data-aos="fade-left" data-aos-delay="200">
            <div className="relative">
              <div className="relative bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl overflow-hidden">
                {/* Gradient Orbs */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primaryGreen-start/20 rounded-full mix-blend-multiply filter blur-3xl" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primaryBlue-start/20 rounded-full mix-blend-multiply filter blur-3xl" />

                {/* Image */}
                <img
                  src="Passager.jpg"
                  alt="Passager Taka Taka souriant pendant un trajet en voiture"
                  className="w-full h-auto rounded-xl shadow-lg"
                />

                {/* Rating Badge */}
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-b from-blue-500/10 via-white to-green-500/10 dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 rounded-2xl shadow-xl">
                  <div className="flex items-center">
                    <div className="text-2xl font-bold mr-2">4.8</div>
                    <div className="flex text-yellow-400">
                      {[...Array(4)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                      <Star size={16} fill="currentColor" className="fill-yellow-400" />
                    </div>
                  </div>
                  <div className="text-sm opacity-90">Note moyenne</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
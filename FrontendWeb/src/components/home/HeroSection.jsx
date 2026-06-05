import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Download, PlayCircle, Star, Users, Car, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../ui/Buttons';
import Card from '../../ui/Card';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { apiClient } from '../../services/apiClient';

// ─── Carousel images configuration ───
const carouselImages = [
  {
    src: 'Im1.jpeg',
    alt: 'Taka Taka — Voyagez en toute sécurité à travers la Guinée',
  },
  {
    src: 'Im2.jpeg',
    alt: 'Taka Taka — Des trajets rapides et abordables pour tous',
  },
];

const CAROUSEL_INTERVAL = 5000; // 5 seconds

const HeroSection = () => {
  const { settings } = useSettings();
  const platform = settings?.platform || {};
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState({
    utilisateurs: '10K+',
    chauffeurs: '5K+',
    trajets: '50K+'
  });

  // ─── Carousel state ───
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef(null);

  // ─── Auto-rotate logic ───
  const startAutoRotate = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
        setIsTransitioning(false);
      }, 500); // match CSS transition duration
    }, CAROUSEL_INTERVAL);
  }, []);

  const goToSlide = useCallback((index) => {
    if (index === currentSlide) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 500);
    startAutoRotate(); // reset timer on manual nav
  }, [currentSlide, startAutoRotate]);

  const goNext = useCallback(() => {
    goToSlide((currentSlide + 1) % carouselImages.length);
  }, [currentSlide, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide((currentSlide - 1 + carouselImages.length) % carouselImages.length);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    startAutoRotate();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoRotate]);

  // ─── Fetch stats & particles ───
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiClient.get('/common/stats');
        if (data.succes) {
          const formatNumber = (num) => {
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
            if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
            return `${num}+`;
          };

          setStatsData({
            utilisateurs: formatNumber(data.stats.utilisateurs),
            chauffeurs: formatNumber(data.stats.chauffeurs),
            trajets: formatNumber(data.stats.trajets)
          });
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques:", err);
      }
    };

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

    fetchStats();
    createParticles();
  }, []);

  const stats = [
    { value: statsData.utilisateurs, label: 'Utilisateurs satisfaits', icon: Users },
    { value: statsData.chauffeurs, label: 'Chauffeurs vérifiés', icon: Car },
    { value: statsData.trajets, label: 'Trajets effectués', icon: MapPin }
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-6 text-white leading-tight">
              Votre solution de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start">mobilité</span> en Guinée
            </h1>

            <p className="text-lg  md:text-xl mb-8 text-gray-600 dark:text-gray-300 leading-relaxed">
              <span className="font-bold bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">{platform.name || 'Taka Taka'}</span> connecte passagers et chauffeurs en temps réel pour des trajets rapides, sécurisés et abordables.
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

          {/* ==================== CARROUSEL ==================== */}
          <div className="lg:w-1/2" data-aos="fade-left" data-aos-delay="200">
            <div className="relative">
              <div className="relative bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl overflow-hidden">
                {/* Gradient Orbs */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primaryGreen-start/20 rounded-full mix-blend-multiply filter blur-3xl" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primaryBlue-start/20 rounded-full mix-blend-multiply filter blur-3xl" />

                {/* Carousel Container */}
                <div className="relative rounded-xl overflow-hidden shadow-lg group">
                  {/* Images with crossfade */}
                  <div className="relative aspect-[4/3]">
                    {carouselImages.map((image, index) => (
                      <img
                        key={index}
                        src={image.src}
                        alt={image.alt}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                          index === currentSlide
                            ? isTransitioning ? 'opacity-0' : 'opacity-100'
                            : 'opacity-0'
                        }`}
                      />
                    ))}
                    {/* Subtle gradient overlay at bottom for dots contrast */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  </div>

                  {/* Navigation Arrows — visible on hover */}
                  <button
                    onClick={goPrev}
                    aria-label="Image précédente"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 dark:bg-gray-900/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 hover:scale-110 cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={goNext}
                    aria-label="Image suivante"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 dark:bg-gray-900/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40 hover:scale-110 cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
                    {carouselImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        aria-label={`Aller à l'image ${index + 1}`}
                        className={`rounded-full transition-all duration-500 ease-out cursor-pointer ${
                          index === currentSlide
                            ? 'w-8 h-3 bg-white shadow-lg shadow-white/30'
                            : 'w-3 h-3 bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start rounded-full"
                      style={{
                        animation: `carousel-progress ${CAROUSEL_INTERVAL}ms linear infinite`,
                      }}
                    />
                  </div>
                </div>

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

      {/* Carousel progress bar animation */}
      <style>{`
        @keyframes carousel-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
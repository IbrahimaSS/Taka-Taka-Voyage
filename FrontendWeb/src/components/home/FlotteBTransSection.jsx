import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Star,
  Users,
  Fuel,
  Gauge,
  Snowflake,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Shield,
  Calendar,
  Crown,
  Truck,
  Bus,
  GraduationCap,
  CircleDot,
  Loader2
} from 'lucide-react';
import Button from '../admin/ui/HomeButton';
import { locationService } from '../../services/locationService';
import { getFullAssetURL } from '../../utils/urlHelper';
import { socketService } from '../../services/socketService';
import ReservationLocationModal from './ReservationLocationModal';

// Les données statiques servent maintenant de secours initial ou sont remplacées par le chargement API
const vehiculesFlotteDemo = [
  // ... rest of static data or empty array
];

/* ─────────────── CATÉGORIES ─────────────── */
const categories = [
  { id: 'TOUS', label: 'Tous', icon: Sparkles },
  { id: 'VIP', label: 'VIP', icon: Crown },
  { id: 'SUV', label: 'SUV', icon: Car },
  { id: 'BERLINE', label: 'Berline', icon: Car },
  { id: 'ÉCONOMIQUE', label: 'Économique', icon: Gauge },
  { id: 'PICK-UP 4X4', label: '4x4', icon: Truck },
  { id: 'BUS', label: 'Bus', icon: Bus },
];

/* ─────────────── HELPER : FORMAT PRIX GNF ─────────────── */
const formatPrix = (prix) => {
  return new Intl.NumberFormat('fr-GN').format(prix);
};

/* ─────────────── BADGE CATÉGORIE ─────────────── */
const categoryStyles = {
  VIP: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  SUV: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  BERLINE: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
  ÉCONOMIQUE: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  MINIBUS: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30',
  BUS: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
  SCOLAIRE: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
};

/* ╔════════════════════════════════════════════════════════════╗
   ║               CARTE VÉHICULE PREMIUM                     ║
   ╚════════════════════════════════════════════════════════════╝ */
const VehiculeCard = ({ vehicule, index, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isDisponible = vehicule.statut === 'DISPONIBLE';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative flex-shrink-0 w-[320px] sm:w-[340px] h-[420px]"
    >
      <div className="relative flex flex-col h-full overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-900/80 backdrop-blur-sm shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primaryGreen-start/10 hover:border-primaryGreen-start/40">

        {/* ── Glow effect au hover ── */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primaryGreen-start/0 via-primaryBlue-start/0 to-primaryGreen-start/0 opacity-0 group-hover:opacity-100 group-hover:from-primaryGreen-start/20 group-hover:via-primaryBlue-start/20 group-hover:to-primaryGreen-start/20 transition-all duration-700 blur-sm -z-10" />

        {/* ── IMAGE ── */}
        <div className="relative h-48 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse" />
          )}
          <img
            src={getFullAssetURL(vehicule.photo || (vehicule.photos && vehicule.photos[0]))}
            alt={`${vehicule.marque} ${vehicule.modele}`}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Overlay gradient en bas de l'image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badge Catégorie */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${categoryStyles[vehicule.categorie] || categoryStyles.ÉCONOMIQUE}`}>
            {vehicule.categorie}
          </div>

          {/* Badge Statut */}
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
            isDisponible
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isDisponible ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {isDisponible ? 'Disponible' : 'Loué'}
          </div>

          {/* Note flottante (apparaît au hover) */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-semibold opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            {vehicule.note}
          </div>
        </div>

        {/* ── INFOS ── */}
        <div className="flex flex-col flex-grow p-5">
          {/* Titre */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primaryGreen-start group-hover:to-primaryBlue-start transition-all duration-300 truncate mb-3">
            {vehicule.marque} {vehicule.modele}
          </h3>

          {/* Caractéristiques */}
          <div className="flex items-center gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Users size={13} className="text-primaryGreen-start" />
              {(vehicule.places || vehicule.caracteristiques?.nb_places)} pl.
            </span>
            <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
            <span className="flex items-center gap-1">
              <Fuel size={13} className="text-primaryBlue-start" />
              {vehicule.carburant || vehicule.caracteristiques?.type_carburant || 'Diesel'}
            </span>
          </div>

          {/* Séparateur */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-4" />

          {/* Prix + CTA — poussé en bas */}
          <div className="flex items-end justify-between mt-auto">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">À partir de</p>
              <p className="text-lg font-extrabold bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start bg-clip-text text-transparent whitespace-nowrap">
                {formatPrix(vehicule.prix_jour)}
                <span className="text-[10px] font-medium text-gray-400 ml-1">GNF/j</span>
              </p>
            </div>

            <button
              onClick={() => onClick(vehicule)}
              disabled={!isDisponible}
              className={`relative overflow-hidden flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isDisponible
                  ? 'bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start text-white shadow-md shadow-primaryGreen-start/20 hover:shadow-lg hover:shadow-primaryGreen-start/30 hover:scale-105 active:scale-95'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {/* Shine effect au hover */}
              {isDisponible && (
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              )}
              <Calendar size={14} />
              Réserver
            </button>
          </div>
        </div>

        {/* ── Ligne de lumière en haut au hover ── */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primaryGreen-start via-primaryBlue-start to-primaryGreen-start scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
      </div>
    </motion.div>
  );
};

/* ╔════════════════════════════════════════════════════════════╗
   ║            SECTION PRINCIPALE FLOTTE BTRANS               ║
   ╚════════════════════════════════════════════════════════════╝ */
const FlotteBTransSection = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('TOUS');
  const [vehiculesFlotte, setVehiculesFlotte] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // État pour le modal de réservation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState(null);

  useEffect(() => {
    const fetchVehicules = async () => {
      try {
        const res = await locationService.getVehiculesPublics();
        if (res.donnees) {
          // On rajoute une note fictive si elle n'existe pas pour l'esthétique
          const enriched = res.donnees.map(v => ({
            ...v,
            note: v.note || (4.5 + Math.random() * 0.5).toFixed(1)
          }));
          setVehiculesFlotte(enriched);
        }
      } catch (error) {
        console.error("Erreur chargement flotte publique:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicules();

    // 📡 ÉCOUTE TEMPS RÉEL
    const handleNouveauVehicule = (data) => {
      console.log("📢 Nouveau véhicule détecté via Socket:", data);
      fetchVehicules(); // Rafraîchissement automatique
    };

    socketService.on('vehicule:nouveau', handleNouveauVehicule);

    return () => {
      socketService.off('vehicule:nouveau', handleNouveauVehicule);
    };
  }, []);

  /* Filtrage */
  const vehiculesFiltres = activeCategory === 'TOUS'
    ? vehiculesFlotte
    : vehiculesFlotte.filter((v) => v.categorie === activeCategory);

  /* Gestion du scroll */
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el?.removeEventListener('scroll', checkScroll);
  }, [vehiculesFiltres]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 370;
    el.scrollTo({
      left: el.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
      behavior: 'smooth',
    });
  };

  /* Entonnoir de conversion */
  const handleReserver = (vehicule) => {
    setSelectedVehicule(vehicule);
    setIsModalOpen(true);
  };

  return (
    <section
      id="flotte"
      className="relative py-14 px-6 overflow-hidden bg-gradient-to-b from-white via-blue-500/[0.03] to-green-500/[0.03] dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"
    >
      {/* ── Orbes de fond ── */}
      <div className="absolute top-20 -left-40 w-80 h-80 bg-primaryGreen-start/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-40 w-96 h-96 bg-primaryBlue-start/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10">

        {/* ─── HEADER ─── */}
        <div className="text-center mb-8" data-aos="fade-up">
          {/* Badge partenaire */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primaryGreen-start/10 to-primaryBlue-start/10 border border-primaryGreen-start/20 dark:border-primaryGreen-start/10 mb-4"
          >
            <Shield size={14} className="text-primaryGreen-start" />
            <span className="text-xs font-semibold text-primaryGreen-start">Partenaire Officiel — Baraka Trans</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Notre{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start">
              Flotte de Véhicules
            </span>{' '}
            à Votre Disposition
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto text-base">
            Choisissez le véhicule qui vous convient et réservez en quelques clics, directement depuis Taka-Taka.
          </p>
        </div>

        {/* ─── FILTRES CATÉGORIES ─── */}
        <div className="flex justify-center mb-6" data-aos="fade-up" data-aos-delay="100">
          <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl bg-gray-100/80 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/30">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {/* Background gradient animé pour l'actif */}
                  {isActive && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start shadow-lg shadow-primaryGreen-start/25"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon size={14} />
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── CAROUSEL ─── */}
        <div className="relative" data-aos="fade-up" data-aos-delay="200">

          {/* Flèche Gauche */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => scroll('left')}
                className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/50 shadow-xl backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-primaryGreen-start hover:to-primaryBlue-start hover:text-white hover:border-transparent hover:scale-110 transition-all duration-300"
              >
                <ChevronLeft size={20} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Flèche Droite */}
          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => scroll('right')}
                className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/50 shadow-xl backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-primaryGreen-start hover:to-primaryBlue-start hover:text-white hover:border-transparent hover:scale-110 transition-all duration-300"
              >
                <ChevronRight size={20} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />

          {/* Container scrollable */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide px-2 min-h-[400px]"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="w-full flex flex-col items-center justify-center py-20">
                   <Loader2 className="w-10 h-10 text-primaryGreen-start animate-spin mb-4" />
                   <p className="text-gray-500 animate-pulse">Chargement de la flotte...</p>
                </div>
              ) : vehiculesFiltres.length > 0 ? (
                vehiculesFiltres.map((vehicule, index) => (
                  <div key={vehicule._id || vehicule.id} style={{ scrollSnapAlign: 'start' }}>
                    <VehiculeCard
                      vehicule={vehicule}
                      index={index}
                      onClick={handleReserver}
                    />
                  </div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full py-16 text-center text-gray-400 dark:text-gray-500"
                >
                  <Car size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">Bientôt disponible</p>
                  <p className="text-sm">Nous préparons de nouveaux véhicules pour cette catégorie.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── BARRE PARTENAIRE + CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10"
        >
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-700/30 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800/60 dark:via-gray-900/80 dark:to-gray-800/60 backdrop-blur-sm p-8 md:p-10">
            {/* Glow de fond */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primaryGreen-start/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primaryBlue-start/5 rounded-full blur-3xl" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Infos */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Logo BTrans */}
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primaryGreen-start to-primaryBlue-start shadow-lg shadow-primaryGreen-start/20">
                  <Car className="text-white" size={28} />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Baraka Trans — <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start">Partenaire Officiel</span>
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg">
                    Location de véhicules pour particuliers, entreprises et chauffeurs professionnels.
                  </p>
                </div>
              </div>

              {/* Stats rapides + CTA */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-6 text-center text-sm">
                  <div>
                    <p className="text-2xl font-extrabold bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start bg-clip-text text-transparent">50+</p>
                    <p className="text-gray-400 text-xs">Véhicules</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <p className="text-2xl font-extrabold bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start bg-clip-text text-transparent">5</p>
                    <p className="text-gray-400 text-xs">Catégories</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <p className="text-2xl font-extrabold bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start bg-clip-text text-transparent">24/7</p>
                    <p className="text-gray-400 text-xs">Support</p>
                  </div>
                </div>

                <Button
                  variant="gradientMix"
                  size="lg"
                  onClick={() => document.getElementById('flotte')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  icon={<ArrowRight size={18} />}
                  iconPosition="right"
                >
                  Voir toute la flotte
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Modal de Réservation ── */}
      <ReservationLocationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        vehicule={selectedVehicule} 
      />

      {/* ── Style pour cacher la scrollbar ── */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default FlotteBTransSection;

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Shield, Star, Bell, ArrowRight } from 'lucide-react';
import { socketService } from '../../services/socketService';
import { getFullAssetURL } from '../../utils/urlHelper';

const SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const NouveauVehiculeAlerte = () => {
  const [show, setShow] = useState(false);
  const [vehicule, setVehicule] = useState(null);
  
  // Utiliser une référence pour l'audio pour éviter les rechargements inutiles
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialiser l'audio au montage
    audioRef.current = new Audio(SOUND_URL);
    audioRef.current.load();

    const handleNouveau = (data) => {
      console.log("🎁 Signal reçu pour Popup:", data);
      
      // RÉCUPÉRER L'IDENTITÉ ACTUELLE
      const identity = socketService.identity;
      
      // SI C'EST UN ADMIN, ON NE MONTRE PAS LA POPUP (C'EST LUI QUI AJOUTE)
      if (identity && identity.role === 'ADMIN') {
        console.log("🚫 Admin détecté, on ignore la popup locale");
        return;
      }

      if (data.vehicule) {
        setVehicule(data.vehicule);
        setShow(true);
        
        // Jouer le son (avec gestion de l'interaction utilisateur)
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.log("🔈 Son bloqué par le navigateur (cliquez d'abord sur la page)"));
        }

        // Fermeture auto après 12 secondes
        setTimeout(() => setShow(false), 12000);
      }
    };

    socketService.on('vehicule:nouveau', handleNouveau);
    return () => socketService.off('vehicule:nouveau', handleNouveau);
  }, []);

  return (
    <AnimatePresence>
      {show && vehicule && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          style={{ zIndex: 99999 }}
          className="fixed bottom-10 right-10 w-[380px] overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-emerald-500/50"
        >
          {/* Header Progress Bar */}
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 10, ease: "linear" }}
            className="h-1 bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start"
          />

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primaryGreen-start/10 text-primaryGreen-start">
                  <Bell size={18} className="animate-bounce" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nouveauté Baraka Trans</span>
              </div>
              <button 
                onClick={() => setShow(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="flex gap-4">
              {/* Image */}
              <div className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                <img 
                  src={getFullAssetURL(vehicule.photos?.[0])} 
                  alt="" 
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {vehicule.marque} {vehicule.modele}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primaryGreen-start/10 text-primaryGreen-start font-medium border border-primaryGreen-start/20">
                    {vehicule.categorie}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[10px] font-bold">5.0</span>
                  </div>
                </div>
                <p className="mt-2 text-xs font-extrabold text-primaryGreen-start">
                  {new Intl.NumberFormat('fr-GN').format(vehicule.prix_jour)} GNF <span className="text-[10px] text-gray-400 font-normal">/jour</span>
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                setShow(false);
                document.getElementById('flotte')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start text-white text-xs font-bold hover:shadow-lg hover:shadow-primaryGreen-start/20 transition-all active:scale-95"
            >
              Découvrir maintenant
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NouveauVehiculeAlerte;

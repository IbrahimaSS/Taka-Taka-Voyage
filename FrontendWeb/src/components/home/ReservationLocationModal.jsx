import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Info, ShieldCheck, Wallet, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { locationService } from '../../services/locationService';
import { getFullAssetURL } from '../../utils/urlHelper';
import Button from '../../ui/Buttons';

const ReservationLocationModal = ({ isOpen, onClose, vehicule }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Dates par défaut (Aujourd'hui et demain)
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [dates, setDates] = useState({
    debut: today,
    fin: tomorrow
  });
  const [typeUsage, setTypeUsage] = useState('PERSONNEL');

  const [totalPrice, setTotalPrice] = useState(0);
  const [daysCount, setDaysCount] = useState(1);

  // Calculer le prix dès que les dates changent
  useEffect(() => {
    if (dates.debut && dates.fin && vehicule) {
      const d1 = new Date(dates.debut);
      const d2 = new Date(dates.fin);
      const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
      const nbJours = diff > 0 ? diff : 1;
      setDaysCount(nbJours);
      setTotalPrice(nbJours * vehicule.prix_jour);
    }
  }, [dates, vehicule]);

  const handleSubmit = async () => {
    // 1. Vérification d'authentification
    const hasUser = !!localStorage.getItem('user');

    if (!isAuthenticated && !hasUser) {
      setError("Veuillez vous connecter à votre compte Taka-Taka pour effectuer une réservation.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await locationService.reserverVehicule({
        vehiculeId: vehicule._id || vehicule.id,
        date_debut: dates.debut,
        date_fin: dates.fin,
        type_usage: typeUsage
      });

      if (response.succes) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error("❌ Détails Erreur Réservation:", err);

      let errorMsg = "Une erreur est survenue lors de la réservation.";

      if (err) {
        if (typeof err === 'string') {
          errorMsg = err;
        } else if (err.message) {
          errorMsg = err.message;
        } else if (err.erreur) {
          errorMsg = err.erreur;
        }
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !vehicule) return null;

  // Helper de formatage sécurisé
  const formatMoney = (amount) => {
    try {
      return new Intl.NumberFormat('fr-GN').format(amount || 0);
    } catch (e) {
      return amount || 0;
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-none">
          {/* Overlay global */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal Card - Centré et flottant */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-y-auto pointer-events-auto flex flex-col max-h-[90vh] border border-white/10"
          >
          {success ? (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="animate-bounce" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Demande envoyée !</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 px-4">Votre réservation est en attente de confirmation.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Header avec Image en haut - Plus grande */}
              <div className="relative h-56 flex-shrink-0">
                <img
                  src={getFullAssetURL(vehicule.photos?.[0])}
                  alt={vehicule.modele}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white transition-all hover:scale-110">
                  <X size={20} />
                </button>
                <div className="absolute bottom-6 left-8">
                  <p className="text-emerald-400 text-xs uppercase tracking-[0.2em] font-black mb-1">{vehicule.categorie}</p>
                  <h3 className="text-3xl font-black text-white tracking-tight">{vehicule.marque} {vehicule.modele}</h3>
                </div>
              </div>

              {/* Formulaire - Plus espacé */}
              <div className="p-8 space-y-6 flex-1">
                {/* Tarifs */}
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tarif / Jour</p>
                    <p className="text-xl font-black text-emerald-500">{formatMoney(vehicule.prix_jour)} <span className="text-[10px] text-slate-400">GNF</span></p>
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Caution GNF</p>
                    <p className="text-xl font-black text-amber-500">{formatMoney(vehicule.caution)} <span className="text-[10px] text-slate-400">GNF</span></p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Date de début</label>
                    <div className="relative">
                      <input
                        type="date"
                        min={today}
                        value={dates.debut}
                        onChange={(e) => setDates({ ...dates, debut: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-100 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Date de fin</label>
                    <div className="relative">
                      <input
                        type="date"
                        min={dates.debut || today}
                        value={dates.fin}
                        onChange={(e) => setDates({ ...dates, fin: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-100 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Recap Prix */}
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Estimation</p>
                      <p className="text-xs text-slate-500 font-medium italic">Calculé pour {daysCount} jour(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-emerald-600 tracking-tight">{formatMoney(totalPrice)} <span className="text-xs">GNF</span></p>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-[10px] text-red-500 font-bold text-center px-2">{error}</p>
                )}

                <Button
                  variant="primary"
                  fullWidth
                  className="h-12 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "CONFIRMER LA RÉSERVATION"}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>,
  document.body
);
};

export default ReservationLocationModal;

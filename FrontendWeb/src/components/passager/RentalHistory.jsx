import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Car, MapPin, Clock, History, 
  CheckCircle2, AlertCircle, Info, Receipt, 
  ChevronRight, ArrowLeftRight, Fuel, Gauge, Shield,
  RefreshCcw, Search, X, Users
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { locationService } from '../../services/locationService';
import { getFullAssetURL } from '../../utils/urlHelper';
import Badge from '../admin/ui/Badge';
import Card, { CardContent } from '../admin/ui/Card';
import Button from '../admin/ui/Bttn';
import toast from 'react-hot-toast';
import PremiumInvoice from '../admin/ui/PremiumInvoice';

const RentalHistory = () => {
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [confirmModal, setConfirmModal] = useState(null);
  const [selectedRentalForInvoice, setSelectedRentalForInvoice] = useState(null);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      // On récupère les réservations (le backend filtre déjà par utilisateur connecté)
      const res = await locationService.getMesReservations();
      setRentals(res.donnees || []);
    } catch (error) {
      console.error("Erreur chargement locations:", error);
      toast.error("Impossible de charger vos locations");
    } finally {
      setLoading(false);
    }
  };

  const handleSignalerRetour = async () => {
    if (!confirmModal) return;
    
    try {
      await locationService.signalerRetour(confirmModal);
      toast.success("Retour signalé avec succès !");
      setConfirmModal(null);
      fetchRentals(); // Recharger la liste
    } catch (error) {
      toast.error(error.message || "Erreur lors du signalement");
      setConfirmModal(null);
    }
  };

  const filteredRentals = rentals.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return ['EN_COURS', 'APPROUVÉE', 'RETOUR_SIGNALÉ'].includes(r.statut);
    if (activeFilter === 'completed') return r.statut === 'TERMINÉE';
    return true;
  });

  const mapRentalToInvoice = (rental) => {
    if (!rental) return null;
    return {
      reference: rental.reference || `LOC-${rental._id.substring(18).toUpperCase()}`,
      amount: `${rental.montant_total?.toLocaleString()} GNF`,
      date: new Date(rental.updatedAt || rental.createdAt).toLocaleDateString(),
      method: 'Taka Wallet / Orange Money',
      status: 'paid',
      passenger: {
        name: rental.passager?.nomComplet || currentUser?.nomComplet || 'Client TakaTaka',
        phone: rental.passager?.telephone || currentUser?.telephone || '-',
        email: rental.passager?.email || currentUser?.email || '-'
      },
      driver: {
        name: 'Baraka Trans (Flotte)',
        vehicle: `${rental.vehicule?.marque} ${rental.vehicule?.modele} (${rental.vehicule?.immatriculation || 'En attente'})`,
        phone: '+224 000 00 00 00',
        email: 'location@barakatrans.gn'
      },
      trip: {
        route: `Agence de Livraison → Point de Retour`,
        distance: '-',
        duration: `${Math.ceil((new Date(rental.date_fin_prevue) - new Date(rental.date_debut)) / (1000 * 60 * 60 * 24))} jours`
      }
    };
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'EN_ATTENTE': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600', label: 'En attente' };
      case 'APPROUVÉE': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600', label: 'Approuvée' };
      case 'EN_COURS': return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600', label: 'En cours' };
      case 'RETOUR_SIGNALÉ': return { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600', label: 'Retour signalé' };
      case 'TERMINÉE': return { bg: 'bg-gray-50 dark:bg-gray-900/40', text: 'text-gray-500', label: 'Terminée' };
      case 'ANNULÉE': return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600', label: 'Annulée' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-500', label: status };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 animate-pulse font-medium">Chargement de vos locations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
            <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20">
              <Car className="w-6 h-6 text-white" />
            </div>
            Mes Locations
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Retrouvez l'historique de vos locations et gérez vos retours.</p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeFilter === 'all' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Toutes
          </button>
          <button 
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeFilter === 'active' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Actives
          </button>
          <button 
            onClick={() => setActiveFilter('completed')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeFilter === 'completed' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Terminées
          </button>
        </div>
      </div>

      {filteredRentals.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-xl">
          <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <History className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucune location trouvée</h3>
          <p className="text-gray-500 max-w-xs mx-auto mb-8 font-medium">Vous n'avez pas encore effectué de location de véhicule sur TakaTaka.</p>
          <Button variant="primary" size="large" className="px-8 shadow-lg shadow-emerald-500/30">
            Louer un véhicule maintenant
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRentals.map((rental) => {
              const statusStyle = getStatusStyle(rental.statut);
              return (
                <motion.div
                  key={rental._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card hoverable className="h-full overflow-hidden border-none shadow-xl bg-white dark:bg-gray-800 group">
                    <CardContent padding="p-0">
                      <div className="flex flex-col h-full">
                        {/* Image et Statut */}
                        <div className="relative h-48 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                          <img 
                            src={getFullAssetURL(rental.vehicule?.photos?.[0])} 
                            alt={`${rental.vehicule?.marque} ${rental.vehicule?.modele}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full backdrop-blur-md border ${statusStyle.bg} ${statusStyle.text} text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                            {statusStyle.label}
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-4 left-4">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">
                              {rental.vehicule?.marque} {rental.vehicule?.modele}
                            </h3>
                            <p className="text-white/80 text-xs font-medium font-mono">Ref: #{rental.reference?.split('-').pop()}</p>
                          </div>
                          
                          {/* Alerte Retard Passager */}
                          {(rental.statut === 'EN_COURS' || rental.statut === 'RETOUR_SIGNALÉ') && new Date() > new Date(rental.date_fin_prevue) && (
                            <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-[10px] font-black text-center py-1 animate-bounce shadow-lg uppercase tracking-tighter">
                              ⚠️ DÉLAI DÉPASSÉ - VEUILLEZ RAMENER LE VÉHICULE !
                            </div>
                          )}
                        </div>

                        {/* Détails */}
                        <div className="p-6 space-y-5 flex-1">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Début</p>
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Calendar className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-bold">{new Date(rental.date_debut).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fin Prévue</p>
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Calendar className="w-4 h-4 text-rose-500" />
                                <span className="text-sm font-bold">{new Date(rental.date_fin_prevue).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
                             <div>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Payé</p>
                               <p className="text-lg font-black text-gray-900 dark:text-white">{rental.montant_total?.toLocaleString()} GNF</p>
                             </div>
                             <div className="text-right">
                               <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Caution Gelée</p>
                               <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{rental.caution_bloquee?.toLocaleString()} GNF</p>
                             </div>
                          </div>

                          {/* Action Button */}
                          {rental.statut === 'EN_COURS' && (
                            <button
                              onClick={() => setConfirmModal(rental._id)}
                              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                            >
                              SIGNALER LE RETOUR DU VÉHICULE
                              <RefreshCcw className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-500" />
                            </button>
                          )}

                          {rental.statut === 'RETOUR_SIGNALÉ' && (
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-800/30 text-center">
                              <p className="text-sm text-purple-600 dark:text-purple-400 font-bold animate-pulse flex items-center justify-center gap-2">
                                <Clock className="w-5 h-5" />
                                En attente de vérification par l'admin...
                              </p>
                            </div>
                          )}

                          {rental.statut === 'TERMINÉE' && (
                            <Button 
                              variant="outline" 
                              className="w-full border-gray-200 dark:border-gray-700 text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-all" 
                              icon={Receipt}
                              onClick={() => setSelectedRentalForInvoice(rental)}
                            >
                              Voir la facture finale
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modale Personnalisée de Confirmation */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setConfirmModal(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                  Confirmer le retour ?
                </h3>
                
                <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium leading-relaxed">
                  Voulez-vous signaler que vous avez rendu le véhicule ? 
                  <br className="hidden sm:block" />
                  <span className="text-xs mt-2 inline-block text-amber-500 bg-amber-50 dark:bg-amber-900/10 px-3 py-1 rounded-full">
                    L'administrateur devra valider pour clôturer la location.
                  </span>
                </p>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setConfirmModal(null)}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleSignalerRetour}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Oui, je confirme <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Affichage de la Facture Premium */}
      {selectedRentalForInvoice && (
        <PremiumInvoice 
          payment={mapRentalToInvoice(selectedRentalForInvoice)} 
          onClose={() => setSelectedRentalForInvoice(null)} 
        />
      )}
    </div>
  );
};


export default RentalHistory;

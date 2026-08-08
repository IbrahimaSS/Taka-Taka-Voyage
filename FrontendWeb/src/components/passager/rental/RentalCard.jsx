import { motion } from 'framer-motion';
import { Calendar, Clock, Receipt, RefreshCcw } from 'lucide-react';
import { getFullAssetURL } from '../../../utils/urlHelper';
import Card, { CardContent } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';

const RentalCard = ({ rental, statusStyle, onSignalerRetour, onViewInvoice }) => (
  <motion.div
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
                onClick={onSignalerRetour}
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
                onClick={onViewInvoice}
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

export default RentalCard;

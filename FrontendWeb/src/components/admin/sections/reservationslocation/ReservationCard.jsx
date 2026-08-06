import { motion } from 'framer-motion';
import { User, Car, Calendar, CheckCircle2, XCircle, Loader2, Trash2 } from 'lucide-react';
import { getFullAssetURL } from '../../../../utils/urlHelper';
import { statutColors, statutLabels, formatDate, formatPrix, isLate } from './reservationHelpers';

const ReservationCard = ({ reservation, index, actionLoading, onApprouver, onRefuser, onDemarrer, onConfirmerRetour, onSupprimer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white dark:bg-slate-800 rounded-xl border p-4 md:p-5 transition-all hover:shadow-md ${reservation.statut === 'EN_ATTENTE'
        ? 'border-yellow-300 dark:border-yellow-700 shadow-sm shadow-yellow-100 dark:shadow-yellow-900/10'
        : 'border-slate-200 dark:border-slate-700'
        }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Infos principales */}
        <div className="flex items-center gap-4 flex-1">
          {/* Photo véhicule */}
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
            {reservation.vehicule?.photos?.[0] ? (
              <img
                src={getFullAssetURL(reservation.vehicule.photos[0])}
                alt="Véhicule"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="w-6 h-6 text-slate-400" />
              </div>
            )}
          </div>

          {/* Détails */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {reservation.vehicule?.marque} {reservation.vehicule?.modele}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statutColors[reservation.statut] || ''}`}>
                {statutLabels[reservation.statut] || reservation.statut}
              </span>
              {isLate(reservation) && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse border border-red-200 dark:border-red-800">
                  ⚠️ RETARD
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Réf: <span className="font-mono font-bold">{reservation.reference}</span>
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {reservation.client?.prenom} {reservation.client?.nom}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(reservation.date_debut)} → {formatDate(reservation.date_fin_prevue)}
              </span>
            </div>
          </div>
        </div>

        {/* Montants */}
        <div className="flex flex-wrap items-center justify-end gap-3 md:gap-6 text-right">
          <div>
            <p className="text-xs text-slate-400">Total</p>
            <p className="font-bold text-slate-900 dark:text-white">{formatPrix(reservation.montant_total)} GNF</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Caution</p>
            <p className="font-bold text-amber-600">{formatPrix(reservation.caution_bloquee)} GNF</p>
          </div>

          {/* Actions */}
          {reservation.statut === 'EN_ATTENTE' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApprouver(reservation._id)}
                disabled={actionLoading === reservation._id}
                className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {actionLoading === reservation._id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Approuver
              </button>
              <button
                onClick={() => onRefuser(reservation._id)}
                disabled={actionLoading === reservation._id}
                className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Refuser
              </button>
            </div>
          )}

          {/* Bouton Démarrer si Approuvée */}
          {reservation.statut === 'APPROUVÉE' && (
            <button
              onClick={() => onDemarrer(reservation._id)}
              disabled={actionLoading === reservation._id}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {actionLoading === reservation._id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Car className="w-3.5 h-3.5" />
              )}
              Démarrer
            </button>
          )}

          {/* Bouton Confirmer Retour si Retour Signalé ou En Cours */}
          {(reservation.statut === 'RETOUR_SIGNALÉ' || reservation.statut === 'EN_COURS') && (
            <button
              onClick={() => onConfirmerRetour(reservation._id)}
              disabled={actionLoading === reservation._id}
              className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {actionLoading === reservation._id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Confirmer Retour
            </button>
          )}

          {/* Bouton Supprimer (toujours visible pour les admins pour nettoyer) */}
          <button
            onClick={() => onSupprimer(reservation._id)}
            disabled={actionLoading === reservation._id}
            title="Supprimer la réservation"
            className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            {actionLoading === reservation._id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReservationCard;

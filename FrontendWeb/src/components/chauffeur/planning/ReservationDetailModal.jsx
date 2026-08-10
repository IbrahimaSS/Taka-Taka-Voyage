import { MapPin, Clock, CreditCard, Calendar, Phone, Navigation, Car as CarIcon, XCircle, User as UserIcon } from 'lucide-react';

const ReservationDetailModal = ({ viewingDetails, onClose, formatDisplayDate, onCall, onStartTrip }) => {
  if (!viewingDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="relative min-h-[8rem] bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start p-4 sm:p-6 flex items-end shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border-2 border-white overflow-hidden shrink-0">
              {viewingDetails.passager?.photo ? (
                <img src={viewingDetails.passager.photo} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-blue-500" />
              )}
            </div>
            <div className="text-white pb-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold leading-tight truncate">
                {viewingDetails.passager?.prenom} {viewingDetails.passager?.nom}
              </h3>
              <p className="opacity-80 text-sm flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                {new Date(viewingDetails.datePlanifiee).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Corps Modal */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {/* Adresse et Trajet */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Départ</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{viewingDetails.depart}</p>
              </div>
            </div>

            <div className="ml-3 border-l-2 border-dashed border-gray-200 dark:border-gray-700 h-6"></div>

            <div className="flex items-start gap-3">
              <div className="mt-1 w-6 h-6 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Destination</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{viewingDetails.destination}</p>
              </div>
            </div>
          </div>

          {/* Infos Financières et Véhicule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Prix Estimé</p>
              <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                {(viewingDetails.prix || 0).toLocaleString()} GNF
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Véhicule</p>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200 capitalize flex items-center justify-center gap-1">
                <CarIcon className="w-4 h-4 text-primaryGreen-start shrink-0" />
                {viewingDetails.typeVehicule?.toLowerCase() || 'Standard'}
              </p>
            </div>
          </div>

          {/* Détails complémentaires */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 min-w-0">
                <CreditCard className="w-4 h-4 shrink-0" />
                <span className="text-sm truncate">Méthode de Paiement</span>
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded uppercase shrink-0">
                {viewingDetails.paiement?.methode || 'CASH'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 min-w-0">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="text-sm truncate">Date de réservation</span>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white text-right shrink-0">
                {formatDisplayDate(new Date(viewingDetails.datePlanifiee))}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-700 flex gap-3 shrink-0">
          <button
            onClick={() => onCall(viewingDetails.passager?.telephone)}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-800 border-2 border-primaryBlue-start text-primaryBlue-start hover:bg-primaryBlue-start hover:text-white rounded-xl font-bold transition-all active:scale-95"
          >
            <Phone className="w-4 h-4" /> Appeler
          </button>
          {viewingDetails.statut === 'ACCEPTEE' && (
            <button
              onClick={() => onStartTrip(viewingDetails._id)}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start text-white rounded-xl font-bold transition-all shadow-lg shadow-primaryGreen-start/20 active:scale-95 border-0 hover:brightness-110"
            >
              <Navigation className="w-4 h-4" /> Démarrer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailModal;

import { XCircle, Trash2, Car, CheckCircle2 } from 'lucide-react';
import Modal from '../../ui/Modal';
import AdminButton from '../../ui/Bttn';

const ReservationActionModals = ({
  isRefusalModalOpen, onCloseRefusal, refusalMotif, onRefusalMotifChange, onConfirmRefuser,
  isDeleteModalOpen, onCloseDelete, onConfirmSupprimer,
  isDemarrerModalOpen, onCloseDemarrer, onConfirmDemarrer,
  isRetourModalOpen, onCloseRetour, onConfirmRetour,
}) => {
  return (
    <>
      {/* Modal de Confirmation de Refus */}
      <Modal isOpen={isRefusalModalOpen} onClose={onCloseRefusal} title="Refuser la réservation" icon={XCircle}>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">
              Voulez-vous vraiment refuser cette demande ? La caution sera automatiquement recréditée sur le compte du client.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
              Motif du refus (optionnel)
            </label>
            <textarea
              value={refusalMotif}
              onChange={(e) => onRefusalMotifChange(e.target.value)}
              placeholder="Ex: Véhicule indisponible, profil non conforme..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <AdminButton variant="outline" className="flex-1" onClick={onCloseRefusal}>
              Annuler
            </AdminButton>
            <AdminButton variant="perso" className="flex-1 bg-red-600 hover:bg-red-700 border-red-600" onClick={onConfirmRefuser}>
              Confirmer le refus
            </AdminButton>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmation de Suppression */}
      <Modal isOpen={isDeleteModalOpen} onClose={onCloseDelete} title="Supprimer la réservation" icon={Trash2}>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">
              Êtes-vous sûr de vouloir supprimer définitivement cette réservation ? Cette action est irréversible et effacera toutes les données associées de l'historique.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <AdminButton variant="outline" className="flex-1" onClick={onCloseDelete}>
              Annuler
            </AdminButton>
            <AdminButton variant="perso" className="flex-1 bg-red-600 hover:bg-red-700 border-red-600 text-white" onClick={onConfirmSupprimer}>
              Confirmer la suppression
            </AdminButton>
          </div>
        </div>
      </Modal>

      {/* Modal Confirmation Démarrage */}
      <Modal isOpen={isDemarrerModalOpen} onClose={onCloseDemarrer} title="Démarrer la location" icon={Car}>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Voulez-vous marquer cette location comme démarrée ? Cela signifie que vous avez remis les clés et le véhicule au client.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <AdminButton variant="outline" className="flex-1" onClick={onCloseDemarrer}>
              Annuler
            </AdminButton>
            <AdminButton variant="primary" className="flex-1" onClick={onConfirmDemarrer}>
              Démarrer la location
            </AdminButton>
          </div>
        </div>
      </Modal>

      {/* Modal Confirmation Retour */}
      <Modal isOpen={isRetourModalOpen} onClose={onCloseRetour} title="Confirmer le retour" icon={CheckCircle2}>
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Confirmez-vous la réception du véhicule ? Cette action remboursera automatiquement la caution sur le solde du client.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <AdminButton variant="outline" className="flex-1" onClick={onCloseRetour}>
              Annuler
            </AdminButton>
            <AdminButton variant="primary" className="flex-1 bg-emerald-600 hover:bg-emerald-700 border-emerald-600" onClick={onConfirmRetour}>
              Confirmer le retour
            </AdminButton>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ReservationActionModals;

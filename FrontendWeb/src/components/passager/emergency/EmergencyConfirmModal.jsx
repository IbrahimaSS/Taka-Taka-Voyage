import { Bell, MapPin } from 'lucide-react';
import ConfirmModal from '../../admin/ui/ConfirmModal';

const EmergencyConfirmModal = ({ show, onClose, onConfirm, isSendingAlert, lastLocation }) => (
  <ConfirmModal
    isOpen={show}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Alerte d'urgence"
    message="Êtes-vous sûr de vouloir envoyer un signal d'urgence ? Votre position sera partagée avec les autorités et vos contacts d'urgence."
    type="error"
    confirmText="Oui, alerter les secours"
    cancelText="Non, annuler"
    confirmVariant="danger"
    loading={isSendingAlert}
    destructive={true}
    size="sm"
  >
    <div className="space-y-4">
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
        <div className="flex items-center">
          <Bell className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
          <p className="text-sm text-red-700 dark:text-red-300">
            Un signal sera envoyé aux services de secours suivants :
          </p>
        </div>
        <ul className="mt-2 space-y-1 text-sm text-red-600 dark:text-red-400">
          <li>• Centre de sécurité TakaTaka</li>
          <li>• Police nationale (117)</li>
          <li>• Votre contact d'urgence</li>
        </ul>
      </div>

      {lastLocation && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Votre position sera partagée :
            </p>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Lat: {lastLocation.lat.toFixed(6)}, Lng: {lastLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  </ConfirmModal>
);

export default EmergencyConfirmModal;

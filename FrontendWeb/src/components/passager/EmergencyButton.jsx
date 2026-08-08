import { AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Button from '../admin/ui/Bttn';
import Modal from '../admin/ui/Modal';
import Card, { CardContent } from '../admin/ui/Card';
import { useEmergencyButton } from './emergency/useEmergencyButton';
import EmergencyFloatingButton from './emergency/EmergencyFloatingButton';
import EmergencyContactsList from './emergency/EmergencyContactsList';
import ActiveCallCard from './emergency/ActiveCallCard';
import EmergencyConfirmModal from './emergency/EmergencyConfirmModal';

const EmergencyButton = () => {
  const {
    contacts,
    showModal,
    setShowModal,
    showConfirm,
    setShowConfirm,
    isSendingAlert,
    lastLocation,
    isCalling,
    callingService,
    isLogging,
    handleEmergencyCall,
    handleQuickCall,
    stopCall,
  } = useEmergencyButton();

  return (
    <>
      <EmergencyFloatingButton onClick={() => setShowModal(true)} />

      {/* Modal d'urgence principal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="md"
        closeOnOverlayClick={true}
      >
        <div className="space-y-6">
          {/* En-tête d'urgence */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-2xl p-6 text-white -mt-6 -mx-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Signal d'urgence</h2>
                  <p className="text-red-100 text-sm">
                    Votre position sera partagée avec les autorités
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contacts d'urgence ou Appel en cours */}
          <AnimatePresence mode="wait">
            {!isCalling ? (
              <EmergencyContactsList contacts={contacts} onQuickCall={handleQuickCall} />
            ) : (
              <ActiveCallCard callingService={callingService} isLogging={isLogging} onStopCall={stopCall} />
            )}
          </AnimatePresence>

          {/* Message d'avertissement */}
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                    Important
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Utilisez ce bouton uniquement en cas de véritable urgence.
                    Un usage abusif peut entraîner des sanctions légales.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => setShowConfirm(true)}
              icon={AlertTriangle}
            >
              Alerter les secours
            </Button>
          </div>
        </div>
      </Modal>

      <EmergencyConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleEmergencyCall}
        isSendingAlert={isSendingAlert}
        lastLocation={lastLocation}
      />
    </>
  );
};

export default EmergencyButton;

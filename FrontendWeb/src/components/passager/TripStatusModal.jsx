import { useTranslation } from 'react-i18next';

import Modal from '../admin/ui/Modal';

import { useStatusConfig } from './status/useStatusConfig';
import { useCancelTrip } from './status/useCancelTrip';
import SearchingStatusCard from './status/SearchingStatusCard';
import DriverFoundCard from './status/DriverFoundCard';
import OtherStatusCard from './status/OtherStatusCard';
import CancelTripConfirm from './status/CancelTripConfirm';

const TripStatusModal = ({
  isOpen,
  onClose,
  status,
  driver,
  tripDetails,
  onCancel,
  onTripComplete,
  onStartTrip,
  onViewPlanning,
  onSearchAgain,
  onRateTrip,
  arrivalSecondsRemaining,
  onContact,
  onTrack,
}) => {
  const { t } = useTranslation();
  const statusConfig = useStatusConfig(status);
  const {
    showCancelConfirm, setShowCancelConfirm,
    cancelReason, setCancelReason,
    isCancelling,
    handleCancel,
    closeCancelConfirm,
  } = useCancelTrip(onCancel);

  const handleStartTrip = () => {
    onStartTrip?.(tripDetails, driver);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={status !== "searching"}>
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{statusConfig.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{statusConfig.description}</p>
          </div>

          {status === "searching" && (
            <SearchingStatusCard onCancelClick={() => setShowCancelConfirm(true)} />
          )}
          {status === "driver_found" && (
            <DriverFoundCard
              driver={driver}
              tripDetails={tripDetails}
              arrivalSecondsRemaining={arrivalSecondsRemaining}
              onContact={onContact}
              onTrack={onTrack}
              onCancelClick={() => setShowCancelConfirm(true)}
            />
          )}
          {status !== "searching" && status !== "driver_found" && (
            <OtherStatusCard
              status={status}
              onStartTrip={handleStartTrip}
              onTripComplete={onTripComplete}
              onViewPlanning={onViewPlanning}
              onSearchAgain={onSearchAgain}
              onClose={onClose}
              onRateTrip={onRateTrip}
            />
          )}
        </div>
      </Modal>

      <CancelTripConfirm
        isOpen={showCancelConfirm}
        onClose={closeCancelConfirm}
        onConfirm={handleCancel}
        isCancelling={isCancelling}
        cancelReason={cancelReason}
        onCancelReasonChange={setCancelReason}
      />
    </>
  );
};

export default TripStatusModal;

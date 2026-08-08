// TripConfirmationModal.jsx - Version avec services dynamiques admin
import { useTranslation } from "react-i18next";
import { Car } from "lucide-react";

import Modal from "../admin/ui/Modal";
import Button from "../admin/ui/Bttn";

import PaymentModal from "./PaymentModal";
import { useTripConfirmation } from "./confirmation/useTripConfirmation";
import ItinerarySummary from "./confirmation/ItinerarySummary";
import TripTypeToggle from "./confirmation/TripTypeToggle";
import PaymentTimeToggle from "./confirmation/PaymentTimeToggle";
import VehicleSelector from "./confirmation/VehicleSelector";
import PriceSummary from "./confirmation/PriceSummary";

const TripConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  tripDetails = {},
  user,
}) => {
  const { t } = useTranslation();

  const {
    selectedVehicle, setSelectedVehicle,
    tripType, setTripType,
    paymentTime, setPaymentTime,
    scheduleDate, setScheduleDate,
    scheduleTime, setScheduleTime,
    isConfirming,
    showPayment, setShowPayment,
    pendingTripData,
    vehicles, loadingServices,
    selectedVehicleData,
    basePrice, serviceFee, totalPrice,
    handleConfirm,
    handlePaymentSuccess,
  } = useTripConfirmation({ isOpen, tripDetails, onConfirm, onClose });

  return (
    <>
      {/* On masque TripConfirmationModal quand PaymentModal est ouvert */}
      <Modal
        isOpen={isOpen && !showPayment}
        onClose={onClose}
        size="xl"
        closeOnOverlayClick={false}
      >
        <div className="space-y-8">
          {/* En-tête */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {t('confirmation.title')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('confirmation.subtitle')}
                </p>
              </div>
            </div>
          </div>

          <ItinerarySummary tripDetails={tripDetails} />

          <TripTypeToggle
            tripType={tripType}
            onTripTypeChange={setTripType}
            scheduleDate={scheduleDate}
            onScheduleDateChange={setScheduleDate}
            scheduleTime={scheduleTime}
            onScheduleTimeChange={setScheduleTime}
          />

          <PaymentTimeToggle
            paymentTime={paymentTime}
            onPaymentTimeChange={setPaymentTime}
            tripType={tripType}
          />

          <VehicleSelector
            vehicles={vehicles}
            loadingServices={loadingServices}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
          />

          <PriceSummary basePrice={basePrice} serviceFee={serviceFee} totalPrice={totalPrice} />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button variant="secondary" fullWidth onClick={onClose} className="sm:flex-1">
              {t('confirmation.modify_btn')}
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleConfirm}
              loading={isConfirming}
              icon={Car}
              className="sm:flex-1"
              disabled={!selectedVehicleData?.enabled}
            >
              {paymentTime === "advance" ? t('confirmation.confirm_pay_btn') : t('confirmation.confirm_search_btn')}
            </Button>
          </div>
        </div>
      </Modal>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => {
          if (!isConfirming) setShowPayment(false);
        }}
        onSuccess={handlePaymentSuccess}
        amount={totalPrice}
        tripDetails={pendingTripData || tripDetails}
        user={user}
      />
    </>
  );
};

export default TripConfirmationModal;

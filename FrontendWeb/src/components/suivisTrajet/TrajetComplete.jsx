// components/passenger/TripComplete.jsx
import { useTripComplete } from './complete/useTripComplete';
import CompleteHeader from './complete/CompleteHeader';
import SuccessBanner from './complete/SuccessBanner';
import TripInfoCard from './complete/TripInfoCard';
import PaymentSection from './complete/PaymentSection';
import NextStepsCards from './complete/NextStepsCards';
import CompleteFooter from './complete/CompleteFooter';
import DriverConfirmModal from './complete/DriverConfirmModal';

const TripComplete = ({
  trip,
  driver,
  onPaymentSuccess,
  onBack,
  role = 'passenger' // 'passenger' or 'driver'
}) => {
  const {
    currentTime,
    selectedPayment,
    otpValues,
    phoneNumber,
    setPhoneNumber,
    otpTimer,
    isProcessing,
    isRefreshing,
    localTrip,
    showConfirmModal,
    setShowConfirmModal,
    tripData,
    paymentStatus,
    waitingForDriverConfirmation,
    confettiContainerRef,
    otpRefs,
    totalAmount,
    isPrepaid,
    finalIsPrepaid,
    refreshTripData,
    handleOtpChange,
    handleOtpKeyDown,
    handlePaymentMethodSelect,
    handlePaymentComplete,
    handleDriverConfirmPayment,
    handleReportProblem,
    handleGoBack,
    handleGoHome,
    handleViewHistory,
    handleNewBooking,
  } = useTripComplete({ trip, driver, onPaymentSuccess, onBack, role });

  const primaryAction = (paymentStatus === 'PAYE' || isPrepaid) ? onPaymentSuccess : handlePaymentComplete;

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-black overflow-x-hidden">
      {/* Confetti Container */}
      <div ref={confettiContainerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden" />

      <CompleteHeader
        localTrip={localTrip}
        role={role}
        isRefreshing={isRefreshing}
        onGoBack={handleGoBack}
        onGoHome={handleGoHome}
        onRefresh={refreshTripData}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <SuccessBanner />

        <TripInfoCard tripData={tripData} currentTime={currentTime} />

        <PaymentSection
          role={role}
          paymentStatus={paymentStatus}
          isPrepaid={isPrepaid}
          finalIsPrepaid={finalIsPrepaid}
          isProcessing={isProcessing}
          waitingForDriverConfirmation={waitingForDriverConfirmation}
          selectedPayment={selectedPayment}
          onSelectPaymentMethod={handlePaymentMethodSelect}
          phoneNumber={phoneNumber}
          onPhoneNumberChange={setPhoneNumber}
          otpValues={otpValues}
          otpRefs={otpRefs}
          otpTimer={otpTimer}
          onOtpChange={handleOtpChange}
          onOtpKeyDown={handleOtpKeyDown}
          totalAmount={totalAmount}
          driverName={tripData?.driver}
          onReportProblem={handleReportProblem}
          onPrimaryAction={primaryAction}
        />

        {/* Informations supplémentaires (PASSAGER UNIQUEMENT) */}
        {role === 'passenger' && (
          <NextStepsCards onViewHistory={handleViewHistory} onNewBooking={handleNewBooking} />
        )}
      </main>

      <CompleteFooter />

      {/* Suggestion 1: Modal de confirmation personnalisé */}
      <DriverConfirmModal
        show={showConfirmModal}
        totalAmount={totalAmount}
        onConfirm={handleDriverConfirmPayment}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default TripComplete;

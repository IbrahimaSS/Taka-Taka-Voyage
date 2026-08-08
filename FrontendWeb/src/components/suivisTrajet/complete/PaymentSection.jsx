import { motion, AnimatePresence } from 'framer-motion';
import PaymentMethodGrid from './PaymentMethodGrid';
import OrangeMoneyForm from './OrangeMoneyForm';
import CashPaymentInfo from './CashPaymentInfo';
import PaymentStatusBanners from './PaymentStatusBanners';
import PaymentActionsBar from './PaymentActionsBar';

const PaymentSection = ({
  role,
  paymentStatus,
  isPrepaid,
  finalIsPrepaid,
  isProcessing,
  waitingForDriverConfirmation,
  selectedPayment,
  onSelectPaymentMethod,
  phoneNumber,
  onPhoneNumberChange,
  otpValues,
  otpRefs,
  otpTimer,
  onOtpChange,
  onOtpKeyDown,
  totalAmount,
  driverName,
  onReportProblem,
  onPrimaryAction,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-8 mb-8 border border-white/20 dark:border-white/5 shadow-2xl"
  >
    {role === 'passenger' && paymentStatus !== 'PAYE' && !finalIsPrepaid && (
      <>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Choisissez votre mode de paiement</h2>

        <PaymentMethodGrid selectedPayment={selectedPayment} onSelect={onSelectPaymentMethod} />

        {/* Formulaires Conditionnels */}
        <AnimatePresence mode="wait">
          {selectedPayment === 'orange' && (
            <OrangeMoneyForm
              phoneNumber={phoneNumber}
              onPhoneNumberChange={onPhoneNumberChange}
              otpValues={otpValues}
              otpRefs={otpRefs}
              otpTimer={otpTimer}
              onOtpChange={onOtpChange}
              onOtpKeyDown={onOtpKeyDown}
            />
          )}

          {selectedPayment === 'cash' && (
            <CashPaymentInfo totalAmount={totalAmount} driverName={driverName} />
          )}
        </AnimatePresence>
      </>
    )}

    <PaymentStatusBanners
      role={role}
      paymentStatus={paymentStatus}
      isPrepaid={isPrepaid}
      isProcessing={isProcessing}
      waitingForDriverConfirmation={waitingForDriverConfirmation}
    />

    <PaymentActionsBar
      role={role}
      paymentStatus={paymentStatus}
      isPrepaid={isPrepaid}
      isProcessing={isProcessing}
      onReportProblem={onReportProblem}
      onPrimaryAction={onPrimaryAction}
    />
  </motion.div>
);

export default PaymentSection;

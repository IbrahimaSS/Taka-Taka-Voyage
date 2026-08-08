import { useState } from 'react';

export const useCancelTrip = (onCancel) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancel?.({ reason: cancelReason });
      setCancelReason("");
      setShowCancelConfirm(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const closeCancelConfirm = () => {
    setShowCancelConfirm(false);
    setCancelReason("");
  };

  return {
    showCancelConfirm, setShowCancelConfirm,
    cancelReason, setCancelReason,
    isCancelling,
    handleCancel,
    closeCancelConfirm,
  };
};

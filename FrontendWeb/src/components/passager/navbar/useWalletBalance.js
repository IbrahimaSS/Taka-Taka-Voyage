import { useState, useEffect } from 'react';
import { usePassenger } from '../../../context/PassengerContext';
import { PaymentService } from '../../../services/paymentService';

export const useWalletBalance = () => {
  const { passenger } = usePassenger();
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (passenger) {
      PaymentService.checkWalletBalance(passenger.id || passenger._id)
        .then(res => setWalletBalance(res.balance))
        .catch(err => console.error("Erreur fetch wallet nav:", err));
    }
  }, [passenger]);

  return walletBalance;
};

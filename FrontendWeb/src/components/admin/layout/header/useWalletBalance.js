import { useState, useEffect } from 'react';
import { PaymentService } from '../../../../services/paymentService';
import { ROLES } from '../../../../config/navConfig';

// Récupérer le solde réel au chargement (pour le Chauffeur)
export const useWalletBalance = ({ role, user }) => {
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (role === ROLES.CHAUFFEUR && user) {
      PaymentService.checkWalletBalance(user.id || user._id)
        .then(res => setWalletBalance(res.balance))
        .catch(err => console.error("Erreur fetch wallet nav:", err));
    }
  }, [role, user]);

  return walletBalance;
};

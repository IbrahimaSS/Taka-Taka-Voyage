// services/paymentService.js
import apiClient from './apiClient';

export class PaymentService {
  // Simulation des paiements mobile money
  static async processMobileMoneyPayment(amount, phoneNumber, operator) {
    console.log(`Processing ${operator} payment of ${amount} GNF to ${phoneNumber}`);
    
    // Simulation d'API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simuler une réponse d'API
        const isSuccess = Math.random() > 0.1; // 90% de succès
        
        if (isSuccess) {
          resolve({
            success: true,
            transactionId: `PMT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            amount: amount,
            operator: operator,
            phoneNumber: phoneNumber,
            timestamp: new Date().toISOString(),
            message: 'Paiement effectué avec succès'
          });
        } else {
          reject({
            success: false,
            errorCode: 'PAYMENT_FAILED',
            message: 'Échec du paiement. Veuillez réessayer.'
          });
        }
      }, 2000);
    });
  }

  // Simulation paiement par carte
  static async processCardPayment(amount, cardDetails) {
    console.log(`Processing card payment of ${amount} GNF`);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const isSuccess = Math.random() > 0.05; // 95% de succès
        
        if (isSuccess) {
          resolve({
            success: true,
            transactionId: `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            amount: amount,
            last4: cardDetails.number.slice(-4),
            timestamp: new Date().toISOString(),
            message: 'Paiement par carte effectué'
          });
        } else {
          reject({
            success: false,
            errorCode: 'CARD_DECLINED',
            message: 'Carte refusée. Veuillez vérifier vos informations.'
          });
        }
      }, 3000);
    });
  }

  // Vérifier le solde du portefeuille
  static async checkWalletBalance(userId) {
    try {
      const response = await apiClient.get('/wallet/solde');
      return {
        balance: response.data.solde,
        currency: 'GNF',
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error("Erreur solde wallet:", error);
      throw error;
    }
  }

  // Débiter le portefeuille (lors du paiement d'un trajet)
  // Note: On pourrait aussi utiliser une route dédiée au paiement de trajet
  static async debitWallet(userId, amount) {
    try {
      // Pour l'instant, on simule le débit côté frontend car le vrai débit se fait 
      // lors de la confirmation de réservation au backend.
      // Mais on peut appeler une route de pré-vérification si besoin.
      return {
        success: true,
        amount: amount
      };
    } catch (error) {
       throw error;
    }
  }

  // Nouvelles méthodes pour le Wallet Hub
  static async getHistorique() {
    const response = await apiClient.get('/wallet/historique');
    return response.data;
  }

  static async deposer(montant, methode, reference) {
    const response = await apiClient.post('/wallet/depoter', { montant, methode, referenceExterne: reference });
    return response.data;
  }

  static async envoyerOTP() {
    const response = await apiClient.post('/wallet/envoyer-otp');
    return response.data;
  }

  static async retirer(montant, methode, numero, otp) {
    const response = await apiClient.post('/wallet/retirer', { montant, methode, numeroMobileMoney: numero, otp });
    return response.data;
  }

  static async transferer(telephone, montant) {
    const response = await apiClient.post('/wallet/transferer', { destinataireTel: telephone, montant });
    return response.data;
  }
}
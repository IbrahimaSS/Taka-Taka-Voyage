// services/paymentService.js
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
    // Simulation de vérification de solde
    return {
      balance: 45500,
      currency: 'GNF',
      lastUpdated: new Date().toISOString()
    };
  }

  // Débiter le portefeuille
  static async debitWallet(userId, amount) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          success: true,
          newBalance: 45500 - amount,
          transactionId: `WALLET-${Date.now()}`,
          amount: amount
        });
      }, 1000);
    });
  }
}
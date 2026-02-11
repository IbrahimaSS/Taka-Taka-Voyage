// PaymentModal.jsx - Version fonctionnelle
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Smartphone, CreditCard, Wallet, Loader, Shield, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
 import { paymentService } from '../../services/paymentService';

const PaymentModal = ({ isOpen, onClose, onSuccess, amount, tripDetails, user }) => {
  const [selectedMethod, setSelectedMethod] = useState('orange_money');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [walletBalance, setWalletBalance] = useState(null);

  const paymentMethods = [
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: Smartphone,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Paiement instantané',
      requiresPhone: true
    },
    {
      id: 'mtn_money',
      name: 'MTN Mobile Money',
      icon: Smartphone,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Paiement instantané',
      requiresPhone: true
    },
    {
      id: 'wallet',
      name: 'Portefeuille TakaTaka',
      icon: Wallet,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Solde disponible',
      requiresPhone: false
    },
    {
      id: 'card',
      name: 'Carte bancaire',
      icon: CreditCard,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Visa / Mastercard',
      requiresPhone: false
    },
  ];

 const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const reservationId = tripDetails?.reservationId;
      if (!reservationId) {
        throw new Error('Réservation introuvable pour le paiement');
      }

      if ((selectedMethod === 'orange_money' || selectedMethod === 'mtn_money') && !validatePhoneNumber(phoneNumber)) {
        throw new Error('Numéro de téléphone invalide');
      }

      if (selectedMethod === 'card' && !validateCard()) {
        throw new Error('Informations carte incomplètes');
      }

      const methodMap = {
        orange_money: 'OM',
        mtn_money: 'MM',
        wallet: 'WALLET',
        card: 'CARD',
      };

      const res = await paymentService.initier({
        reservationId,
        methode: methodMap[selectedMethod],
        telephone: String(phoneNumber || '').replace(/\s/g, ''),
      });

      toast.success('Paiement initié avec succès !');
      setTimeout(() => {
        onSuccess({
          reservationId,
          reference: res?.data?.reference,
          paymentMethod: selectedMethod,
          amount,
        });
      }, 1200);
    } catch (error) {
      toast.error(error.message || 'Erreur lors du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  const validatePhoneNumber = (number) => {
    // Validation pour numéros guinéens
    const guineanRegex = /^(?:\+224|0)?[6-7]\d{8}$/;
    return guineanRegex.test(number.replace(/\s/g, ''));
  };

  const validateCard = () => {
    if (cardDetails.number.length !== 16) return false;
    if (!cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) return false;
    if (cardDetails.cvv.length !== 3) return false;
    return true;
  };

  const renderPaymentForm = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod);

    switch (selectedMethod) {
      case 'orange_money':
      case 'mtn_money':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ex: +224 623 09 07 41"
                className="passenger-input w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              {phoneNumber && !validatePhoneNumber(phoneNumber) && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Format de numéro invalide
                </p>
              )}
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 Vous recevrez une demande de confirmation sur votre téléphone.
                Veuillez entrer votre code PIN pour confirmer le paiement.
              </p>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de carte
              </label>
              <input
                type="text"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '') })}
                placeholder="1234 5678 9012 3456"
                maxLength="16"
                className="passenger-input w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date d'expiration
                </label>
                <input
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setCardDetails({ ...cardDetails, expiry: value });
                  }}
                  placeholder="MM/AA"
                  maxLength="5"
                  className="passenger-input w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                  placeholder="123"
                  maxLength="3"
                  className="passenger-input w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom sur la carte
              </label>
              <input
                type="text"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                placeholder="John Doe"
                className="passenger-input w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl text-center border border-green-100 dark:border-green-800/30">
              <Wallet className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {walletBalance?.toLocaleString() || '--'} GNF
              </p>
              <p className="text-gray-600 dark:text-gray-400">Solde disponible</p>
            </div>
            {walletBalance && walletBalance < amount && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800/30">
                <p className="text-red-700 dark:text-red-400 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Solde insuffisant. Veuillez recharger ou choisir un autre moyen de paiement.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="passenger-glass dark:bg-gray-900/95 max-w-md w-full h-full rounded-2xl scroll-m-t-2 overflow-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Paiement sécurisé
            </h2>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center disabled:opacity-50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Montant à payer */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 mb-6 border border-green-100 dark:border-green-800/30">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Montant à payer</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-500 my-2">
                {amount.toLocaleString()} GNF
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pour votre trajet vers {tripDetails?.destination}</p>
            </div>
          </div>

          {/* Méthodes de paiement */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Choisissez votre moyen de paiement
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    disabled={isProcessing}
                    className={`p-3 rounded-xl border-2 transition-all ${selectedMethod === method.id
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-400'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex flex-col items-center">
                      <Icon className={`w-6 h-6 ${method.color} mb-2`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{method.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{method.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formulaire spécifique */}
          {renderPaymentForm()}

          {/* Bouton de paiement */}
          <button
            onClick={handlePayment}
            disabled={isProcessing ||
              (selectedMethod === 'wallet' && walletBalance && walletBalance < amount) ||
              (selectedMethod.includes('money') && !validatePhoneNumber(phoneNumber)) ||
              (selectedMethod === 'card' && !validateCard())
            }
            className="w-full passenger-btn-primary py-3 mt-6 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Payer {amount.toLocaleString()} GNF
              </>
            )}
          </button>

          {/* Sécurité */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center">
              <Shield className="w-4 h-4 mr-1" />
              Paiement 100% sécurisé • Données cryptées
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;


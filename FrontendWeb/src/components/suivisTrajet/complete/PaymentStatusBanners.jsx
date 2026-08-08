import { motion } from 'framer-motion';
import { ShieldCheck, Clock, CheckCircle } from 'lucide-react';

const PaymentStatusBanners = ({ role, paymentStatus, isPrepaid, isProcessing, waitingForDriverConfirmation }) => (
  <>
    {/* Message si déjà payé à l'avance (Passager uniquement pour éviter les doublons chauffeur) */}
    {paymentStatus === 'PAYE' && role === 'passenger' && (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Paiement déjà effectué</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Ce trajet a été réglé à l'avance. Merci pour votre confiance !
        </p>
      </div>
    )}

    {/* Vue spécifique Chauffeur (En attente confirmation) */}
    {role === 'driver' && paymentStatus !== 'PAYE' && !isPrepaid && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8 mb-8 text-center"
      >
        <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Paiement en cours</h2>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          {isProcessing
            ? "Validation en cours... ⏳"
            : waitingForDriverConfirmation
              ? "💰 Le passager a validé le paiement ! Veuillez cliquer sur le bouton ci-dessous pour confirmer la réception du montant."
              : "Le passager règle son trajet. Vous pourrez confirmer dès qu'il aura validé son paiement de son côté."}
        </p>
      </motion.div>
    )}

    {/* Message Succès Chauffeur */}
    {role === 'driver' && (paymentStatus === 'PAYE' || isPrepaid) && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 mb-8 text-center"
      >
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Paiement déjà réglé !</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {isPrepaid
            ? "Ce trajet a été payé d'avance par le passager via la plateforme. Votre commission a été prélevée."
            : "Le paiement a été validé avec succès. Vous pouvez maintenant accepter de nouvelles courses."}
        </p>
      </motion.div>
    )}
  </>
);

export default PaymentStatusBanners;
